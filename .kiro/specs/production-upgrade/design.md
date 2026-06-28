# Design Document: Smart Zambia Production Upgrade

## Overview

The Smart Zambia Production Upgrade transforms the existing localStorage-based MVP (70% complete) into a fully production-ready tourism gamification platform with persistent data storage, enterprise-grade security, role-based access control, and comprehensive testing. This upgrade addresses the fundamental architecture limitations that prevent the current system from being deployed to production.

### Current State

The Smart Zambia platform currently consists of:
- **Frontend**: Static HTML/CSS/JavaScript application serving 21 Zambian tourist destinations
- **Data Storage**: Browser localStorage for all user data (non-persistent across devices/sessions)
- **Authentication**: None - users identified only by localStorage entries
- **Backend**: Basic Express.js API with PostgreSQL (schema exists but largely unused by frontend)
- **Features**: Daily check-ins, XP system, achievements, trip planner, favorites (all localStorage-based)
- **Deployment**: Attempted Vercel deployment with configuration issues

### Target State

The production-ready system will feature:
- **Backend**: Supabase Backend-as-a-Service (PostgreSQL + Authentication + Storage + Realtime)
- **Authentication**: Secure Supabase Auth with email/password and social OAuth (Google, Facebook)
- **Role System**: Four-tier role-based access control (International Tourist, Local Tourist, Tour Guide, Admin)
- **Data Persistence**: All user data, bookings, content stored in Supabase with Row Level Security
- **Real-Time Features**: Live notifications, chat, dashboard updates via Supabase Realtime
- **Payment Integration**: Stripe for international payments, mobile money for local payments
- **Deployment**: Production-ready Vercel configuration with proper environment management
- **Testing**: Comprehensive unit, integration, E2E, performance, and security testing

### Design Principles

1. **Migration-First**: Preserve existing user data and features during transition
2. **Security by Default**: Implement defense-in-depth with multiple security layers
3. **Role-Based Everything**: All features filtered through role-based permissions
4. **Real-Time by Design**: Leverage Supabase Realtime for instant updates
5. **Test-Driven Confidence**: Comprehensive testing at all levels before production
6. **Progressive Enhancement**: Build PWA features for mobile-first experience
7. **Scalable Architecture**: Design for 100+ concurrent users with growth path


## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                USERS                                     │
│  [International Tourists] [Local Tourists] [Tour Guides] [Admins]       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE NETWORK                              │
│  [CDN] [SSL/TLS] [DDoS Protection] [Global Distribution]               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND APPLICATION                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Static Assets (HTML, CSS, JS)                                   │  │
│  │  - Service Worker (PWA, offline support)                         │  │
│  │  - Code Splitting (route-based lazy loading)                     │  │
│  │  - Optimized Images (WebP, responsive)                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Client-Side Application Logic                                   │  │
│  │  - Authentication State Management                               │  │
│  │  - Role-Based UI Rendering                                       │  │
│  │  - Real-Time Subscription Handlers                               │  │
│  │  - Offline-First Data Sync                                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE BACKEND                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Supabase Auth                                                   │  │
│  │  - Email/Password Authentication                                 │  │
│  │  - Google OAuth                                                  │  │
│  │  - Facebook OAuth                                                │  │
│  │  - JWT Token Management                                          │  │
│  │  - Session Handling (30-min timeout)                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Supabase Database (PostgreSQL)                                  │  │
│  │  - Row Level Security (RLS) Policies                             │  │
│  │  - Relational Data Models                                        │  │
│  │  - Full-Text Search Indexes                                      │  │
│  │  - Materialized Views for Analytics                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Supabase Storage                                                │  │
│  │  - User Profile Images                                           │  │
│  │  - Destination Photos                                            │  │
│  │  - Review Images                                                 │  │
│  │  - Tour Guide Verification Documents                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Supabase Realtime                                               │  │
│  │  - WebSocket Connections                                         │  │
│  │  - Live Notifications                                            │  │
│  │  - Chat Messages                                                 │  │
│  │  - Dashboard Updates                                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                ┌────────────────┴──────────────────┐
                │                                   │
                ▼                                   ▼
