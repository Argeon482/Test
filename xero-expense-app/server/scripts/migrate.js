const pool = require('../config/database');

const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Xero connections table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS xero_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        xero_tenant_id UUID UNIQUE NOT NULL,
        xero_tenant_name VARCHAR(255),
        token_set JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Receipts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        upload_timestamp TIMESTAMPTZ DEFAULT NOW(),
        ocr_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        extracted_data JSONB,
        match_status VARCHAR(50) NOT NULL DEFAULT 'unmatched',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Matched pairs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS matched_pairs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
        xero_bank_transaction_id UUID NOT NULL,
        match_confidence_score NUMERIC(5,4),
        match_method VARCHAR(50),
        matched_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
      CREATE INDEX IF NOT EXISTS idx_receipts_ocr_status ON receipts(ocr_status);
      CREATE INDEX IF NOT EXISTS idx_receipts_match_status ON receipts(match_status);
      CREATE INDEX IF NOT EXISTS idx_xero_connections_user_id ON xero_connections(user_id);
      CREATE INDEX IF NOT EXISTS idx_matched_pairs_receipt_id ON matched_pairs(receipt_id);
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

createTables().then(() => {
  console.log('Migration completed');
  process.exit(0);
});
