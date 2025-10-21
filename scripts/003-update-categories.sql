-- -- Update categories table to ensure proper image support
-- ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
-- ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_special BOOLEAN DEFAULT false;

-- -- Update existing categories with sort order
-- UPDATE categories SET sort_order = 1, is_special = true WHERE name = 'Specials';
-- UPDATE categories SET sort_order = 2 WHERE name = 'Appetizers';
-- UPDATE categories SET sort_order = 3 WHERE name = 'Main Courses';
-- UPDATE categories SET sort_order = 4 WHERE name = 'Desserts';
-- UPDATE categories SET sort_order = 5 WHERE name = 'Beverages';

-- -- Insert Today's Special category if it doesn't exist
-- INSERT INTO categories (name, description, image_url, is_special, sort_order, is_active) 
-- VALUES ('Today''s Special', 'Chef''s handpicked selections for today', '/images/categories/todays-special.jpg', true, 0, true)
-- ON CONFLICT (name) DO NOTHING;
