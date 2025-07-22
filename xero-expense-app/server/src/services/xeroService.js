const { XeroClient } = require('xero-node');
const pool = require('../../config/database');

class XeroService {
  constructor() {
    this.client = new XeroClient({
      clientId: process.env.XERO_CLIENT_ID,
      clientSecret: process.env.XERO_CLIENT_SECRET,
      redirectUris: [process.env.XERO_REDIRECT_URI],
      scopes: ['offline_access', 'accounting.transactions.read', 'accounting.attachments']
    });
  }

  async getAuthorizationUrl(userId) {
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    return this.client.buildConsentUrl(state);
  }

  async handleCallback(code, state) {
    try {
      const tokenSet = await this.client.apiCallback(code);
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
      
      // Store token set in database
      const result = await pool.query(
        'INSERT INTO xero_connections (user_id, xero_tenant_id, token_set) VALUES ($1, $2, $3) ON CONFLICT (xero_tenant_id) DO UPDATE SET token_set = $3, updated_at = NOW() RETURNING *',
        [decodedState.userId, tokenSet.tenants[0].tenantId, tokenSet]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error handling Xero callback:', error);
      throw error;
    }
  }

  async refreshTokenIfNeeded(userId) {
    const connection = await pool.query(
      'SELECT * FROM xero_connections WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    if (!connection.rows[0]) {
      throw new Error('No active Xero connection found');
    }

    const tokenSet = connection.rows[0].token_set;
    const expiresAt = new Date(tokenSet.expires_at * 1000);
    const now = new Date();
    const safetyMargin = 5 * 60 * 1000; // 5 minutes

    if (expiresAt.getTime() - now.getTime() < safetyMargin) {
      try {
        const newTokenSet = await this.client.refreshToken(tokenSet.refresh_token);
        
        // Update token set atomically
        await pool.query(
          'UPDATE xero_connections SET token_set = $1, updated_at = NOW() WHERE user_id = $2',
          [newTokenSet, userId]
        );
        
        return newTokenSet;
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    }

    return tokenSet;
  }

  async getBankTransactions(userId, dateRange) {
    const tokenSet = await this.refreshTokenIfNeeded(userId);
    this.client.setTokenSet(tokenSet);

    const where = `Date >= DateTime(${dateRange.start}) AND Date < DateTime(${dateRange.end})`;
    
    try {
      const response = await this.client.accountingApi.getBankTransactions(
        tokenSet.tenants[0].tenantId,
        undefined,
        where
      );
      
      return response.body.bankTransactions;
    } catch (error) {
      console.error('Error fetching bank transactions:', error);
      throw error;
    }
  }

  async attachReceiptToTransaction(tenantId, bankTransactionId, receiptBuffer, filename) {
    try {
      await this.client.accountingApi.createAttachment(
        tenantId,
        'BankTransactions',
        bankTransactionId,
        receiptBuffer,
        filename
      );
      return true;
    } catch (error) {
      console.error('Error attaching receipt:', error);
      throw error;
    }
  }
}

module.exports = new XeroService();
