-- -- Create about_content table
-- CREATE TABLE IF NOT EXISTS about_content (
--   id SERIAL PRIMARY KEY,
--   title VARCHAR(255) NOT NULL,
--   subtitle VARCHAR(255),
--   description TEXT NOT NULL,
--   image_url VARCHAR(500),
--   button_text VARCHAR(100) DEFAULT 'Reserve a Table',
--   button_link VARCHAR(255) DEFAULT '/reservations',
--   is_active BOOLEAN DEFAULT true,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Insert default content
-- INSERT INTO about_content (title, subtitle, description, image_url, button_text, button_link) VALUES
-- ('A Legacy of Culinary Excellence', 'Our Story', 'Founded by passionate chefs and hospitality experts, Lumière combines timeless techniques with modern innovation to deliver unforgettable dining experiences. Every ingredient is hand-selected, every plate meticulously crafted—because you deserve nothing less than perfection.

-- Join us for an evening of sophistication, where ambiance, service, and taste converge into a single, unforgettable memory.', '/placeholder.svg?height=800&width=800', 'Reserve a Table', '/reservations')
-- ON CONFLICT DO NOTHING;
