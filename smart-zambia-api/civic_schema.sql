-- Civic Data Collection Schema
-- Run this after your existing schema.sql

-- Users table for civic reporting
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    civic_xp INTEGER DEFAULT 0,
    civic_level INTEGER DEFAULT 1,
    cash_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Civic reports table
CREATE TABLE IF NOT EXISTS civic_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- pothole, flooding, streetlight, waste, transport
    title VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, resolved
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high, critical
    xp_awarded INTEGER DEFAULT 0,
    cash_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    achievement_id VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    xp_awarded INTEGER DEFAULT 0,
    cash_awarded INTEGER DEFAULT 0,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_civic_reports_user_id ON civic_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_civic_reports_type ON civic_reports(type);
CREATE INDEX IF NOT EXISTS idx_civic_reports_status ON civic_reports(status);
CREATE INDEX IF NOT EXISTS idx_civic_reports_location ON civic_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Update trigger for users table
CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_timestamp();

CREATE TRIGGER update_civic_reports_timestamp
    BEFORE UPDATE ON civic_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_user_timestamp();