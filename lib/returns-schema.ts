import { sql } from "@/lib/database"

/**
 * Ensures that the return_requests, return_request_items, and return_request_images
 * database tables exist with correct columns and constraints.
 */
export async function ensureReturnTablesExist() {
  try {
    // 1. Create return_requests table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS return_requests (
        id SERIAL PRIMARY KEY,
        ecommerce_return_request_id VARCHAR(100) UNIQUE NOT NULL,
        order_id INTEGER NOT NULL,
        order_number VARCHAR(50) NOT NULL,
        user_id TEXT NOT NULL,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        reason TEXT,
        notes TEXT,
        accounting_sync_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        images JSONB DEFAULT '[]'::jsonb,
        items JSONB DEFAULT '[]'::jsonb,
        customer_id TEXT,
        sale_id TEXT,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewed_by TEXT,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Safe ALTER TABLE commands to add any missing columns in existing neondb tables
    await sql`ALTER TABLE return_requests ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;`
    await sql`ALTER TABLE return_requests ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;`
    await sql`ALTER TABLE return_requests ADD COLUMN IF NOT EXISTS customer_id TEXT;`
    await sql`ALTER TABLE return_requests ADD COLUMN IF NOT EXISTS sale_id TEXT;`
    await sql`ALTER TABLE return_requests ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`
    await sql`ALTER TABLE return_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;`
    await sql`ALTER TABLE return_requests ADD COLUMN IF NOT EXISTS reviewed_by TEXT;`
    await sql`ALTER TABLE return_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;`

    // Indexes for return_requests
    await sql`CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON return_requests(user_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON return_requests(order_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status);`

    // 2. Create return_request_items table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS return_request_items (
        id SERIAL PRIMARY KEY,
        return_request_id INTEGER NOT NULL,
        order_item_id INTEGER NOT NULL,
        product_id INTEGER,
        product_variant_id INTEGER,
        variant_id INTEGER,
        variant_name VARCHAR(255),
        product_name VARCHAR(255) NOT NULL,
        product_image_url TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(10,2) DEFAULT 0.00,
        unit_price DECIMAL(10,2) DEFAULT 0.00,
        reason VARCHAR(255) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Safe ALTER TABLE commands to add any missing columns in return_request_items
    await sql`ALTER TABLE return_request_items ADD COLUMN IF NOT EXISTS product_variant_id INTEGER;`
    await sql`ALTER TABLE return_request_items ADD COLUMN IF NOT EXISTS variant_id INTEGER;`
    await sql`ALTER TABLE return_request_items ADD COLUMN IF NOT EXISTS variant_name VARCHAR(255);`
    await sql`ALTER TABLE return_request_items ADD COLUMN IF NOT EXISTS product_image_url TEXT;`
    await sql`ALTER TABLE return_request_items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;`
    await sql`ALTER TABLE return_request_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0.00;`
    await sql`ALTER TABLE return_request_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`

    // Indexes for return_request_items
    await sql`CREATE INDEX IF NOT EXISTS idx_return_request_items_request_id ON return_request_items(return_request_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_return_request_items_order_item_id ON return_request_items(order_item_id);`

    // 3. Create return_request_images table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS return_request_images (
        id SERIAL PRIMARY KEY,
        return_request_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_return_request_images_request_id ON return_request_images(return_request_id);`

    console.log("✅ Return request database tables verified successfully for neondb.")
  } catch (error) {
    console.error("Error setting up return request tables:", error)
    throw error
  }
}
