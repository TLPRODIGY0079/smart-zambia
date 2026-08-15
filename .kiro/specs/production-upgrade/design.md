# Technical Design Document

## Overview

### Purpose

This design specifies the technical architecture for upgrading the Smart Zambia tourism gamification platform from an MVP state (70% complete, localStorage-only) to a production-ready system. The upgrade encompasses:

- **Backend Migration**: Transitioning from localStorage to Supabase (PostgreSQL database, authentication, storage, real-time capabilities)
- **Role-Based Access Control**: Implementing a four-tier user system (International Tourist, Local Tourist, Tour Guide, Admin) with granular permissions
- **Production Deployment**: Configuring Vercel deployment with proper environment management and CI/CD
- **Feature Completion**: Implementing persistent trip planner, favorites, search history, notifications, and booking management
- **Security Hardening**: Implementing RLS policies, rate limiting, input sanitization, audit trails, and secure credential management
- **Comprehensive Testing**: Unit, integration, E2E, cross-browser, mobile, performance, security, and accessibility testing
- **Production Infrastructure**: Analytics, error monitoring, SEO, email templates, PWA features, payment integration

### Context

The Smart Zambia platform currently features:
- 21 destinations across Zambian provinces
- Daily check-in system with XP rewards
- Gamification system (XP, levels, achievements, streaks)
- User profiles with stats tracking
- Responsive UI with Tailwind CSS
- Basic PostgreSQL backend via Express API

**Current Limitations:**
- Temporary localStorage data storage (lost on browser clear)
- No persistent authentication system
- Single "user" role without granular permissions
- Incomplete Vercel deployment configuration
- Missing production features (payments, monitoring, comprehensive testing)
- No multi-language support or local payment methods
- Security vulnerabilities (exposed credentials, no rate limiting, no RLS policies)

### Goals

1. **Data Persistence**: Migrate all user data from localStorage to Supabase PostgreSQL with real-time synchronization
2. **Secure Authentication**: Implement Supabase Auth with email/password and OAuth providers (Google, Facebook)
3. **Role-Based System**: Create four distinct user roles with appropriate permissions and features
4. **Production Deployment**: Configure Vercel with proper build settings, environment variables, and SSL/HTTPS
5. **Feature Parity**: Complete all partially implemented features with database persistence
6. **Security Compliance**: Harden security with RLS policies, rate limiting, input validation, and audit trails
7. **Testing Coverage**: Achieve 80%+ code coverage with comprehensive test suites
8. **Production Readiness**: Implement monitoring, analytics, error tracking, backups, and documentation


## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Web Browser (Desktop, Mobile, Tablet)                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ HTML/Tailwind│  │ JavaScript   │  │ PWA Service  │           │  │
│  │  │ CSS UI       │  │ Application  │  │ Worker       │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     VERCEL EDGE NETWORK                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  CDN Edge Nodes (Global Distribution)                            │  │
│  │  - Static Asset Caching                                          │  │
│  │  - Image Optimization                                            │  │
│  │  - Code Splitting Delivery                                       │  │
│  │  - SSL/TLS Termination                                           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     SUPABASE BACKEND                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Authentication Service                                          │   │
│  │  - Email/Password Auth                                           │   │
│  │  - OAuth (Google, Facebook)                                      │   │
│  │  - JWT Token Management                                          │   │
│  │  - Session Handling                                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database (with RLS)                                  │   │
│  │  - User profiles & roles                                         │   │
│  │  - Destinations & reviews                                        │   │
│  │  - Bookings & payments                                           │   │
│  │  - Gamification data                                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Storage Service                                                 │   │
│  │  - User profile images                                           │   │
│  │  - Destination photos                                            │   │
│  │  - Review images                                                 │   │
│  │  - Tour guide documents                                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Realtime Service                                                │   │
│  │  - Live notifications                                            │   │
│  │  - Chat messages                                                 │   │
│  │  - Booking updates                                               │   │
│  │  - Admin dashboard data                                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ├─────────────────────┐
                                    ▼                     ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│      EXTERNAL SERVICES               │  │   MONITORING & ANALYTICS      │
│  ┌────────────────────────────────┐  │  │  ┌─────────────────────────┐ │
│  │  Payment Processing            │  │  │  │  Google Analytics 4     │ │
│  │  - Stripe (International)      │  │  │  └─────────────────────────┘ │
│  │  - Mobile Money (Local)        │  │  │  ┌─────────────────────────┐ │
│  └────────────────────────────────┘  │  │  │  Sentry Error Tracking  │ │
│  ┌────────────────────────────────┐  │  │  └─────────────────────────┘ │
│  │  Email Services                │  │  │  ┌─────────────────────────┐ │
│  │  - Transactional emails        │  │  │  │  Vercel Analytics       │ │
│  │  - Notification emails         │  │  │  └─────────────────────────┘ │
│  └────────────────────────────────┘  │  └──────────────────────────────┘
└──────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- HTML5 + Tailwind CSS (responsive UI framework)
- Vanilla JavaScript (ES6+ modules)
- Supabase JavaScript Client (@supabase/supabase-js)
- Service Worker (PWA offline support)
- Vite (build tool for optimization)

