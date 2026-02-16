# Smart Zambia - Backend Integration Guide

## 🎯 Overview

This guide shows how to integrate the Node.js/Express/PostgreSQL backend with your existing frontend.

## 📋 Prerequisites

1. PostgreSQL installed and running on port 5433
2. Node.js v20+ installed
3. Backend folder created at `smart-zambia-backend`

## 🚀 Backend Setup (Step by Step)

### 1. Create Backend Directory Structure

```powershell
cd "C:\Users\Administrator\Desktop\All code\smart-zambia"
mkdir smart-zambia-backend
cd smart-zambia-backend
```

### 2. Initialize Node.js Project

```powershell
npm init -y
```

### 3. Install Dependencies

```powershell
# Production dependencies
npm i express pg dotenv cors bcrypt jsonwebtoken helmet morgan zod

# Development dependencies
npm i -D nodemon
```

### 4. Create Folder Structure

```powershell
mkdir src
mkdir src\db
mkdir src\middleware
mkdir src\routes
mkdir src\utils
mkdir scripts
```

### 5. Create Database Schema

Create file: `src/db/schema.sql` (copy from the provided schema)

### 6. Create Environment File

Create file: `.env`

```env
PORT=3001
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@127.0.0.1:5433/smart_zambia
JWT_SECRET=your-super-secret-random-string-change-this-in-production
CORS_ORIGIN=http://localhost:8000,http://127.0.0.1:8000
```

**Important**: Replace `YOUR_PASSWORD` with your actual PostgreSQL password!

### 7. Update package.json

Add this to your `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

### 8. Create All Backend Files

Copy all the provided files:
- `src/db/pool.js`
- `src/utils/password.js`
- `src/utils/jwt.js`
- `src/middleware/auth.js`
- `src/routes/auth.js`
- `src/routes/admin.js`
- `src/routes/public.js`
- `src/app.js`
- `src/server.js`
- `scripts/seed-admin.js`

### 9. Create PostgreSQL Database

```powershell
# Connect to PostgreSQL
psql -h 127.0.0.1 -p 5433 -U postgres

# Create database
CREATE DATABASE smart_zambia;

# Exit
\q
```

### 10. Run Database Schema

```powershell
psql -h 127.0.0.1 -p 5433 -U postgres -d smart_zambia -f .\src\db\schema.sql
```

### 11. Create Admin User

```powershell
node .\scripts\seed-admin.js admin@smartzambia.com Passw0rd! "Smart Zambia Admin"
```

### 12. Start Backend Server

```powershell
npm run dev
```

You should see:
```
✅ Smart Zambia API running on http://localhost:3001
```

### 13. Test Backend

Open browser or use curl:
```
http://localhost:3001/api/health
```

Should return: `{"ok":true}`

## 🔗 Frontend Integration

### 1. Add API Config to Frontend

File already created: `smart-zambia-frontend/js/api-config.js`

### 2. Update index.html to Load API Config

Add this line in the scripts section (before main.js):

```html
<script type="module" src="js/api-config.js"></script>
```

### 3. Update Authentication Functions

The frontend will now use real API calls instead of localStorage mock data.

**Before (Mock)**:
```javascript
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  // Mock login - just store in localStorage
  state.user = { name: email.split('@')[0], email };
  state.isLoggedIn = true;
}
```

**After (Real API)**:
```javascript
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const data = await AuthAPI.login(email, password);
    state.user = data.user;
    state.isLoggedIn = true;
    // Show success message
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}
```

## 📊 API Endpoints Available

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Destinations
- `GET /api/destinations` - Get all destinations

### Favorites (Authenticated)
- `GET /api/me/favorites` - Get user's favorites
- `POST /api/me/favorites/:id` - Add favorite
- `DELETE /api/me/favorites/:id` - Remove favorite

### Search History (Authenticated)
- `GET /api/me/search-history` - Get search history
- `POST /api/me/search-history` - Save search query

### Notifications (Authenticated)
- `GET /api/me/notifications` - Get notifications
- `POST /api/me/notifications/:id/read` - Mark as read

### Admin (Admin Only)
- `POST /api/admin/destinations` - Add destination
- `GET /api/admin/civic-reports` - Get civic reports
- `PUT /api/admin/civic-reports/:id` - Update report
- `GET /api/admin/civic-analytics` - Get analytics

## 🔐 Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Frontend stores token in localStorage
4. All subsequent requests include token in Authorization header
5. Backend validates token and returns user data

## 🧪 Testing the Integration

### Test 1: Health Check
```javascript
// In browser console
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(console.log);
// Should return: {ok: true}
```

### Test 2: Register User
```javascript
// In browser console
fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  })
})
  .then(r => r.json())
  .then(console.log);
```

### Test 3: Login
```javascript
// In browser console
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
  .then(r => r.json())
  .then(console.log);
```

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `psql -h 127.0.0.1 -p 5433 -U postgres`
- Check `.env` file has correct DATABASE_URL
- Check port 3001 is not in use

### CORS errors
- Make sure CORS_ORIGIN in `.env` includes your frontend URL
- Check frontend is running on http://localhost:8000

### Database connection errors
- Verify PostgreSQL password in `.env`
- Check database exists: `psql -h 127.0.0.1 -p 5433 -U postgres -l`
- Run schema if tables missing

### Authentication errors
- Check JWT_SECRET is set in `.env`
- Verify token is being sent in Authorization header
- Check token hasn't expired (7 days)

## 📝 Next Steps

1. ✅ Set up backend (this guide)
2. ⏳ Update frontend authentication (next)
3. ⏳ Integrate favorites feature
4. ⏳ Integrate search history
5. ⏳ Integrate notifications
6. ⏳ Update admin panel
7. ⏳ Add reviews feature
8. ⏳ Deploy to production

## 🎉 Benefits of Backend Integration

- ✅ Real user authentication
- ✅ Data persistence across devices
- ✅ Secure password storage
- ✅ Role-based access control
- ✅ Scalable to thousands of users
- ✅ Admin dashboard with real data
- ✅ API ready for mobile app

---

**Status**: Backend setup complete, ready for frontend integration
**Next**: Update frontend authentication functions