┌──────────────────────────────────┐  ┌─────────────────────────────────────┐
│  Third-Party Integrations        │  │  Monitoring & Analytics             │
│  - Stripe (International)        │  │  - Google Analytics 4               │
│  - Mobile Money (Local)          │  │  - Sentry Error Tracking            │
│  - Google Maps API               │  │  - Vercel Analytics                 │
│  - SendGrid (Email)              │  │  - Uptime Monitoring                │
└──────────────────────────────────┘  └─────────────────────────────────────┘
```

### Architecture Decisions

#### Why Supabase Over Custom Backend?

**Decision**: Migrate from custom Express/PostgreSQL backend to Supabase Backend-as-a-Service.

**Rationale**:
1. **Authentication Built-In**: Supabase provides enterprise-grade auth (email/password, OAuth) out of the box, eliminating custom JWT implementation risks
2. **Row Level Security**: Database-level security policies ensure data isolation between users without application-level permission checks
3. **Real-Time Capabilities**: WebSocket infrastructure for live updates without managing connection pools or scaling concerns
4. **Automatic API Generation**: REST and GraphQL APIs auto-generated from database schema
5. **Managed Infrastructure**: Automatic backups, scaling, monitoring without DevOps overhead
6. **Time to Production**: Reduces development time by 60-70% compared to building equivalent features

**Trade-offs**:
- Vendor lock-in to Supabase (mitigated: PostgreSQL underneath allows data portability)
- Less control over infrastructure (acceptable: focus is on business logic, not infrastructure)
- Cost scaling with usage (acceptable: pricing competitive with self-hosted at 100-1000 users)

#### Frontend-Only Deployment on Vercel

**Decision**: Deploy frontend as static site on Vercel, backend on Supabase (no custom API server).

**Rationale**:
1. **Serverless Architecture**: No server maintenance, automatic scaling
2. **Edge Network**: Global CDN reduces latency for international tourists
3. **Zero-Config Deployment**: Git push triggers automatic builds
4. **Cost Efficiency**: Free tier sufficient for MVP, scales with usage


#### Four-Tier Role System

**Decision**: Implement hierarchical role system with distinct permissions per role.

**Roles**:
1. **International Tourist**: Browse, book, review, earn XP (USD pricing, international payments)
2. **Local Tourist**: All International Tourist features + local discounts, ZMW pricing, mobile money, civic features, local language support
3. **Tour Guide**: Manage bookings, view earnings, chat with tourists, availability calendar (cannot write reviews to avoid conflicts of interest)
4. **Admin**: Full system access, user management, content moderation, analytics, tour guide verification

**Rationale**: Different user types have fundamentally different needs and pricing structures, requiring distinct permission sets and UI experiences.

### Migration Strategy

#### Phase 1: Parallel Infrastructure (Week 1)

1. Set up Supabase project and configure authentication providers
2. Create database schema matching current localStorage structure
3. Implement RLS policies for all tables
4. Deploy Supabase client library to frontend (no breaking changes)

#### Phase 2: Feature-by-Feature Migration (Weeks 2-4)

Migrate one feature at a time to minimize risk:

1. **Authentication** (Week 2): Implement Supabase Auth, add registration/login screens
2. **User Profiles** (Week 2): Migrate user data from localStorage to users table
3. **Daily Check-Ins** (Week 3): Migrate check-in history, implement streak calculation in database
4. **XP & Achievements** (Week 3): Migrate gamification data, implement leaderboard
5. **Trip Planner** (Week 3): Migrate saved trips, implement sharing
6. **Favorites** (Week 4): Migrate favorite destinations, implement collections
7. **Search History** (Week 4): Implement search logging and suggestions

#### Phase 3: New Production Features (Weeks 5-6)

1. **Role System**: Implement four-tier roles with RLS policies
2. **Real-Time**: Add notifications, chat, live dashboard updates
3. **Payments**: Integrate Stripe and mobile money
4. **Admin Dashboard**: Build live analytics and moderation tools

#### Phase 4: Testing & Launch Preparation (Weeks 7-8)

1. **Testing**: Execute comprehensive test suite (unit, integration, E2E, performance, security)
2. **Security Audit**: Review all RLS policies, authentication flows, input validation
3. **Performance Optimization**: Implement code splitting, lazy loading, caching
4. **Beta Testing**: Deploy to staging, gather feedback from 20+ beta users
5. **Documentation**: Complete all technical and user documentation


## Components and Interfaces

### Authentication Layer

#### Supabase Auth Integration

**Components**:
- `AuthService`: Wrapper around Supabase Auth client
- `AuthContext`: React/vanilla JS context for auth state management
- `ProtectedRoute`: Component/function to guard authenticated routes
- `RoleGuard`: Component/function to enforce role-based access

**Key Methods**:
```javascript
// AuthService Interface
class AuthService {
  async signUp(email, password, role, additionalData)
  async signIn(email, password)
  async signInWithGoogle()
  async signInWithFacebook()
  async signOut()
  async resetPassword(email)
  async updatePassword(newPassword)
  async getSession()
  async refreshSession()
  onAuthStateChange(callback)
}
```

**Authentication Flow**:
1. User submits credentials via login/registration form
2. Frontend calls `AuthService.signUp()` or `AuthService.signIn()`
3. Supabase validates credentials, returns JWT token
4. Token stored in `localStorage` (persistent) and `AuthContext` (in-memory)
5. Supabase client automatically includes token in all subsequent requests
6. RLS policies enforce data access based on `auth.uid()` and role

**Session Management**:
- JWT tokens expire after 1 hour (Supabase default)
- Refresh tokens valid for 7 days
- Automatic refresh 5 minutes before expiration via `AuthService.refreshSession()`
- Idle timeout: 30 minutes of inactivity triggers logout
- Token stored in httpOnly cookie (if backend) or localStorage (client-only)

### User Role System

#### Role Assignment

**Role Storage**: `user_roles` table with many-to-many relationship to users
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('international_tourist', 'local_tourist', 'tour_guide', 'admin')),
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role)
);
```