**Backend:**
- Supabase PostgreSQL (primary database)
- Supabase Auth (authentication service)
- Supabase Storage (file/image storage)
- Supabase Realtime (WebSocket connections)
- Row Level Security (RLS) policies

**Deployment:**
- Vercel (frontend hosting and CDN)
- GitHub Actions (CI/CD pipeline)
- Environment-based configuration

**External Services:**
- Stripe (international payment processing)
- Mobile Money API (local Zambian payments)
- Google Analytics 4 (user behavior tracking)
- Sentry (error monitoring and reporting)
- Email service provider (transactional emails)


### Layered Architecture

The application follows a clean layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  - HTML pages (index.html, profile.html, admin.html)       │
│  - Tailwind CSS styles                                      │
│  - UI components (modals, cards, navigation)               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  - main.js (application orchestration)                      │
│  - User interaction handlers                                │
│  - State management                                         │
│  - Routing logic                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                            │
│  - auth-service.js (authentication)                         │
│  - destination-service.js (destination operations)          │
│  - booking-service.js (booking management)                  │
│  - gamification-service.js (XP, achievements)               │
│  - notification-service.js (real-time notifications)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER                        │
│  - supabase-client.js (Supabase initialization)            │
│  - database queries (CRUD operations)                       │
│  - Real-time subscriptions                                  │
│  - Storage operations                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                          │
│  - PostgreSQL Database                                      │
│  - Authentication Service                                   │
│  - Storage Buckets                                          │
│  - Realtime Engine                                          │
└─────────────────────────────────────────────────────────────┘
```

### Security Architecture

**Defense in Depth Strategy:**

1. **Transport Security**
   - HTTPS/TLS 1.3 for all connections
   - HSTS headers to enforce HTTPS
   - Secure cookie flags (HttpOnly, Secure, SameSite)

2. **Authentication Security**
   - Supabase Auth with JWT tokens
   - OAuth 2.0 for social login
   - Password complexity requirements
   - Rate-limited login attempts (5 attempts per 15 minutes)
   - Session expiration after 30 minutes of inactivity

3. **Authorization Security**
   - Row Level Security (RLS) policies on all tables
   - Role-based access control (4 tiers)
   - API endpoint authorization checks
   - Resource-level permissions

4. **Data Security**
   - Input validation (client and server side)
   - Output encoding to prevent XSS
   - Parameterized queries to prevent SQL injection
   - CSRF token validation
   - Sensitive data encryption at rest

5. **Application Security**
   - Rate limiting on all API endpoints
   - CORS configuration (restricted origins)
   - Content Security Policy (CSP) headers
   - X-Frame-Options to prevent clickjacking
   - Audit logging for sensitive operations


## Components and Interfaces

### Frontend Components

#### 1. Authentication Module (`auth-service.js`)

**Responsibilities:**
- User registration and login
- OAuth integration (Google, Facebook)
- Session management
- Token refresh
- Password reset functionality

**Key Methods:**
```javascript
async register(email, password, userData)
async login(email, password)
async loginWithOAuth(provider)
async logout()
async resetPassword(email)
async updatePassword(newPassword)
async getSession()
async refreshSession()
```

**Interface with Supabase:**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Registration
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name, role }
  }
})

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

// OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

#### 2. User Profile Module (`profile-service.js`)

**Responsibilities:**
- Fetch and update user profile data
- Upload profile images
- Manage user preferences
- Track user statistics (XP, level, check-ins)

**Key Methods:**
```javascript
async getUserProfile(userId)
async updateProfile(userId, profileData)
async uploadProfileImage(file)
async getUserStats(userId)
async updateUserPreferences(preferences)
```

#### 3. Destination Module (`destination-service.js`)

**Responsibilities:**
- Browse and search destinations
- Filter destinations by criteria
- Manage favorites
- Submit reviews and ratings

**Key Methods:**
```javascript
async getDestinations(filters)
async getDestinationById(id)
async searchDestinations(query)
async addToFavorites(destinationId)
async removeFromFavorites(destinationId)
async getFavorites(userId)
async submitReview(destinationId, rating, comment, images)
```

#### 4. Booking Module (`booking-service.js`)

**Responsibilities:**
- Create and manage bookings
- Process payments
- Track booking status
- Handle cancellations and modifications

**Key Methods:**
```javascript
async createBooking(bookingData)
async getBookings(userId)
async getBookingById(bookingId)
async cancelBooking(bookingId)
async updateBooking(bookingId, updates)
async processPayment(bookingId, paymentMethod)
```

#### 5. Gamification Module (`gamification-service.js`)

**Responsibilities:**
- Calculate and award XP
- Manage achievements
- Track check-in streaks
- Update user levels
- Manage leaderboards

**Key Methods:**
```javascript
async awardXP(userId, amount, reason)
async unlockAchievement(userId, achievementId)
async getAchievements(userId)
async recordCheckIn(userId, destinationId)
async getCheckInStreak(userId)
async getLeaderboard(limit)
async calculateLevel(xp)
```

#### 6. Notification Module (`notification-service.js`)

**Responsibilities:**
- Subscribe to real-time notifications
- Display notifications to users
- Mark notifications as read
- Manage notification preferences

**Key Methods:**
```javascript
async subscribeToNotifications(userId, callback)
async getNotifications(userId)
async markAsRead(notificationId)
async markAllAsRead(userId)
async getUnreadCount(userId)
async updateNotificationPreferences(userId, preferences)
```


#### 7. Chat Module (`chat-service.js`)

**Responsibilities:**
- Real-time messaging between tourists and tour guides
- Chat history retrieval
- Typing indicators
- Image sharing

**Key Methods:**
```javascript
async sendMessage(conversationId, message)
async getConversation(conversationId)
async subscribeToConversation(conversationId, callback)
async uploadChatImage(file)
async markConversationAsRead(conversationId)
async getConversations(userId)
```

#### 8. Admin Dashboard Module (`admin-service.js`)

**Responsibilities:**
- User management
- Content moderation
- Analytics and reporting
- System configuration

**Key Methods:**
```javascript
async getUsers(filters)
async updateUserRole(userId, newRole)
async suspendUser(userId, reason)
async getDashboardStats()
async moderateContent(contentId, action)
async approveTourGuide(applicationId)
async addDestination(destinationData)
async updateDestination(destinationId, updates)
```

#### 9. Trip Planner Module (`trip-planner-service.js`)

**Responsibilities:**
- Create and save trip plans
- Add destinations to itinerary
- Share trip plans
- Export to PDF

**Key Methods:**
```javascript
async createTripPlan(planData)
async getTripPlans(userId)
async getTripPlanById(planId)
async updateTripPlan(planId, updates)
async deleteTripPlan(planId)
async shareTripPlan(planId)
async exportToPDF(planId)
```

#### 10. Payment Module (`payment-service.js`)

**Responsibilities:**
- Process Stripe payments (international)
- Process Mobile Money payments (local)
- Handle refunds
- Track transaction history

**Key Methods:**
```javascript
async createPaymentIntent(amount, currency)
async confirmPayment(paymentIntentId)
async processMobileMoneyPayment(phoneNumber, amount)
async refundPayment(transactionId, amount)
async getTransactionHistory(userId)
```

### Backend Components (Supabase Functions)

#### 1. Database Functions

**Calculate XP Function:**
```sql
CREATE OR REPLACE FUNCTION calculate_xp(user_id BIGINT, action TEXT)
RETURNS INTEGER AS $$
DECLARE
  xp_amount INTEGER;
