import { sql } from '@/lib/database'

export async function ensureCurrencySpecificRestrictions() {
  console.log('🌍 Adding currency-specific restriction columns...')

  // Add minimum_order_value_aed column
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'minimum_order_value_aed'
      ) THEN
        ALTER TABLE offers ADD COLUMN minimum_order_value_aed DECIMAL(10,2) DEFAULT NULL;
      END IF;
    END $$;
  `

  // Add minimum_order_value_inr column
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'minimum_order_value_inr'
      ) THEN
        ALTER TABLE offers ADD COLUMN minimum_order_value_inr DECIMAL(10,2) DEFAULT NULL;
      END IF;
    END $$;
  `

  // Add maximum_order_value_aed column
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'maximum_order_value_aed'
      ) THEN
        ALTER TABLE offers ADD COLUMN maximum_order_value_aed DECIMAL(10,2) DEFAULT NULL;
      END IF;
    END $$;
  `

  // Add maximum_order_value_inr column
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' AND column_name = 'maximum_order_value_inr'
      ) THEN
        ALTER TABLE offers ADD COLUMN maximum_order_value_inr DECIMAL(10,2) DEFAULT NULL;
      END IF;
    END $$;
  `

  // Migrate existing data from old columns to new currency-specific columns
  // Only migrate if the new columns are empty (haven't been migrated yet)
  await sql`
    UPDATE offers 
    SET 
      minimum_order_value_aed = minimum_order_value,
      minimum_order_value_inr = CASE 
        WHEN minimum_order_value IS NOT NULL 
        THEN minimum_order_value * 22 -- Convert AED to approximate INR
        ELSE NULL 
      END,
      maximum_order_value_aed = maximum_order_value,
      maximum_order_value_inr = CASE 
        WHEN maximum_order_value IS NOT NULL 
        THEN maximum_order_value * 22 -- Convert AED to approximate INR
        ELSE NULL 
      END
    WHERE (minimum_order_value IS NOT NULL OR maximum_order_value IS NOT NULL)
      AND (minimum_order_value_aed IS NULL AND minimum_order_value_inr IS NULL 
           AND maximum_order_value_aed IS NULL AND maximum_order_value_inr IS NULL);
  `

  console.log('✅ Currency-specific restriction columns added successfully!')
}
