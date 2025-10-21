import { sql } from "@/lib/database"

/**
 * Ensures offer type capability by updating the offers table structure
 * to support both percentage and cash (AED) offer types.
 * This migration is idempotent and can be run multiple times safely.
 */
export async function ensureOfferTypeSupport() {
  // Create the offers table if it doesn't exist
  await sql`
    CREATE TABLE IF NOT EXISTS offers (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      offers TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  // Add updated_at column if it doesn't exist
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'updated_at'
      ) THEN
        ALTER TABLE offers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      END IF;
    END $$;
  `

  // Add offer_type column if it doesn't exist
  // This column will store 'percentage' or 'cash' to indicate the offer type
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'offer_type'
      ) THEN
        ALTER TABLE offers 
        ADD COLUMN offer_type VARCHAR(20) DEFAULT 'percentage' 
        CHECK (offer_type IN ('percentage', 'cash'));
      END IF;
    END $$;
  `

  // Update existing records to have default offer_type
  await sql`
    UPDATE offers 
    SET offer_type = 'percentage'
    WHERE offer_type IS NULL;
  `

  // Create index for better performance on offer_type queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_offers_offer_type 
    ON offers(offer_type);
  `

  // Create index for date range queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_offers_date_range 
    ON offers(start_date, end_date);
  `
}