BEGIN
  xp_amount := CASE action
    WHEN 'check_in' THEN 10
    WHEN 'review' THEN 25
    WHEN 'booking' THEN 50
    WHEN 'achievement' THEN 100
    ELSE 0
  END;
  
  UPDATE users 
  SET xp = xp + xp_amount,
      level = FLOOR(xp / 100) + 1
  WHERE id = user_id;
  
  RETURN xp_amount;
END;
$$ LANGUAGE plpgsql;
```

**Check Streak Function:**
```sql
CREATE OR REPLACE FUNCTION check_streak(user_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
  last_check_in DATE;
  current_streak INTEGER;
BEGIN
  SELECT MAX(created_at::DATE), COUNT(DISTINCT created_at::DATE)
  INTO last_check_in, current_streak
  FROM check_ins
  WHERE user_id = user_id
    AND created_at >= NOW() - INTERVAL '7 days';
  
  IF last_check_in = CURRENT_DATE - INTERVAL '1 day' THEN
    RETURN current_streak + 1;
  ELSIF last_check_in = CURRENT_DATE THEN
    RETURN current_streak;
  ELSE
    RETURN 1;
  END IF;
END;
$$ LANGUAGE plpgsql;
```


#### 2. Edge Functions (Supabase)

**Send Email Notification:**
```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'std/server'

serve(async (req) => {
  const { to, subject, template, data } = await req.json()
  
  // Email service integration
  const response = await fetch(EMAIL_SERVICE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EMAIL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to,
      subject,
      html: renderTemplate(template, data)
    })
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Process Payment:**
```typescript
// supabase/functions/process-payment/index.ts
import { serve } from 'std/server'
import Stripe from 'stripe'

const stripe = new Stripe(STRIPE_SECRET_KEY)

serve(async (req) => {
  const { amount, currency, userId } = await req.json()
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: { userId }
  })
  
  return new Response(
    JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### API Interfaces

#### Supabase Client Configuration

```javascript
// config/supabase-client.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

#### Real-time Subscriptions

```javascript
// Subscribe to notifications
const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      displayNotification(payload.new)
    }
  )
  .subscribe()

// Subscribe to chat messages
const chatSubscription = supabase
  .channel('chat_messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      appendMessage(payload.new)
    }
  )
  .subscribe()
```


## Data Models

### Core Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('international_tourist', 'local_tourist', 'tour_guide', 'admin')),
  
  -- Profile information
  phone_number TEXT,
  profile_image_url TEXT,
  bio TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'bem', 'nya')),
  
  -- Gamification
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  cash_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  
  -- Streaks and activity
  login_streak INTEGER NOT NULL DEFAULT 0,
  last_login TIMESTAMPTZ,
  last_check_in TIMESTAMPTZ,
  
  -- Preferences
  notification_preferences JSONB DEFAULT '{"email":true,"push":true,"bookings":true,"achievements":true,"messages":true}',
  
  -- Tour guide specific
  tour_guide_verified BOOLEAN DEFAULT FALSE,
  tour_guide_bio TEXT,
  tour_guide_certifications TEXT[],
  commission_rate NUMERIC(5,2),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_xp ON users(xp DESC);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data (excluding role)
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = OLD.role);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all users
CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Destinations Table

