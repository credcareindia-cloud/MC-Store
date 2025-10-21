import { sql } from "@/lib/database"

/**
 * Ensures "background_image_url" and "auto_disappear_seconds" exist on
 * the "banners" table.  The `IF NOT EXISTS` clause makes this idempotent
 * and extremely fast, so we can call it on every request.
 */
export async function ensureBannerColumns() {
  await sql`
    ALTER TABLE banners
      ADD COLUMN IF NOT EXISTS background_image_url TEXT DEFAULT '' NOT NULL,
      ADD COLUMN IF NOT EXISTS auto_disappear_seconds INTEGER DEFAULT 0 NOT NULL;
  `
}