**Role Assignment Logic**:
- **International Tourist**: Default role assigned on registration
- **Local Tourist**: Requires Zambian phone number verification or NRC validation
- **Tour Guide**: Requires application submission + admin approval + document verification
- **Admin**: Manually assigned by existing admin (seeded during initial setup)


#### Role-Based Access Control (RBAC)

**Permission Matrix**:

| Feature | International Tourist | Local Tourist | Tour Guide | Admin |
|---------|----------------------|---------------|------------|-------|
| Browse destinations | ✓ | ✓ | ✓ | ✓ |
| Book trips | ✓ | ✓ | ✗ | ✓ |
| Write reviews | ✓ | ✓ | ✗ | ✓ |
| View reviews | ✓ | ✓ | ✓ | ✓ |
| Trip planner | ✓ | ✓ | ✗ | ✓ |
| Favorites | ✓ | ✓ | ✗ | ✓ |
| Daily check-in | ✓ | ✓ | ✗ | ✓ |
| XP & Achievements | ✓ | ✓ | ✗ | ✓ |
| Local discounts | ✗ | ✓ | ✗ | ✓ |
| Mobile money payment | ✗ | ✓ | ✓ | ✓ |
| Local language | ✗ | ✓ | ✓ | ✓ |
| Civic engagement | ✗ | ✓ | ✗ | ✓ |
| Tour dashboard | ✗ | ✗ | ✓ | ✓ |
| Manage bookings | Own only | Own only | Assigned | All |
| Chat with tourists | ✗ | ✗ | ✓ | ✓ |
| View earnings | ✗ | ✗ | ✓ | ✓ |
| User management | ✗ | ✗ | ✗ | ✓ |
| Content moderation | ✗ | ✗ | ✗ | ✓ |
| Verify tour guides | ✗ | ✗ | ✗ | ✓ |
| Analytics dashboard | ✗ | ✗ | ✗ | ✓ |
| System settings | ✗ | ✗ | ✗ | ✓ |

**RLS Policy Examples**:

