-- -- Insert sample data

-- -- Insert categories
-- INSERT INTO categories (name, description, image_url) VALUES
-- ('Appetizers', 'Start your culinary journey with our exquisite appetizers', '/images/categories/appetizers.jpg'),
-- ('Main Courses', 'Our signature main dishes crafted with premium ingredients', '/images/categories/mains.jpg'),
-- ('Desserts', 'Sweet endings to your perfect meal', '/images/categories/desserts.jpg'),
-- ('Beverages', 'Carefully curated drinks to complement your dining experience', '/images/categories/beverages.jpg'),
-- ('Specials', 'Chef''s special creations and seasonal offerings', '/images/categories/specials.jpg');

-- -- Insert sample menu items
-- INSERT INTO menu_items (name, description, price, category_id, is_featured, ingredients, allergens, preparation_time) VALUES
-- ('Truffle Arancini', 'Crispy risotto balls with black truffle and parmesan', 18.00, 1, true, ARRAY['Arborio rice', 'Black truffle', 'Parmesan', 'Breadcrumbs'], ARRAY['Gluten', 'Dairy'], 15),
-- ('Wagyu Beef Tenderloin', 'Premium A5 Wagyu with roasted vegetables and red wine jus', 85.00, 2, true, ARRAY['Wagyu beef', 'Seasonal vegetables', 'Red wine'], ARRAY[], 25),
-- ('Chocolate Soufflé', 'Warm chocolate soufflé with vanilla bean ice cream', 16.00, 3, true, ARRAY['Dark chocolate', 'Eggs', 'Vanilla ice cream'], ARRAY['Eggs', 'Dairy'], 20),
-- ('Craft Cocktail Selection', 'House-made cocktails with premium spirits', 15.00, 4, false, ARRAY['Premium spirits', 'Fresh ingredients'], ARRAY[], 5);

-- -- Insert sample content
-- INSERT INTO content (section, title, subtitle, content, image_url) VALUES
-- ('hero', 'Culinary Excellence Redefined', 'Experience the finest dining in an atmosphere of luxury and sophistication', 'Welcome to our world-class restaurant where every dish tells a story of passion, creativity, and culinary mastery.', '/images/hero-bg.jpg'),
-- ('about', 'Our Story', 'A Legacy of Culinary Excellence', 'Founded with a vision to create extraordinary dining experiences, our restaurant combines traditional techniques with modern innovation to deliver unforgettable meals.', '/images/about-bg.jpg'),
-- ('contact', 'Visit Us', 'Reserve Your Table Today', 'Located in the heart of the city, we invite you to experience our exceptional cuisine and impeccable service.', '/images/contact-bg.jpg');
