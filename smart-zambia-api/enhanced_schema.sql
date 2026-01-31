-- Enhanced Smart Zambia Schema - Phase 1
-- Run this after existing schemas

-- Add photo upload and voting to civic reports
ALTER TABLE civic_reports 
ADD COLUMN IF NOT EXISTS image_urls TEXT[], -- Array of image URLs
ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS weather_data JSONB,
ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP;

-- Tourism-focused report categories
UPDATE civic_reports SET type = 'tourist_safety' WHERE type = 'transport';
INSERT INTO civic_reports (user_id, type, title, description, latitude, longitude, xp_awarded, cash_awarded) VALUES
(1, 'flooded_area', 'Sample flooded tourist area', 'Area near Victoria Falls flooded', -17.9243, 25.8572, 30, 3),
(1, 'blocked_trail', 'Sample blocked hiking trail', 'Trail to viewpoint blocked by fallen tree', -15.4167, 28.2833, 25, 2)
ON CONFLICT DO NOTHING;

-- User profiles and social features
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    bio TEXT,
    profile_image_url TEXT,
    location VARCHAR(255),
    interests TEXT[],
    social_links JSONB,
    privacy_settings JSONB DEFAULT '{"profile_public": true, "show_achievements": true}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social feed
CREATE TABLE IF NOT EXISTS social_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- 'destination_visit', 'civic_report', 'achievement', 'photo'
    content TEXT,
    image_urls TEXT[],
    destination_id INTEGER REFERENCES destinations(id),
    civic_report_id INTEGER REFERENCES civic_reports(id),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Friends system
CREATE TABLE IF NOT EXISTS user_friends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    friend_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- Report voting
CREATE TABLE IF NOT EXISTS report_votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    report_id INTEGER REFERENCES civic_reports(id),
    vote_type VARCHAR(10) DEFAULT 'upvote', -- upvote, downvote
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, report_id)
);

-- Weather data for destinations
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS weather_api_key VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_weather_update TIMESTAMP;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- 'report_resolved', 'new_destination', 'friend_request', 'achievement'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group challenges
CREATE TABLE IF NOT EXISTS group_challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- 'civic_cleanup', 'destination_exploration', 'photo_contest'
    target_count INTEGER,
    current_count INTEGER DEFAULT 0,
    reward_xp INTEGER DEFAULT 0,
    reward_cash INTEGER DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User participation in group challenges
CREATE TABLE IF NOT EXISTS challenge_participants (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER REFERENCES group_challenges(id),
    user_id INTEGER REFERENCES users(id),
    contribution_count INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(challenge_id, user_id)
);

-- Tourism services (hotels, guides, tours)
CREATE TABLE IF NOT EXISTS tourism_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'hotel', 'guide', 'tour', 'transport'
    description TEXT,
    price_range VARCHAR(50),
    contact_info JSONB,
    location JSONB,
    destination_id INTEGER REFERENCES destinations(id),
    rating DECIMAL(3,2) DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES tourism_services(id),
    booking_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    booking_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merchant partnerships and vouchers
CREATE TABLE IF NOT EXISTS merchants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- 'restaurant', 'hotel', 'shop', 'tour_operator'
    description TEXT,
    location JSONB,
    contact_info JSONB,
    discount_rate DECIMAL(5,2), -- percentage discount for points redemption
    min_points_required INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    merchant_id INTEGER REFERENCES merchants(id),
    code VARCHAR(50) UNIQUE,
    discount_amount DECIMAL(10,2),
    points_used INTEGER,
    status VARCHAR(20) DEFAULT 'active', -- active, used, expired
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral system
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER REFERENCES users(id),
    referred_id INTEGER REFERENCES users(id),
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics and tracking
CREATE TABLE IF NOT EXISTS user_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100), -- 'destination_view', 'report_submit', 'login', 'achievement_unlock'
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_report_votes_report_id ON report_votes(report_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_action ON user_analytics(action);

-- Sample data
INSERT INTO user_profiles (user_id, bio, location, interests) VALUES
(1, 'Tourism enthusiast exploring Zambia!', 'Lusaka', ARRAY['nature', 'wildlife', 'photography'])
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO merchants (name, type, description, location, discount_rate, min_points_required) VALUES
('Zambia Safari Lodge', 'hotel', 'Luxury safari accommodation', '{"city": "Livingstone", "province": "Southern"}', 10.00, 500),
('Victoria Falls Restaurant', 'restaurant', 'Fine dining with waterfall views', '{"city": "Livingstone", "province": "Southern"}', 15.00, 200),
('Lusaka City Tours', 'tour_operator', 'Guided city exploration tours', '{"city": "Lusaka", "province": "Lusaka"}', 20.00, 300)
ON CONFLICT DO NOTHING;

INSERT INTO group_challenges (title, description, type, target_count, reward_xp, reward_cash, start_date, end_date, created_by) VALUES
('Clean Tourism Sites Challenge', 'Help keep our tourist destinations clean by reporting litter and waste issues', 'civic_cleanup', 50, 500, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 1),
('Explore All Provinces', 'Visit destinations in all 10 provinces of Zambia', 'destination_exploration', 10, 1000, 250, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', 1)
ON CONFLICT DO NOTHING;