# Smart Zambia - Tourism Platform

A full-stack tourism platform showcasing Zambia's destinations with gamification features.

## Project Structure

```
smarland/
├── smart-zambia-api/          # Backend API (Node.js + Express + PostgreSQL)
│   ├── server.js              # Main server file
│   ├── db.js                  # Database connection
│   ├── schema.sql             # Database schema
│   ├── package.json           # Dependencies
│   └── .env.example           # Environment variables template
│
└── smart-zambia-frontend/     # Frontend (Vanilla JS)
    ├── index.html             # Main HTML file
    ├── admin.html             # Admin panel
    ├── css/
    │   └── style.css          # All styles
    └── js/
        ├── api.js             # API service layer
        ├── main.js            # Main application logic
        └── utils.js           # Utility functions
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

### Backend
- 🔐 JWT authentication
- 👤 User registration/login
- 📍 Destination CRUD operations
- 🔎 Full-text search with PostgreSQL
- 🛡️ Admin-only routes

## Setup Instructions

### 1. Database Setup

Install PostgreSQL and create database:

```bash
# Create database
createdb smart_zambia

# Run schema
psql -d smart_zambia -f smart-zambia-api/schema.sql
```

### 2. Backend Setup

```bash
cd smart-zambia-api

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=smart_zambia
# JWT_SECRET=your-secret-key

# Start server
npm start
```

Server runs on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd smart-zambia-frontend

# Option 1: Use Live Server (VS Code extension)
# Right-click index.html > Open with Live Server

# Option 2: Use Python HTTP server
python -m http.server 8000

# Option 3: Use Node http-server
npx http-server -p 8000
```

Frontend runs on `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Destinations
- `GET /api/destinations` - Get all destinations (with filters)
  - Query params: `?province=Southern&category=Nature&featured=true&q=search`
- `GET /api/destinations/:id` - Get single destination

### Admin (Requires JWT)
- `POST /api/admin/destinations` - Create new destination
  - Headers: `Authorization: Bearer <token>`

## Admin Panel

Access admin panel at `http://localhost:8000/admin.html`

1. Register/Login to get JWT token
2. Add token to admin form requests
3. Create new destinations

## API Integration Example

```javascript
// Register user
const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    fullName: 'John Doe'
  })
});

// Login
const loginRes = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginRes.json();

// Create destination (admin)
await fetch('http://localhost:3001/api/admin/destinations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'New Destination',
    province: 'Northern Province',
    category: 'Nature',
    rating: 4.5,
    description: 'Amazing place...',
    image_url: 'https://...',
    entry_fee_foreign: 20,
    entry_fee_local: 5,
    featured: false,
    lat: -15.4167,
    lng: 28.2833,
    secrets: ['Secret 1', 'Secret 2']
  })
});
```

## Environment Variables

Create `.env` file in `smart-zambia-api/`:

```env
PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=smart_zambia
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your-super-secret-jwt-key-change-this
```

## Technologies Used

### Frontend
- Vanilla JavaScript (ES6 modules)
- Tailwind CSS
- Leaflet.js (maps)
- Font Awesome (icons)

### Backend
- Node.js
- Express.js
- PostgreSQL
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)

## Next Steps

### Deployment
1. **Backend**: Deploy to Heroku, Railway, or AWS
2. **Database**: Use managed PostgreSQL (Heroku Postgres, Supabase)
3. **Frontend**: Deploy to Netlify, Vercel, or GitHub Pages

### Flutter Integration
Create a Flutter app that consumes the same API:

```dart
// lib/services/api_service.dart
class ApiService {
  static const baseUrl = 'https://your-api.com/api';
  
  Future<List<Destination>> getDestinations() async {
    final response = await http.get(Uri.parse('$baseUrl/destinations'));
    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.map((json) => Destination.fromJson(json)).toList();
    }
    throw Exception('Failed to load destinations');
  }
}
```

### Additional Features
- [ ] User profiles and saved destinations
- [ ] Reviews and ratings
- [ ] Booking system
- [ ] Social sharing
- [ ] Multi-language support
- [ ] Image upload for destinations
- [ ] Analytics dashboard

## License

MIT License
