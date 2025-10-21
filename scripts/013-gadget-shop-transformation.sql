-- -- ITHISAL MOBILES - Gadget Shop Database Transformation
-- -- Transform restaurant schema to gadget shop schema

-- -- Update categories table with gadget categories
-- UPDATE categories SET 
--     name = 'Mobile Phones',
--     description = 'Smartphones and mobile devices'
-- WHERE id = 1;

-- UPDATE categories SET 
--     name = 'Laptops & PCs',
--     description = 'Desktop computers and laptops'
-- WHERE id = 2;

-- UPDATE categories SET 
--     name = 'Audio Devices',
--     description = 'Earbuds, headphones, and speakers'
-- WHERE id = 3;

-- UPDATE categories SET 
--     name = 'Accessories',
--     description = 'Phone cases, chargers, and accessories'
-- WHERE id = 4;

-- UPDATE categories SET 
--     name = 'Tablets',
--     description = 'Tablets and iPads'
-- WHERE id = 5;

-- -- Insert additional gadget categories
-- INSERT INTO categories (name, description, is_active, sort_order) VALUES
-- ('Smart Watches', 'Smartwatches and fitness trackers', true, 6),
-- ('Gaming', 'Gaming consoles and accessories', true, 7),
-- ('Cameras', 'Digital cameras and accessories', true, 8),
-- ('Smart Home', 'Smart home devices and IoT', true, 9)
-- ON CONFLICT (name) DO NOTHING;

-- -- Update menu_items table structure for products
-- ALTER TABLE menu_items RENAME TO products;
-- ALTER TABLE products RENAME COLUMN menu_item_name TO product_name;
-- ALTER TABLE products RENAME COLUMN menu_item_description TO product_description;

-- -- Add new columns for gadget products
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS model VARCHAR(100);
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS condition_type VARCHAR(50) DEFAULT 'new'; -- new, used, refurbished
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_period INTEGER DEFAULT 12; -- months
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_capacity VARCHAR(50);
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(50);
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 1;
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE;

-- -- Update existing columns for gadget context
-- ALTER TABLE products RENAME COLUMN ingredients TO features;
-- ALTER TABLE products RENAME COLUMN allergens TO specifications_text;
-- ALTER TABLE products RENAME COLUMN preparation_time TO warranty_months;

