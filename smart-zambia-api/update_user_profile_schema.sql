-- Migration to add user profile tracking fields
-- Run this to update existing database

BEGIN;

-- Add new columns to users table if they don't exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS xp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS login_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_desc TEXT,
    achievement_icon TEXT,
    xp_awarded INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- Create user visited destinations table
CREATE TABLE IF NOT EXISTS user_visited_destinations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_id BIGINT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, destination_id)
);

CREATE INDEX IF NOT EXISTS idx_visited_destinations_user ON user_visited_destinations(user_id);

COMMIT;

SELECT 'User profile schema updated successfully!' as message;
