-- Smart Zambia Database Schema
-- Run this file to create all necessary tables

BEGIN;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    cash_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    province TEXT NOT NULL,
    category TEXT NOT NULL,
    rating NUMERIC(2,1) NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    entry_fee_foreign INT NULL,
    entry_fee_local INT NULL,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    lat NUMERIC(10,4) NOT NULL,
    lng NUMERIC(10,4) NOT NULL,
    secrets JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for destinations
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_id BIGINT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, destination_id)
);

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_time ON search_history(user_id, created_at DESC);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_time ON notifications(user_id, created_at DESC);

-- Civic reports table
CREATE TABLE IF NOT EXISTS civic_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_civic_reports_status ON civic_reports(status);
CREATE INDEX IF NOT EXISTS idx_civic_reports_type ON civic_reports(type);

-- Reviews table
CREATE TABLE IF NOT EXISTS destination_reviews (
    id BIGSERIAL PRIMARY KEY,
    destination_id BIGINT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;

-- Insert some sample destinations
INSERT INTO destinations (name, province, category, rating, description, image_url, entry_fee_foreign, featured, lat, lng) VALUES
('Victoria Falls', 'Southern Province', 'Nature', 4.9, 'One of the Seven Natural Wonders of the World', 'https://images.unsplash.com/photo-1568625502763-2a5ec6a94c47?w=800', 30, true, -17.9243, 25.8572),
('South Luangwa National Park', 'Eastern Province', 'Wildlife', 4.8, 'Famous for walking safaris and leopard sightings', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', 25, true, -13.0833, 31.7500),
('Lower Zambezi National Park', 'Southern Province', 'Wildlife', 4.7, 'Pristine wilderness along the mighty Zambezi River', 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800', 25, true, -15.6667, 29.1667)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database schema created successfully!' as message;