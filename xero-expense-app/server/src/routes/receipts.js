const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pool = require('../../config/database');
const ocrService = require('../services/ocrService');
const matchingService = require('../services/matchingService');
const xeroService = require('../services/xeroService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Upload receipt
router.post('/upload', upload.single('receipt'), async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create receipt record
    const receiptResult = await pool.query(
      'INSERT INTO receipts (user_id, file_name, file_path, ocr_status) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, file.originalname, file.path, 'processing']
    );

    const receipt = receiptResult.rows[0];

    // Process OCR asynchronously
    processReceiptAsync(receipt.id, file.path);

    res.json({ 
      message: 'Receipt uploaded successfully',
      receiptId: receipt.id 
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ error: 'Failed to upload receipt' });
  }
});

// Process receipt asynchronously
async function processReceiptAsync(receiptId, filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    // Extract data using OCR
    const extractedData = await ocrService.processReceipt(fileBuffer);
    
    // Update receipt with extracted data
    await pool.query(
      'UPDATE receipts SET extracted_data = $1, ocr_status = $2 WHERE id = $3',
      [extractedData, 'complete', receiptId]
    );

    // Find matching transaction
    await findAndMatchTransaction(receiptId, extractedData);
  } catch (error) {
    console.error('Error processing receipt:', error);
    await pool.query(
      'UPDATE receipts SET ocr_status = $1 WHERE id = $2',
      ['failed', receiptId]
    );
  }
}

// Find and match transaction
async function findAndMatchTransaction(receiptId, extractedData) {
  try {
    // Get user's Xero connection
    const receipt = await pool.query('SELECT user_id FROM receipts WHERE id = $1', [receiptId]);
    const userId = receipt.rows[0].user_id;
    
    // Get bank transactions from Xero
    const dateRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    };
    
    const transactions = await xeroService.getBankTransactions(userId, dateRange);
    
    // Find best match
    const matchResult = await matchingService.findBestMatch(extractedData, transactions);
    
    if (matchResult.match && matchResult.confidence >= 0.75) {
      // Auto-match
      await autoMatchReceipt(receiptId, matchResult);
    } else {
      // Flag for manual review
      await pool.query(
        'UPDATE receipts SET match_status = $1 WHERE id = $2',
        ['manual_review_required', receiptId]
      );
    }
  } catch (error) {
    console.error('Error matching transaction:', error);
  }
}

// Auto-match receipt to transaction
async function autoMatchReceipt(receiptId, matchResult) {
  try {
    const receipt = await pool.query('SELECT * FROM receipts WHERE id = $1', [receiptId]);
    const fileBuffer = fs.readFileSync(receipt.rows[0].file_path);
    
    // Attach receipt to Xero transaction
    await xeroService.attachReceiptToTransaction(
      matchResult.match.tenantId,
      matchResult.match.bankTransactionId,
      fileBuffer,
      receipt.rows[0].file_name
    );
    
    // Update receipt status
    await pool.query(
      'UPDATE receipts SET match_status = $1 WHERE id = $2',
      ['matched', receiptId]
    );
    
    // Create matched pair record
    await pool.query(
      'INSERT INTO matched_pairs (receipt_id, xero_bank_transaction_id, match_confidence_score, match_method) VALUES ($1, $2, $3, $4)',
      [receiptId, matchResult.match.bankTransactionId, matchResult.confidence, matchResult.method]
    );
  } catch (error) {
    console.error('Error auto-matching receipt:', error);
  }
}

// Get user's receipts
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM receipts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json({ receipts: result.rows });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

module.exports = router;