-- -- Update order_items table to reference products
-- ALTER TABLE order_items RENAME COLUMN menu_item_id TO product_id;
-- ALTER TABLE order_items RENAME COLUMN menu_item_name TO product_name;
-- ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product 
--     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- -- Create product_images table for multiple product images
-- CREATE TABLE IF NOT EXISTS product_images (
--     id SERIAL PRIMARY KEY,
--     product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
--     image_url VARCHAR(500) NOT NULL,
--     alt_text VARCHAR(200),
--     is_primary BOOLEAN DEFAULT false,
--     sort_order INTEGER DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Create product_reviews table
-- CREATE TABLE IF NOT EXISTS product_reviews (
--     id SERIAL PRIMARY KEY,
--     product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
--     customer_name VARCHAR(200) NOT NULL,
--     customer_email VARCHAR(200),
--     rating INTEGER CHECK (rating >= 1 AND rating <= 5),
--     review_text TEXT,
--     is_verified_purchase BOOLEAN DEFAULT false,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Update orders table for gadget shop
-- ALTER TABLE orders RENAME COLUMN order_type TO order_type; -- Keep same column name
-- ALTER TABLE orders ALTER COLUMN order_type SET DEFAULT 'online'; -- online, pickup, delivery
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(10,2) DEFAULT 0;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);

-- -- Update order statuses for e-commerce
-- UPDATE orders SET status = 'pending' WHERE status IN ('pending', 'confirmed');
-- UPDATE orders SET status = 'processing' WHERE status = 'preparing';
-- UPDATE orders SET status = 'shipped' WHERE status = 'ready';
-- UPDATE orders SET status = 'delivered' WHERE status = 'completed';

-- -- Create product_categories junction table for multiple categories
-- CREATE TABLE IF NOT EXISTS product_categories (
--     id SERIAL PRIMARY KEY,
--     product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
--     category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
--     is_primary BOOLEAN DEFAULT false,
--     UNIQUE(product_id, category_id)
-- );

-- -- Insert sample gadget products
-- INSERT INTO products (
--     name, description, price, category_id, image_url, 
--     is_available, is_featured, brand, model, condition_type,
--     warranty_period, storage_capacity, color, stock_quantity, sku
-- ) VALUES
-- ('iPhone 15 Pro', 'Latest iPhone with A17 Pro chip and titanium design', 999.00, 1, '/placeholder.svg', 
--  true, true, 'Apple', 'iPhone 15 Pro', 'new', 12, '256GB', 'Natural Titanium', 5, 'IPH15P-256-NT'),
-- ('Samsung Galaxy S24', 'Android flagship with AI features', 899.00, 1, '/placeholder.svg', 
--  true, true, 'Samsung', 'Galaxy S24', 'new', 12, '128GB', 'Phantom Black', 8, 'SGS24-128-PB'),
-- ('MacBook Air M2', 'Ultra-thin laptop with M2 chip', 1199.00, 2, '/placeholder.svg', 
--  true, true, 'Apple', 'MacBook Air M2', 'new', 12, '256GB', 'Space Gray', 3, 'MBA-M2-256-SG'),
-- ('AirPods Pro', 'Active noise cancellation earbuds', 249.00, 3, '/placeholder.svg', 
--  true, true, 'Apple', 'AirPods Pro', 'new', 12, 'N/A', 'White', 15, 'APP-WHITE'),
-- ('iPhone 13 Used', 'Excellent condition used iPhone 13', 599.00, 1, '/placeholder.svg', 
--  true, false, 'Apple', 'iPhone 13', 'used', 3, '128GB', 'Blue', 2, 'IPH13-128-BL-U'),
-- ('Sony WH-1000XM5', 'Premium noise-canceling headphones', 399.00, 3, '/placeholder.svg', 
--  true, true, 'Sony', 'WH-1000XM5', 'new', 12, 'N/A', 'Black', 6, 'SWH1000XM5-BLK')
-- ON CONFLICT (sku) DO NOTHING;

-- -- Insert product features and specifications
-- UPDATE products SET 
--     features = ARRAY['A17 Pro chip', 'Titanium design', '48MP camera', 'USB-C'],
--     specifications_text = '6.1-inch display, 256GB storage, 5G capable'
-- WHERE sku = 'IPH15P-256-NT';

-- UPDATE products SET 
--     features = ARRAY['AI features', '200MP camera', 'S Pen support', '5G'],
--     specifications_text = '6.8-inch display, 128GB storage, Android 14'
-- WHERE sku = 'SGS24-128-PB';

-- UPDATE products SET 
--     features = ARRAY['M2 chip', '13.6-inch display', '18-hour battery', 'Backlit keyboard'],
--     specifications_text = '13.6-inch Liquid Retina display, 8GB RAM, 256GB SSD'
-- WHERE sku = 'MBA-M2-256-SG';

-- -- Create indexes for better performance
-- CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
-- CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
-- CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition_type);
-- CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
-- CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
-- CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- -- Update settings for gadget shop
-- UPDATE settings SET 
--     restaurant_name = 'ITHISAL MOBILES',
--     restaurant_description = 'Premium Electronics & Gadgets Store',
--     restaurant_address = '123 Tech Street, Gadget City',
--     restaurant_phone = '+1-555-TECH',
--     restaurant_email = 'info@ithisalmobiles.com'
-- WHERE id = 1;

-- -- Insert gadget shop specific settings
-- INSERT INTO settings (key, value) VALUES
-- ('shop_type', 'electronics'),
-- ('currency', 'USD'),
-- ('tax_rate', '8.5'),
-- ('free_shipping_threshold', '50.00'),
-- ('return_policy_days', '30'),
-- ('warranty_default_months', '12')
-- ON CONFLICT (key) DO NOTHING; 