```sql
-- Bookings: Users can view their own bookings, tour guides see assigned, admins see all
CREATE POLICY "view_bookings" ON bookings
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() = tour_guide_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Reviews: Anyone can read, only tourists can create, admins can delete
CREATE POLICY "create_reviews" ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('international_tourist', 'local_tourist')
    )
  );

-- User management: Only admins can update user data
CREATE POLICY "admin_update_users" ON profiles
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
```


### Frontend Components

#### Core UI Components

**`<DestinationCard>`**: Displays destination with role-based pricing
- Props: `destination`, `userRole`
- Displays USD for international tourists, ZMW for local tourists/guides
- Shows "Local Discount" badge for local tourists
- Renders appropriate booking button based on role

**`<BookingForm>`**: Multi-step booking wizard
- Step 1: Select dates and group size
- Step 2: Choose payment method (Stripe for international, mobile money for local)
- Step 3: Confirm and pay
- Role-based pricing calculation
- Integration with Stripe/mobile money APIs

**`<Notification>`**: Real-time notification component
- Subscribes to Supabase Realtime channel: `notifications:{user_id}`
- Displays toast notifications for new bookings, achievements, messages
- Mark as read/unread functionality
- Category filtering (bookings, achievements, messages, system)

**`<ChatWidget>`**: Real-time chat interface
- Available for tourists chatting with their assigned tour guide
- Supabase Realtime for instant message delivery
- Typing indicators
- Image upload support
- Unread message count badge

**`<AdminDashboard>`**: Live analytics dashboard
- Real-time metrics: active users, bookings today, revenue
- Chart components: user growth, popular destinations, revenue trends
- Content moderation queue
- Tour guide verification queue
- Uses Supabase Realtime subscriptions for live updates

**`<TourGuideDashboard>`**: Tour guide management interface
- Upcoming bookings calendar
- Assigned tourist groups
- Earnings tracker with monthly breakdown
- Availability management
- Review and rating display

#### Data Fetching Strategy

**Supabase Client Patterns**:

```javascript
// Simple fetch with RLS automatic filtering
const { data, error } = await supabase
  .from('destinations')
  .select('*')
  .eq('featured', true);

// Real-time subscription
const subscription = supabase
  .channel('public:notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    displayNotification(payload.new);
  })
  .subscribe();

// Optimistic updates
const updateProfile = async (updates) => {
  // Update UI immediately (optimistic)
  setProfile({ ...profile, ...updates });

  // Send to database
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  // Rollback on error
  if (error) {
    setProfile(profile); // revert
    showError(error.message);
  }
};
```


### Payment Integration

#### Stripe Integration (International Tourists)

**Components**:
- `StripePaymentForm`: Embedded Stripe Elements for card input
- `PaymentService`: Wrapper around Stripe API

**Flow**:
1. User completes booking form with dates and group size
2. Frontend calculates total price in USD
3. Frontend creates Stripe Payment Intent via Supabase Edge Function
4. User enters card details in Stripe Elements (PCI-compliant iframe)
5. Stripe processes payment, returns success/failure
6. On success: Create booking record in database, send confirmation email
7. On failure: Display error, allow retry

**Edge Function** (runs on Supabase):
```javascript
// supabase/functions/create-payment-intent/index.ts
import Stripe from 'stripe';

export default async function handler(req) {
  const { amount, currency, bookingDetails } = await req.json();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    metadata: bookingDetails
  });

  return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }));
}
```

#### Mobile Money Integration (Local Tourists & Tour Guides)

**Providers**: MTN Mobile Money, Airtel Money

**Components**:
- `MobileMoneyForm`: Phone number input + provider selection
- `MobileMoneyService`: API integration with mobile money gateways

**Flow**:
1. User selects mobile money payment method
2. User enters phone number and selects provider (MTN/Airtel)
3. Frontend calls Supabase Edge Function to initiate payment
4. Provider sends push notification to user's phone
5. User approves payment on phone
6. Webhook callback confirms payment
7. Create booking record, send confirmation

