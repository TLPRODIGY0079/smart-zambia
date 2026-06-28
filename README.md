# Smart Zambia - Tourism Platform

A full-stack tourism platform showcasing Zambia's destinations with gamification features, now upgraded with Supabase backend for production-ready scalability.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier)
- Git

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cd smart-zambia-frontend
cp .env.example .env.local

# Add your Supabase credentials to .env.local:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start development server
cd ..
npm run dev
```

Visit `http://localhost:8000`

## 📦 Project Structure

```
smart-zambia/
├── supabase/                  # Supabase configuration
│   ├── schema.sql             # Database schema (17 tables)
│   ├── rls_policies.sql       # Security policies (60+ policies)
│   ├── client.js              # Supabase client + auth services
│   ├── services.js            # Additional services (bookings, reviews, etc.)
│   ├── migration.js           # localStorage migration tool
│   ├── .env.example           # Environment variables template
│   └── SETUP_GUIDE.md         # Supabase setup instructions
│
├── smart-zambia-frontend/     # Frontend application
│   ├── index.html             # Main application
│   ├── auth.html              # Authentication UI
│   ├── admin.html             # Admin dashboard
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript modules
│   │   ├── supabase-integration.js  # Supabase auth integration
│   │   ├── profile.js         # Profile management
│   │   └── ui-utils.js        # UI utilities
│   ├── assets/                # Static assets
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── netlify.toml           # Netlify configuration
│   └── .env.example           # Frontend environment variables
│
├── smart-zambia-api/          # Legacy backend (being phased out)
│   ├── server.js              # Express server
│   ├── schema.sql             # Legacy schema
│   └── .env                   # Legacy environment
│
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite build configuration
├── vercel.json               # Vercel deployment config
├── .gitignore                # Git ignore rules
├── NETLIFY_DEPLOYMENT_GUIDE.md  # Netlify deployment guide
├── IMPLEMENTATION_ROADMAP.md  # Complete implementation plan
└── README.md                 # This file
```

## ✨ Features

### Frontend
- 🗺️ Interactive map with destination markers (Leaflet)
- 🎮 Gamification (XP, levels, achievements, leaderboards)
- 🏆 Treasure hunt game with easter eggs
- 🥚 Hidden secrets and achievements
- 🔍 Search with full-text search
- 📱 Responsive design (mobile-first)
- 🌙 Dark mode support
- 🔐 Supabase authentication (email/password, Google, Facebook OAuth)
- 👥 Four-tier role system (International Tourist, Local Tourist, Tour Guide, Admin)
- 💾 localStorage to Supabase migration
- 📋 Trip planner with sharing
- ⭐ Favorites with collections
- 📝 Reviews and ratings
- 💬 Real-time chat (tour guide communication)
- 🔔 Real-time notifications
- 📊 Admin dashboard with analytics
- 💰 Tour guide earnings tracking

### Backend (Supabase)
- �️ PostgreSQL database with 17 tables
- � Row Level Security (RLS) policies
- 👤 Authentication with OAuth providers
- 🔄 Real-time subscriptions
- 📁 Storage for images and documents
- 📧 Email templates
- 🔗 Edge Functions support

## �️ Setup Instructions

### 1. Supabase Setup

Follow the detailed guide in `supabase/SETUP_GUIDE.md`:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Configure authentication providers (Email, Google, Facebook)
3. Run the database schema (`supabase/schema.sql`)
4. Apply RLS policies (`supabase/rls_policies.sql`)
5. Get your credentials (URL and anon key)

### 2. Local Development

```bash
# Install dependencies
npm install

# Configure environment variables
cd smart-zambia-frontend
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
cd ..
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

Output will be in `smart-zambia-frontend/dist/`

## 🌐 Deployment

### Netlify (Recommended)

Follow the detailed guide in `NETLIFY_DEPLOYMENT_GUIDE.md`:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

Or deploy via Netlify dashboard:
1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `smart-zambia-frontend/dist`
4. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Configuration is in `vercel.json`.

## 📊 Database Schema

### Tables
- `profiles` - User profiles with XP, level, streaks
- `user_roles` - Four-tier role assignments
- `destinations` - Destinations with dual pricing (USD/ZMW)
- `bookings` - Booking management
- `reviews` - Review system
- `check_ins` - Daily check-ins with location
- `achievements` - Achievement definitions
- `user_achievements` - User achievement unlocks
- `trip_plans` - Trip planner with sharing
- `favorites` - Favorites with collections
- `search_history` - Search history
- `notifications` - Real-time notifications
- `chat_messages` - Tour guide chat
- `tour_guide_applications` - Tour guide verification
- `commissions` - Commission tracking
- `civic_reports` - Civic engagement
- `admin_audit_log` - Admin action logging

### Security
- Row Level Security (RLS) on all tables
- Role-based access control
- Database-level permission enforcement
- 60+ security policies

## � Authentication

### Supported Methods
- Email/Password
- Google OAuth
- Facebook OAuth

### Roles
- **International Tourist** - Full access to all features
- **Local Tourist** - Local pricing, NRC verification
- **Tour Guide** - Booking management, earnings tracking
- **Admin** - Full system access, analytics

### Migration
Automatic localStorage to Supabase migration on first login with user consent.

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests (Playwright)
npx playwright test
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run lint         # Lint code
npm run format       # Format code
```

## 🔧 Environment Variables

### Required
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous public key

### Optional
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API for directions
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key for payments

## 📚 Documentation

- `supabase/SETUP_GUIDE.md` - Supabase setup instructions
- `NETLIFY_DEPLOYMENT_GUIDE.md` - Netlify deployment guide
- `IMPLEMENTATION_ROADMAP.md` - Complete implementation roadmap
- `SUPABASE_MIGRATION_SUMMARY.md` - Migration summary

## 🚧 Current Status

**Phase 1**: ✅ Complete (Supabase Infrastructure)
**Phase 2**: ✅ Complete (Authentication & Roles)
**Phase 3**: ⏳ Pending (Feature Migration)
**Phase 4**: ⏳ Pending (Real-Time Features)
**Phase 5**: ⏳ Pending (Payment Integration)
**Phase 6**: ⏳ Pending (Deployment & Security)
**Phase 7**: ⏳ Pending (Testing)
**Phase 8**: ⏳ Pending (Enhancements)
**Phase 9**: ⏳ Pending (Documentation & Legal)
**Phase 10**: ⏳ Pending (Launch)

**Overall Progress**: 25% of total implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Open an issue on GitHub
- Check documentation in `/docs` folder
- Review Supabase docs at [supabase.com/docs](https://supabase.com/docs)

## Technologies Used

### Frontend
- Vanilla JavaScript (ES6 modules)
- Tailwind CSS
- Leaflet.js (maps)
- Font Awesome (icons)
- Supabase Client SDK

### Backend (Supabase)
- PostgreSQL
- Supabase Auth
- Supabase Realtime
- Supabase Storage
- Row Level Security (RLS)

### Build Tools
- Vite
- Netlify/Vercel for deployment

## 🚧 Legacy Backend

The `smart-zambia-api/` folder contains the legacy Express.js backend that is being phased out in favor of Supabase. It is kept for reference but should not be used for new development.

## 📈 Roadmap

See `IMPLEMENTATION_ROADMAP.md` for the complete implementation plan covering all 51 requirements for the production upgrade.

## 📄 License

MIT License
