import { sql } from "@/lib/database"

/**
 * Ensures offer restrictions capability by updating the offers table structure
 * to support comprehensive offer restrictions including minimum order value,
 * usage limits, product category restrictions, shop-specific offers, and 100% off protection.
 */
export async function ensureOfferRestrictions() {
  // Add minimum_order_value column
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'minimum_order_value'
      ) THEN
        ALTER TABLE offers ADD COLUMN minimum_order_value DECIMAL(10,2) DEFAULT 0;
      END IF;
    END $$;
  `

  // Add maximum_order_value column (for 100% off protection)
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'maximum_order_value'
      ) THEN
        ALTER TABLE offers ADD COLUMN maximum_order_value DECIMAL(10,2) DEFAULT NULL;
      END IF;
    END $$;
  `

  // Add usage_limit_per_user column
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'usage_limit_per_user'
      ) THEN
        ALTER TABLE offers ADD COLUMN usage_limit_per_user INTEGER DEFAULT NULL;
      END IF;
    END $$;
  `

  // Add total_usage_limit column
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'total_usage_limit'
      ) THEN
        ALTER TABLE offers ADD COLUMN total_usage_limit INTEGER DEFAULT NULL;
      END IF;
    END $$;
  `

  // Add allowed_categories column (JSON array of category IDs)
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'allowed_categories'
      ) THEN
        ALTER TABLE offers ADD COLUMN allowed_categories TEXT DEFAULT NULL;
      END IF;
    END $$;
  `

  // Add excluded_categories column (JSON array of category IDs)
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'excluded_categories'
      ) THEN
        ALTER TABLE offers ADD COLUMN excluded_categories TEXT DEFAULT NULL;
      END IF;
    END $$;
  `

  // Add shop_restriction column ('A', 'B', or NULL for both)
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'shop_restriction'
      ) THEN
        ALTER TABLE offers 
        ADD COLUMN shop_restriction VARCHAR(1) DEFAULT NULL 
        CHECK (shop_restriction IN ('A', 'B') OR shop_restriction IS NULL);
      END IF;
    END $$;
  `

  // Add user_type_restriction column ('new', 'returning', or NULL for all)
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'user_type_restriction'
      ) THEN
        ALTER TABLE offers 
        ADD COLUMN user_type_restriction VARCHAR(20) DEFAULT NULL 
        CHECK (user_type_restriction IN ('new', 'returning') OR user_type_restriction IS NULL);
      END IF;
    END $$;
  `

  // Add is_active column
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'is_active'
      ) THEN
        ALTER TABLE offers ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
      END IF;
    END $$;
  `

  // Create offer_usage tracking table
  await sql`
    CREATE TABLE IF NOT EXISTS offer_usage (
      id SERIAL PRIMARY KEY,
      offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
      user_email VARCHAR(255),
      user_id VARCHAR(255),
      order_id VARCHAR(255),
      usage_count INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  // Create index for better performance
  await sql`
    CREATE INDEX IF NOT EXISTS idx_offer_usage_offer_user 
    ON offer_usage(offer_id, user_email);
  `

  console.log("Offer restrictions migration completed successfully")
}
