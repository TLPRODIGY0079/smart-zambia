-- Smart Zambia Production Schema for Supabase
-- This schema implements all 51 requirements from the production upgrade specification

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PROFILES TABLE (Extended user data)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  nrc_number TEXT, -- Zambian National Registration Card for local tourist verification
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'bem', 'ny')),
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_bookings INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  login_streak INTEGER DEFAULT 0,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER ROLES TABLE (Four-tier role system)
-- ============================================
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('international_tourist', 'local_tourist', 'tour_guide', 'admin')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT false, -- For tour guides: verification status
  verification_documents JSONB, -- Links to Supabase Storage files
  PRIMARY KEY (user_id, role)
);

-- ============================================
-- DESTINATIONS TABLE
-- ============================================
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  province TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  featured BOOLEAN DEFAULT false,
  price_usd DECIMAL(10, 2), -- International pricing
  price_zmw DECIMAL(10, 2), -- Local pricing
  local_discount_percentage INTEGER DEFAULT 0,
  image_urls TEXT[], -- Array of Supabase Storage URLs
  secrets JSONB, -- Easter eggs, hidden features
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(province, ''))
  ) STORED
);

-- Indexes for destinations
CREATE INDEX destinations_search_idx ON destinations USING GIN (search_vector);
CREATE INDEX destinations_province_idx ON destinations (province);
CREATE INDEX destinations_featured_idx ON destinations (featured);
CREATE INDEX destinations_category_idx ON destinations (category);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations(id),
  tour_guide_id UUID REFERENCES auth.users(id),
  booking_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  group_size INTEGER NOT NULL CHECK (group_size > 0),
  total_price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'ZMW')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'mtn_mobile_money', 'airtel_money')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_intent_id TEXT, -- Stripe payment intent ID
  paid_at TIMESTAMPTZ,
  booking_status TEXT DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed')),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX bookings_user_idx ON bookings (user_id);
CREATE INDEX bookings_tour_guide_idx ON bookings (tour_guide_id);
CREATE INDEX bookings_status_idx ON bookings (booking_status);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL CHECK (length(content) >= 20),
  image_urls TEXT[], -- Review photos
  helpful_count INTEGER DEFAULT 0,
  verified_visit BOOLEAN DEFAULT false, -- True if user has checked in at destination
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, destination_id) -- One review per destination per user
);

CREATE INDEX reviews_destination_idx ON reviews (destination_id);
CREATE INDEX reviews_rating_idx ON reviews (rating);

-- ============================================
-- CHECK_INS TABLE
-- ============================================
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations(id),
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  latitude DECIMAL(10, 8), -- For location verification
  longitude DECIMAL(11, 8),
  xp_awarded INTEGER DEFAULT 10,
  
  UNIQUE(user_id, destination_id, DATE(checked_in_at)) -- One check-in per destination per day
);

CREATE INDEX check_ins_user_idx ON check_ins (user_id);
CREATE INDEX check_ins_date_idx ON check_ins (DATE(checked_in_at));

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 0,
  badge_tier TEXT CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ============================================
-- TRIP PLANS TABLE
-- ============================================
CREATE TABLE trip_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  destinations JSONB NOT NULL, -- Array of {destination_id, day, notes}
  budget DECIMAL(10, 2),
  currency TEXT CHECK (currency IN ('USD', 'ZMW')),
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE, -- For sharing via link
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX trip_plans_user_idx ON trip_plans (user_id);
CREATE INDEX trip_plans_share_idx ON trip_plans (share_token) WHERE share_token IS NOT NULL;

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  collection_name TEXT DEFAULT 'Default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, destination_id, collection_name)
);

CREATE INDEX favorites_user_idx ON favorites (user_id);

-- ============================================
-- SEARCH HISTORY TABLE
-- ============================================
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX search_history_user_time_idx ON search_history (user_id, created_at DESC);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking', 'achievement', 'message', 'system', 'payment')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX notifications_user_time_idx ON notifications (user_id, created_at DESC);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX chat_messages_booking_idx ON chat_messages (booking_id);
CREATE INDEX chat_messages_sender_idx ON chat_messages (sender_id);
CREATE INDEX chat_messages_receiver_idx ON chat_messages (receiver_id);

-- ============================================
-- TOUR GUIDE APPLICATIONS TABLE
-- ============================================
CREATE TABLE tour_guide_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credentials JSONB NOT NULL,
  certifications JSONB,
  experience_years INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX tour_guide_applications_user_idx ON tour_guide_applications (user_id);
CREATE INDEX tour_guide_applications_status_idx ON tour_guide_applications (status);

-- ============================================
-- COMMISSION TRACKING TABLE
-- ============================================
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_guide_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  commission_amount DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL,
  credited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX commissions_tour_guide_idx ON commissions (tour_guide_id);
CREATE INDEX commissions_booking_idx ON commissions (booking_id);

-- ============================================
-- CIVIC REPORTS TABLE
-- ============================================
CREATE TABLE civic_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX civic_reports_status_idx ON civic_reports (status);
CREATE INDEX civic_reports_type_idx ON civic_reports (type);

-- ============================================
-- ADMIN AUDIT LOG TABLE
-- ============================================
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  affected_resource_type TEXT NOT NULL,
  affected_resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX admin_audit_log_admin_idx ON admin_audit_log (admin_id);
CREATE INDEX admin_audit_log_action_idx ON admin_audit_log (action_type);
CREATE INDEX admin_audit_log_time_idx ON admin_audit_log (created_at DESC);

-- ============================================
-- INSERT SAMPLE ACHIEVEMENTS
-- ============================================
INSERT INTO achievements (code, name, description, xp_reward, badge_tier) VALUES
('first_steps', 'First Steps', 'View your first destination', 10, 'bronze'),
('explorer', 'Explorer', 'View 5 different destinations', 50, 'bronze'),
('treasure_hunter', 'Treasure Hunter', 'Find your first treasure', 100, 'silver'),
('easter_master', 'Easter Master', 'Find 3 easter eggs', 75, 'silver'),
('secret_finder', 'Secret Finder', 'Discover a secret door', 150, 'gold'),
('konami_master', 'Konami Master', 'Enter the Konami code', 200, 'platinum'),
('streak_7', 'Week Warrior', 'Maintain a 7-day check-in streak', 70, 'silver'),
('streak_30', 'Monthly Champion', 'Maintain a 30-day check-in streak', 300, 'gold'),
('reviewer', 'First Review', 'Write your first review', 30, 'bronze'),
('booker', 'First Booking', 'Complete your first booking', 50, 'bronze')
ON CONFLICT (code) DO NOTHING;

-- Success message
SELECT 'Smart Zambia Supabase schema created successfully!' as message;
