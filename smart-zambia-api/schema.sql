-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  province VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  description TEXT,
  image_url TEXT,
  entry_fee_foreign INTEGER,
  entry_fee_local INTEGER,
  featured BOOLEAN DEFAULT false,
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  secrets JSONB,
  search_vector tsvector,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS destinations_search_idx ON destinations USING GIN(search_vector);

-- Trigger to auto-update search_vector
CREATE OR REPLACE FUNCTION destinations_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.province, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvector_update BEFORE INSERT OR UPDATE
ON destinations FOR EACH ROW EXECUTE FUNCTION destinations_search_trigger();

-- Sample data
INSERT INTO destinations (name, province, category, rating, description, image_url, entry_fee_foreign, entry_fee_local, featured, lat, lng, secrets) VALUES
('Victoria Falls', 'Southern Province', 'Nature', 4.9, 'One of the Seven Natural Wonders of the World. The mighty Zambezi River plunges over 100 meters creating the largest sheet of falling water on Earth.', 'https://images.unsplash.com/photo-1484318571209-661cf29a69c3', 20, 50, true, -17.9243, 25.8572, '["The Devil''s Pool", "Rainbow at sunset"]'),
('South Luangwa National Park', 'Eastern Province', 'Wildlife', 4.8, 'Home to one of the greatest concentrations of wildlife in Africa. Famous for walking safaris and leopard sightings.', 'https://images.unsplash.com/photo-1516426122078-c23e76319801', 25, 80, true, -13.0894, 31.8656, '["Night safari secrets", "Leopard territory"]'),
('Lower Zambezi National Park', 'Southern Province', 'Wildlife', 4.7, 'Pristine wilderness along the Zambezi River. Canoe safaris and incredible elephant encounters.', 'https://images.unsplash.com/photo-1549366021-9f761d450615', 25, 80, true, -15.6167, 29.4167, '["Canoe trail", "Elephant crossing"]'),
('Lake Kariba', 'Southern Province', 'Nature', 4.6, 'One of the world''s largest man-made lakes. Stunning sunsets and excellent fishing.', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', 10, 30, false, -16.5167, 28.8000, '["Sunset point", "Fishing spot"]'),
('Kafue National Park', 'Central Province', 'Wildlife', 4.7, 'Zambia''s oldest and largest national park. Diverse ecosystems and abundant wildlife.', 'https://images.unsplash.com/photo-1535338454770-6c4f6c6c4c4c', 20, 60, true, -15.5000, 26.0000, '["Busanga Plains", "Lion pride"]'),
('Livingstone Museum', 'Southern Province', 'Heritage', 4.3, 'National museum showcasing Zambian archaeology, ethnography, and history.', 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7', 5, 10, false, -17.8419, 25.8544, '["Ancient artifacts", "Cultural heritage"]'),
('Kasanka National Park', 'Northern Province', 'Wildlife', 4.5, 'Famous for the annual bat migration - 10 million fruit bats darken the sky each November.', 'https://images.unsplash.com/photo-1612480797665-c96d261eae09', 15, 40, false, -12.5667, 30.2333, '["Bat migration", "Swamp secrets"]'),
('Devil''s Pool', 'Southern Province', 'Adventure', 4.9, 'Swim on the edge of Victoria Falls during low water season. The ultimate adrenaline rush.', 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3', 75, 200, true, -17.9244, 25.8573, '["Edge of the world", "Natural infinity pool"]');

-- =============================================
-- TRAVEL & TOURISM FEATURES
-- =============================================

-- 2.1 Travel Reviews & Photos
CREATE TABLE IF NOT EXISTS travel_reviews (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  destination_id INT REFERENCES destinations(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  photo_urls TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Travel Buddy Matching
CREATE TABLE IF NOT EXISTS travel_buddies (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  destination_id INT REFERENCES destinations(id),
  travel_date DATE,
  interests TEXT[],
  open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 Tour Guides & Bookings
CREATE TABLE IF NOT EXISTS tour_guide_bookings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  guide_name TEXT,
  destination_id INT,
  booking_date DATE,
  price_kwacha NUMERIC,
  price_usd NUMERIC,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 Activities (Devil's Pool, Gorge Swing, etc.)
CREATE TABLE IF NOT EXISTS activity_reservations (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  destination_id INT,
  activity_name TEXT,
  reservation_date DATE,
  price_kwacha NUMERIC,
  price_usd NUMERIC,
  status TEXT DEFAULT 'reserved'
);

-- 2.5 Transport Bookings
CREATE TABLE IF NOT EXISTS transport_bookings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  type TEXT, -- flight | bus | car
  provider TEXT,
  origin TEXT,
  destination TEXT,
  travel_date DATE,
  price_kwacha NUMERIC,
  price_usd NUMERIC,
  status TEXT DEFAULT 'booked'
);

-- 2.6 Safety, Medical & Emergency
CREATE TABLE IF NOT EXISTS safety_alerts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  message TEXT,
  province TEXT,
  severity TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_facilities (
  id SERIAL PRIMARY KEY,
  name TEXT,
  province TEXT,
  address TEXT,
  phone TEXT,
  lat NUMERIC,
  lng NUMERIC
);

CREATE TABLE IF NOT EXISTS embassies (
  id SERIAL PRIMARY KEY,
  country TEXT,
  address TEXT,
  phone TEXT,
  email TEXT
);
