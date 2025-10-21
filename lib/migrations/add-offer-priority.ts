import { sql } from "@/lib/database"

/**
 * Adds priority system to offers table for controlling offer selection order
 */
export async function addOfferPriority() {
  try {
    console.log('Adding priority column to offers table...');
    
    // Add priority column (higher number = higher priority)
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'offers' AND column_name = 'priority'
        ) THEN
          ALTER TABLE offers ADD COLUMN priority INTEGER DEFAULT 0;
        END IF;
      END $$;
    `
    
    // Create index for better performance on priority ordering
    await sql`
      CREATE INDEX IF NOT EXISTS idx_offers_priority_date 
      ON offers(priority DESC, created_at DESC, is_active)
    `
    
    console.log('✅ Priority column and index added successfully');
    
    // Set default priorities based on creation date (newest = higher priority)
    await sql`
      UPDATE offers 
      SET priority = CASE 
        WHEN priority IS NULL OR priority = 0 THEN 
          EXTRACT(EPOCH FROM created_at)::INTEGER / 86400
        ELSE priority 
      END
    `
    
    console.log('✅ Default priorities set based on creation date');
    
  } catch (error) {
    console.error('❌ Error adding offer priority:', error);
    throw error;
  }
}
