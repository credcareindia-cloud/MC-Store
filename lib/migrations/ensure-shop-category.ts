import { sql } from "@/lib/database"

/**
 * Ensures "shop_category" column exists on the "products" table.
 * The `IF NOT EXISTS` clause makes this idempotent and extremely fast,
 * so we can call it on every request if needed.
 */
export async function ensureShopCategoryColumn() {
  await sql`
    ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS shop_category VARCHAR(1) CHECK (shop_category IN ('A', 'B'));
  `

  await sql`
    UPDATE products 
    SET shop_category = 'A'
    WHERE shop_category IS NULL;
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_products_shop_category 
    ON products(shop_category);
  `
}