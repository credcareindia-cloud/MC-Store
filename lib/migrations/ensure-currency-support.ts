import { sql } from "@/lib/database"

/**
 * Ensures currency capability by updating the products table structure
 * to support AED and INR currencies with their respective prices.
 * This migration is idempotent and can be run multiple times safely.
 */
export async function ensureCurrencySupport() {
  // Add price_aed column if it doesn't exist
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'price_aed'
      ) THEN
        ALTER TABLE products ADD COLUMN price_aed DECIMAL(10,2);
      END IF;
    END $$;
  `

  // Add price_inr column if it doesn't exist
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'price_inr'
      ) THEN
        ALTER TABLE products ADD COLUMN price_inr DECIMAL(10,2);
      END IF;
    END $$;
  `

  // Add default_currency column if it doesn't exist
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'default_currency'
      ) THEN
        ALTER TABLE products 
        ADD COLUMN default_currency VARCHAR(3) DEFAULT 'AED' 
        CHECK (default_currency IN ('AED', 'INR'));
      END IF;
    END $$;
  `

  // Create index for better performance on currency queries
  await sql`
    CREATE INDEX IF NOT EXISTS idx_products_default_currency 
    ON products(default_currency);
  `

  // Update existing records to use the current price as AED price
  // and set default currency to AED
  await sql`
    UPDATE products 
    SET price_aed = price, default_currency = 'AED'
    WHERE price_aed IS NULL AND price > 0;
  `
}