```sql
CREATE TABLE destinations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  province TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Nature', 'Wildlife', 'Culture', 'Adventure', 'Historical')),
  
  -- Location
  latitude NUMERIC(10,6) NOT NULL,
  longitude NUMERIC(10,6) NOT NULL,
  address TEXT,
  
  -- Pricing
  entry_fee_local_zmw NUMERIC(10,2),
  entry_fee_international_usd NUMERIC(10,2),
  
  -- Media
  image_url TEXT NOT NULL,
  gallery_images TEXT[],
  video_url TEXT,
  
  -- Stats
  average_rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  
  -- Features
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  secrets JSONB DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_destinations_province ON destinations(province);
CREATE INDEX idx_destinations_category ON destinations(category);
CREATE INDEX idx_destinations_featured ON destinations(featured) WHERE featured = TRUE;
CREATE INDEX idx_destinations_active ON destinations(active) WHERE active = TRUE;

-- Full-text search
CREATE INDEX idx_destinations_search ON destinations 
  USING gin(to_tsvector('english', name || ' ' || description));

-- RLS Policies
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Everyone can read active destinations
CREATE POLICY "Anyone can read active destinations"
  ON destinations FOR SELECT
  USING (active = TRUE OR auth.uid() IS NOT NULL);

-- Admins can insert/update/delete
CREATE POLICY "Admins can manage destinations"
  ON destinations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```


#### Bookings Table

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id BIGINT NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
  tour_guide_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Booking details
  booking_date DATE NOT NULL,
  number_of_people INTEGER NOT NULL CHECK (number_of_people > 0),
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'ZMW')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  
  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_method TEXT,
  payment_transaction_id TEXT,
  
  -- Commission (for tour guides)
  tour_guide_commission NUMERIC(10,2),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_tour_guide ON bookings(tour_guide_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- RLS Policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookings
CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Tour guides can read assigned bookings
CREATE POLICY "Tour guides can read assigned bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = tour_guide_id);

-- Admins can read all bookings
CREATE POLICY "Admins can read all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can create bookings
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users and tour guides can update their bookings
CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = tour_guide_id);
```

#### Reviews Table

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id BIGINT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  images TEXT[],
  
  -- Moderation
  approved BOOLEAN DEFAULT TRUE,
  flagged BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: one review per user per destination
  UNIQUE(user_id, destination_id)
);

-- Indexes
CREATE INDEX idx_reviews_destination ON reviews(destination_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- RLS Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON reviews FOR SELECT
  USING (approved = TRUE);

-- Tourists can create reviews (not tour guides)
CREATE POLICY "Tourists can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
        AND role IN ('international_tourist', 'local_tourist')
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can moderate all reviews
CREATE POLICY "Admins can moderate reviews"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

