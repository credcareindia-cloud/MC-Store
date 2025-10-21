-- -- Add background image and auto-disappear functionality to banners table
-- ALTER TABLE banners ADD COLUMN IF NOT EXISTS background_image_url TEXT DEFAULT '' NOT NULL;
-- ALTER TABLE banners ADD COLUMN IF NOT EXISTS auto_disappear_seconds INTEGER DEFAULT 0 NOT NULL; -- 0 means no auto-disappear

-- -- Update existing banners with new fields
-- UPDATE banners SET 
--   background_image_url = background_image_url,
--   auto_disappear_seconds = auto_disappear_seconds
-- WHERE background_image_url IS NULL OR auto_disappear_seconds IS NULL;
