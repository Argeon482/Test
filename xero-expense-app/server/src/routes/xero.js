const express = require('express');
const router = express.Router();
const xeroService = require('../services/xeroService');

// Get Xero authorization URL
router.get('/auth', async (req, res) => {
  try {
    const { userId } = req.query;
    const authUrl = await xeroService.getAuthorizationUrl(userId);
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

// Handle Xero callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const connection = await xeroService.handleCallback(code, state);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?connected=true`);
  } catch (error) {
    console.error('Error handling callback:', error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=connection_failed`);
  }
});

// Get bank transactions
router.get('/transactions', async (req, res) => {
  try {
    const { userId } = req.query;
    const { startDate, endDate } = req.query;
    
    const dateRange = {
      start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: endDate || new Date().toISOString()
    };
    
    const transactions = await xeroService.getBankTransactions(userId, dateRange);
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
