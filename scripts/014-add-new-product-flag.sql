-- -- Add new product flag and update schema for "New" labeling system

-- -- Add is_new column to products table
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;

-- -- Add new_until_date column to automatically remove "New" label after a certain date
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS new_until_date DATE;

-- -- Create index for better performance on new products
-- CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
-- CREATE INDEX IF NOT EXISTS idx_products_new_until_date ON products(new_until_date);

-- -- Update existing products to have new_until_date (7 days from creation for new products)
-- UPDATE products 
-- SET new_until_date = created_at + INTERVAL '7 days'
-- WHERE is_new = true AND new_until_date IS NULL;

-- -- Create a function to automatically update new status
-- CREATE OR REPLACE FUNCTION update_new_product_status()
-- RETURNS void AS $$
-- BEGIN
--   -- Remove "new" status from products past their new_until_date
--   UPDATE products 
--   SET is_new = false 
--   WHERE is_new = true AND new_until_date < CURRENT_DATE;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Create a trigger to automatically update new status daily
-- CREATE OR REPLACE FUNCTION trigger_update_new_status()
-- RETURNS trigger AS $$
-- BEGIN
--   PERFORM update_new_product_status();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Create a trigger that runs daily (you can set up a cron job to call this)
-- -- For now, we'll update manually when needed 