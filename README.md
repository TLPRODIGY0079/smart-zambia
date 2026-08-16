# Smart Zambia - Tourism Platform

A tourism platform showcasing Zambia's destinations with gamification features, powered by Supabase.

## Project Structure

```
smart-zambia/
├── supabase/                  # Supabase configuration
│   ├── client.js             # Supabase client initialization
│   ├── schema.sql            # Database schema
│   ├── rls_policies.sql      # Row-level security policies
│   ├── services.js           # Supabase service functions
│   ├── migration.js          # Data migration scripts
│   └── SETUP_GUIDE.md        # Setup instructions
│
├── smart-zambia-frontend/     # Frontend application
│   ├── index.html             # Main HTML file
│   ├── css/                   # Stylesheets
│   └── js/                    # JavaScript modules
│
├── public/                    # Static assets
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

## Features

### Frontend
- 🗺️ Interactive map with destination markers
- 🎮 Gamification (XP, levels, achievements)
- 🏆 Treasure hunt game
- 🥚 Easter eggs
- 🔍 Search and filters
- 📱 Responsive design
- 🌙 Dark mode support

### Backend (Supabase)
- 🔐 Authentication (email, Google, Facebook OAuth)
- 👤 User registration/login
- 📍 Destination CRUD operations
- 🔎 Full-text search
- 🛡️ Row-level security
- � Real-time subscriptions
- 💾 File storage
- 🔔 Notifications

## Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project named `smart-zambia`
3. Follow the detailed setup guide in `supabase/SETUP_GUIDE.md`

### 2. Environment Configuration

Create `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
npm run preview
```

## Supabase Client Usage

```javascript
import { supabase, authService } from './supabase/client.js';

// Sign up
const { data, error } = await authService.signUp(
  'user@example.com',
  'Password123',
  { full_name: 'John Doe' }
);

// Sign in
const { data, error } = await authService.signIn(
  'user@example.com',
  'Password123'
);

// Get destinations
const { data, error } = await supabase
  .from('destinations')
  .select('*')
  .eq('featured', true);
```

## Database Schema

The Supabase schema includes:
- **profiles**: Extended user data
- **user_roles**: Role-based access control
- **destinations**: Tourism destinations
- **bookings**: Tour bookings
- **reviews**: User reviews
- **check_ins**: Location check-ins
- **achievements**: Gamification achievements
- And more...

See `supabase/schema.sql` for the complete schema.

## Technologies Used

### Frontend
- Vanilla JavaScript (ES6 modules)
- Tailwind CSS
- Leaflet.js (maps)
- Font Awesome (icons)
- Vite (build tool)

### Backend
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- @supabase/supabase-js (client library)

## Deployment

### Frontend
Deploy to Vercel, Netlify, or GitHub Pages:

```bash
npm run build
# Deploy the dist/ folder
```

### Supabase
- Database is hosted on Supabase cloud
- No additional deployment needed
- Configure environment variables in your hosting platform

## Additional Features

- [ ] User profiles and saved destinations
- [ ] Reviews and ratings
- [ ] Booking system with Stripe integration
- [ ] Social sharing
- [ ] Multi-language support
- [ ] Image upload for destinations
- [ ] Analytics dashboard

## License

MIT License
