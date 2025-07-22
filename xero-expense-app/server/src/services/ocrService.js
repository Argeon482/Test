const axios = require('axios');
const sharp = require('sharp');

class OCRService {
  async processReceipt(imageBuffer) {
    try {
      // Optimize image for OCR
      const optimizedImage = await sharp(imageBuffer)
        .resize(2000, null, { withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();

      // Use OCR.space API for text extraction
      const formData = new FormData();
      formData.append('apikey', process.env.OCR_API_KEY);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('filetype', 'jpg');
      formData.append('image', optimizedImage, { filename: 'receipt.jpg' });

      const response = await axios.post(process.env.OCR_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      if (response.data.IsErroredOnProcessing) {
        throw new Error('OCR processing failed');
      }

      const extractedText = response.data.ParsedResults[0].ParsedText;
      return this.parseReceiptData(extractedText);
    } catch (error) {
      console.error('OCR processing error:', error);
      throw error;
    }
  }

  parseReceiptData(text) {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract merchant name (usually first few lines)
    const merchantName = this.extractMerchantName(lines);
    
    // Extract date
    const date = this.extractDate(text);
    
    // Extract total amount
    const total = this.extractTotal(lines);
    
    return {
      merchantName,
      date,
      total,
      rawText: text,
      lineItems: this.extractLineItems(lines)
    };
  }

  extractMerchantName(lines) {
    // Look for merchant name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line && !this.isDate(line) && !this.isAmount(line)) {
        return line;
      }
    }
    return 'Unknown Merchant';
  }

  extractDate(text) {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/g,
      /(\d{1,2}-\d{1,2}-\d{2,4})/g,
      /(\d{4}-\d{2}-\d{2})/g
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return new Date(match[1]);
      }
    }
    return new Date();
  }

  extractTotal(lines) {
    // Look for total amount in last few lines
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
      const line = lines[i].trim();
      const amount = this.extractAmount(line);
      if (amount && amount > 0) {
        return amount;
      }
    }
    return 0;
  }

  extractAmount(text) {
    const amountPattern = /[\$]?(\d+\.\d{2})/g;
    const matches = text.match(amountPattern);
    if (matches) {
      return parseFloat(matches[matches.length - 1].replace('$', ''));
    }
    return null;
  }

  extractLineItems(lines) {
    const lineItems = [];
    for (const line of lines) {
      const amount = this.extractAmount(line);
      if (amount && amount > 0) {
        lineItems.push({
          description: line.replace(/[\$]?\d+\.\d{2}/g, '').trim(),
          amount: amount
        });
      }
    }
    return lineItems;
  }

  isDate(text) {
    return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text);
  }

  isAmount(text) {
    return /[\$]?\d+\.\d{2}/.test(text);
  }
}

module.exports = new OCRService();