**Webhook Handler**:
```javascript
// supabase/functions/mobile-money-webhook/index.ts
export default async function handler(req) {
  const signature = req.headers.get('x-webhook-signature');
  const payload = await req.json();

  // Verify signature
  if (!verifySignature(signature, payload)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Update booking status
  if (payload.status === 'success') {
    await supabaseAdmin
      .from('bookings')
      .update({ payment_status: 'paid', paid_at: new Date() })
      .eq('id', payload.booking_id);

    // Send confirmation email
    await sendBookingConfirmation(payload.booking_id);
  }

  return new Response('OK');
}
```


## Data Models

### Core Tables

#### users (managed by Supabase Auth)
```sql
-- Managed by Supabase, read-only from application
auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMP,
  last_sign_in_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### profiles (extended user data)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  nrc_number TEXT, -- Zambian National Registration Card (for local tourist verification)
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'bem', 'ny')),
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_bookings INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS: Users can view all profiles, update only their own
CREATE POLICY "view_profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

#### user_roles
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('international_tourist', 'local_tourist', 'tour_guide', 'admin')),
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT false, -- For tour guides: verification status
  verification_documents JSONB, -- Links to Supabase Storage files
  PRIMARY KEY (user_id, role)
);

-- RLS: Users see their own roles, admins see all
CREATE POLICY "view_own_roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_view_roles" ON user_roles FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
```

#### destinations
```sql
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(province, ''))
  ) STORED
);

CREATE INDEX destinations_search_idx ON destinations USING GIN (search_vector);
CREATE INDEX destinations_province_idx ON destinations (province);
CREATE INDEX destinations_featured_idx ON destinations (featured);

-- RLS: Everyone can read destinations, only admins can modify
CREATE POLICY "view_destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "admin_manage_destinations" ON destinations FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
```


#### bookings
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  paid_at TIMESTAMP,
  booking_status TEXT DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed')),
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX bookings_user_idx ON bookings (user_id);
CREATE INDEX bookings_tour_guide_idx ON bookings (tour_guide_id);
CREATE INDEX bookings_status_idx ON bookings (booking_status);

-- RLS: Users see own bookings, tour guides see assigned, admins see all
CREATE POLICY "view_bookings" ON bookings FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() = tour_guide_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "create_bookings" ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_bookings" ON bookings FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = tour_guide_id);
```

#### reviews
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL CHECK (length(content) >= 20),
  image_urls TEXT[], -- Review photos
  helpful_count INTEGER DEFAULT 0,
  verified_visit BOOLEAN DEFAULT false, -- True if user has checked in at destination
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, destination_id) -- One review per destination per user
);

CREATE INDEX reviews_destination_idx ON reviews (destination_id);
CREATE INDEX reviews_rating_idx ON reviews (rating);

-- RLS: Everyone reads, tourists create/update own, admins moderate
CREATE POLICY "view_reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "create_reviews" ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('international_tourist', 'local_tourist')
    )
  );
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
```


#### check_ins
```sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations(id),
  checked_in_at TIMESTAMP DEFAULT NOW(),
  latitude DECIMAL(10, 8), -- For location verification
  longitude DECIMAL(11, 8),
  xp_awarded INTEGER DEFAULT 10,
  
  UNIQUE(user_id, destination_id, DATE(checked_in_at)) -- One check-in per destination per day
);

CREATE INDEX check_ins_user_idx ON check_ins (user_id);
CREATE INDEX check_ins_date_idx ON check_ins (DATE(checked_in_at));

-- RLS: Users see own check-ins, admins see all
CREATE POLICY "view_own_check_ins" ON check_ins FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "create_check_ins" ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### achievements
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 0,
  badge_tier TEXT CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_achievements (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- RLS: Everyone reads achievements, users see own unlocks
CREATE POLICY "view_achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "view_own_unlocks" ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);
```

#### trip_plans
```sql
CREATE TABLE trip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX trip_plans_user_idx ON trip_plans (user_id);
CREATE INDEX trip_plans_share_idx ON trip_plans (share_token) WHERE share_token IS NOT NULL;

-- RLS: Users see own plans and public plans, admins see all
CREATE POLICY "view_trip_plans" ON trip_plans FOR SELECT
  USING (
    auth.uid() = user_id OR
    is_public = true OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "manage_own_plans" ON trip_plans FOR ALL
  USING (auth.uid() = user_id);
```

