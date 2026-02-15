-- =============================================
-- USER REVIEWS & RATINGS SCHEMA
-- =============================================

-- Reviews table
CREATE TABLE IF NOT EXISTS destination_reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200) NOT NULL,
  review_text TEXT NOT NULL,
  visit_date DATE,
  photos JSONB DEFAULT '[]',
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'deleted'))
);

-- Review helpfulness tracking (who found it helpful)
CREATE TABLE IF NOT EXISTS review_helpful (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES destination_reviews(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(review_id, user_id)
);

-- Review photos table (separate for better management)
CREATE TABLE IF NOT EXISTS review_photos (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES destination_reviews(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption VARCHAR(200),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review responses (from business owners or admins)
CREATE TABLE IF NOT EXISTS review_responses (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES destination_reviews(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_official BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_destination ON destination_reviews(destination_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON destination_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON destination_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON destination_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review ON review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_photos_review ON review_photos(review_id);

-- Function to update destination average rating
CREATE OR REPLACE FUNCTION update_destination_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- This would update a destinations table if you have one
  -- For now, we'll calculate on-the-fly in queries
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings
CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE OR DELETE ON destination_reviews
FOR EACH ROW
EXECUTE FUNCTION update_destination_rating();

-- Sample data for testing
INSERT INTO destination_reviews (user_id, destination_id, rating, title, review_text, visit_date, is_verified) VALUES
(1, 1, 5, 'Absolutely Breathtaking!', 'Victoria Falls exceeded all expectations. The sheer power and beauty of the falls is indescribable. Best time to visit is during high water season (March-May). Don''t miss the Devil''s Pool if you''re adventurous!', '2024-04-15', true),
(1, 2, 5, 'Best Safari Experience Ever', 'South Luangwa is a hidden gem. We saw leopards, lions, elephants, and so much more. The walking safaris are incredible - you really feel connected to nature. Our guide was knowledgeable and passionate.', '2024-05-20', true),
(1, 1, 4, 'Amazing but Crowded', 'Victoria Falls is stunning, but it can get very crowded during peak season. Go early in the morning for the best experience and fewer tourists. The sunset cruise on the Zambezi was magical.', '2024-06-10', true);

COMMENT ON TABLE destination_reviews IS 'User reviews and ratings for destinations';
COMMENT ON TABLE review_helpful IS 'Tracks which users found reviews helpful';
COMMENT ON TABLE review_photos IS 'Photos attached to reviews';
COMMENT ON TABLE review_responses IS 'Responses to reviews from owners/admins';
