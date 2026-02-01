-- Enhanced Smart Zambia Schema - New Features
-- Run this after existing schemas

-- Travel Stories and Photos
CREATE TABLE IF NOT EXISTS travel_stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255),
    description TEXT,
    image_url TEXT,
    destination_id INTEGER REFERENCES destinations(id),
    likes_count INTEGER DEFAULT 0,
    offline_id VARCHAR(100), -- For offline sync
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Travel Buddy System
CREATE TABLE IF NOT EXISTS buddy_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id),
    buddy_id INTEGER REFERENCES users(id),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, buddy_id)
);

-- Tour Guides
CREATE TABLE IF NOT EXISTS tour_guides (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100),
    languages TEXT[],
    rating DECIMAL(3,2) DEFAULT 0,
    price_per_day INTEGER,
    contact_info JSONB,
    bio TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Bookings System
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- guide, activity, transport, accommodation
    guide_id INTEGER REFERENCES tour_guides(id),
    activity_name VARCHAR(255),
    booking_date DATE,
    duration INTEGER, -- in hours
    participants INTEGER DEFAULT 1,
    special_requirements TEXT,
    message TEXT,
    total_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cultural Events Calendar
CREATE TABLE IF NOT EXISTS cultural_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    end_date DATE,
    location VARCHAR(255),
    province VARCHAR(100),
    type VARCHAR(50), -- traditional, festival, ceremony, commercial
    entry_fee INTEGER DEFAULT 0,
    contact_info JSONB,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VR Tours and 360° Experiences
CREATE TABLE IF NOT EXISTS vr_tours (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    destination_id INTEGER REFERENCES destinations(id),
    tour_type VARCHAR(20), -- vr, 360, ar
    duration INTEGER, -- in minutes
    file_url TEXT,
    thumbnail_url TEXT,
    views INTEGER DEFAULT 0,
    popularity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vr_tour_views (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tour_id INTEGER REFERENCES vr_tours(id),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tour_id)
);

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    type VARCHAR(50), -- police, medical, tourist, embassy
    province VARCHAR(100),
    city VARCHAR(100),
    priority INTEGER DEFAULT 1,
    available_24_7 BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical Facilities
CREATE TABLE IF NOT EXISTS medical_facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- hospital, clinic, pharmacy
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    phone VARCHAR(50),
    emergency_services BOOLEAN DEFAULT FALSE,
    specialties TEXT[],
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safety Alerts
CREATE TABLE IF NOT EXISTS safety_alerts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    severity VARCHAR(20) DEFAULT 'info', -- info, warning, critical
    type VARCHAR(50), -- weather, road, security, health
    affected_areas TEXT[],
    active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Route Optimization Data
CREATE TABLE IF NOT EXISTS travel_routes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255),
    destinations INTEGER[],
    duration INTEGER, -- in days
    estimated_cost DECIMAL(10,2),
    transport_mode VARCHAR(50),
    route_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cost Calculator History
CREATE TABLE IF NOT EXISTS cost_calculations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    trip_duration INTEGER,
    accommodation_cost DECIMAL(10,2),
    transport_cost DECIMAL(10,2),
    activities_cost DECIMAL(10,2),
    food_cost DECIMAL(10,2),
    total_usd DECIMAL(10,2),
    total_zmw DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offline Data Sync
CREATE TABLE IF NOT EXISTS offline_sync_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    data_type VARCHAR(50), -- reports, photos, bookings
    offline_id VARCHAR(100),
    server_id INTEGER,
    sync_status VARCHAR(20) DEFAULT 'synced',
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO tour_guides (name, specialty, languages, rating, price_per_day, bio, verified) VALUES
('Joseph Mwanza', 'Wildlife Safari', ARRAY['English', 'Bemba'], 4.9, 50, 'Experienced safari guide with 15 years in South Luangwa', true),
('Grace Phiri', 'Cultural Tours', ARRAY['English', 'Nyanja'], 4.8, 40, 'Cultural heritage specialist and storyteller', true),
('David Banda', 'Adventure Sports', ARRAY['English', 'Tonga'], 4.7, 60, 'Certified adventure guide for extreme sports', true)
ON CONFLICT DO NOTHING;

INSERT INTO cultural_events (name, description, event_date, location, province, type) VALUES
('Kuomboka Ceremony', 'Traditional ceremony of the Lozi people', '2024-04-15', 'Mongu', 'Western Province', 'traditional'),
('Nc''wala Ceremony', 'First fruits ceremony of the Ngoni people', '2024-02-24', 'Chipata', 'Eastern Province', 'traditional'),
('Zambia International Trade Fair', 'Annual trade exhibition', '2024-07-01', 'Ndola', 'Copperbelt Province', 'commercial'),
('Livingstone Cultural Festival', 'Celebration of local arts and culture', '2024-08-15', 'Livingstone', 'Southern Province', 'festival')
ON CONFLICT DO NOTHING;

INSERT INTO emergency_contacts (name, phone, type, province, priority) VALUES
('National Emergency Services', '999', 'emergency', 'All', 1),
('Police Emergency', '991', 'police', 'All', 1),
('Tourist Police Lusaka', '+260-211-229087', 'tourist', 'Lusaka', 2),
('Tourist Police Livingstone', '+260-213-320891', 'tourist', 'Southern Province', 2)
ON CONFLICT DO NOTHING;

INSERT INTO medical_facilities (name, type, city, province, phone, emergency_services) VALUES
('University Teaching Hospital', 'hospital', 'Lusaka', 'Lusaka Province', '+260-211-256067', true),
('Livingstone General Hospital', 'hospital', 'Livingstone', 'Southern Province', '+260-213-320891', true),
('Ndola Central Hospital', 'hospital', 'Ndola', 'Copperbelt Province', '+260-212-612100', true),
('Chipata General Hospital', 'hospital', 'Chipata', 'Eastern Province', '+260-216-221355', true)
ON CONFLICT DO NOTHING;

INSERT INTO vr_tours (name, description, destination_id, tour_type, duration, popularity) VALUES
('Victoria Falls VR Experience', 'Immersive virtual reality tour of Victoria Falls', 1, 'vr', 5, 100),
('Safari 360° Adventure', '360-degree wildlife safari experience', 2, '360', 10, 85),
('Devil''s Pool Preview', 'Virtual preview of the famous Devil''s Pool', 8, '360', 3, 95)
ON CONFLICT DO NOTHING;

INSERT INTO safety_alerts (title, message, severity, type, affected_areas) VALUES
('Seasonal Flooding Alert', 'Heavy rains may cause flooding in low-lying areas', 'warning', 'weather', ARRAY['Southern Province', 'Western Province']),
('Road Maintenance Notice', 'M10 highway maintenance between Lusaka and Kafue', 'info', 'road', ARRAY['Lusaka Province'])
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_travel_stories_user_id ON travel_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_stories_destination_id ON travel_stories(destination_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_cultural_events_date ON cultural_events(event_date);
CREATE INDEX IF NOT EXISTS idx_vr_tours_destination ON vr_tours(destination_id);
CREATE INDEX IF NOT EXISTS idx_medical_facilities_location ON medical_facilities(province, city);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_active ON safety_alerts(active, severity);

-- Update triggers
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at columns where needed
ALTER TABLE travel_stories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create triggers
CREATE TRIGGER update_travel_stories_modtime BEFORE UPDATE ON travel_stories FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_bookings_modtime BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_modified_column();