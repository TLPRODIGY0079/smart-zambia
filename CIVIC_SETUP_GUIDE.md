# Smart Zambia - Civic Data Collection Setup Guide

## Complete Step-by-Step Instructions

### Step 1: Database Setup

1. **Run the new civic schema:**
```bash
# Navigate to your API directory
cd smart-zambia-api

# Run the civic schema (after your existing schema)
psql -d smart_zambia -f civic_schema.sql
```

2. **Verify tables were created:**
```sql
-- Connect to your database
psql -d smart_zambia

-- Check if tables exist
\dt

-- You should see:
-- users
-- civic_reports  
-- user_achievements
-- destinations (existing)
```

### Step 2: Backend Server Update

1. **Install any missing dependencies:**
```bash
cd smart-zambia-api
npm install
```

2. **Start the updated server:**
```bash
npm start
```

3. **Verify new endpoints work:**
```bash
# Test civic endpoints (after creating a user)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"<your_email>","password":"<your_password>","fullName":"Test User"}'

# Login to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<your_email>","password":"<your_password>"}'
```

### Step 3: Frontend Updates

1. **The frontend files have been updated automatically**
2. **Start your frontend server:**
```bash
cd smart-zambia-frontend

# Option 1: Live Server (VS Code)
# Right-click index.html > Open with Live Server

# Option 2: Python server
python -m http.server 8000

# Option 3: Node server
npx http-server -p 8000
```

### Step 4: Test the System

1. **Open the main app:** `http://localhost:8000`
2. **Register a new user** (civic reports require login)
3. **Go to Civic tab** and submit a report
4. **Open admin dashboard:** `http://localhost:8000/civic-admin.html`
5. **Login with the same credentials** to view reports

## New API Endpoints

### Civic Endpoints (Require Authentication)

```javascript
// Submit civic report
POST /api/civic/report
Headers: Authorization: Bearer <token>
Body: {
  "type": "pothole",
  "title": "Large pothole on Main Street",
  "description": "Deep pothole causing vehicle damage",
  "latitude": -15.4167,
  "longitude": 28.2833,
  "address": "Main Street, Lusaka"
}

// Get user's reports
GET /api/civic/my-reports
Headers: Authorization: Bearer <token>

// Get user profile with civic stats
GET /api/civic/profile
Headers: Authorization: Bearer <token>

// Award achievement
POST /api/civic/achievement
Headers: Authorization: Bearer <token>
Body: {
  "achievementId": "civic_hero",
  "achievementName": "Civic Hero",
  "xpAwarded": 50
}
```

### Admin Endpoints (Require Authentication)

```javascript
// Get all civic reports
GET /api/admin/civic-reports?status=pending&type=pothole&limit=50
Headers: Authorization: Bearer <token>

// Update report status
PUT /api/admin/civic-reports/:id
Headers: Authorization: Bearer <token>
Body: {
  "status": "resolved",
  "priority": "high"
}

// Get analytics
GET /api/admin/civic-analytics
Headers: Authorization: Bearer <token>
```

## Database Schema Overview

### Users Table
```sql
- id (Primary Key)
- email (Unique)
- full_name
- password_hash
- civic_xp (Default: 0)
- civic_level (Default: 1)
- cash_earned (Default: 0)
- created_at, updated_at
```

### Civic Reports Table
```sql
- id (Primary Key)
- user_id (Foreign Key)
- type (pothole, flooding, streetlight, waste, transport)
- title
- description
- latitude, longitude
- address
- image_url
- status (pending, in_progress, resolved)
- priority (low, medium, high, critical)
- xp_awarded, cash_awarded
- created_at, updated_at
```

### User Achievements Table
```sql
- id (Primary Key)
- user_id (Foreign Key)
- achievement_id
- achievement_name
- xp_awarded, cash_awarded
- earned_at
```

## How Data Collection Works

### 1. User Flow
1. User opens Smart Zambia app
2. User registers/logs in
3. User goes to "Civic" tab
4. User clicks on a challenge (e.g., "Spot the Pothole")
5. User fills in report details
6. Report is submitted to database
7. User earns XP and cash rewards
8. User can view their reports and stats

### 2. Admin Flow
1. Admin opens `civic-admin.html`
2. Admin logs in with their credentials
3. Admin sees dashboard with:
   - Total reports statistics
   - Charts showing report types and status
   - Map with all report locations
   - Table of all reports
   - Top contributors list
4. Admin can update report status (pending → in progress → resolved)
5. Admin can filter reports by type and status

### 3. Data Storage
- **All civic reports** are stored in PostgreSQL database
- **User profiles** with XP, levels, and cash earned
- **Achievements** are tracked per user
- **Real-time updates** when reports are submitted
- **Geographic data** for mapping reports

## Accessing the Data

### 1. Admin Dashboard
- URL: `http://localhost:8000/civic-admin.html`
- Login with any registered user credentials
- View all reports, analytics, and user stats

### 2. Database Direct Access
```sql
-- Connect to database
psql -d smart_zambia

-- View all reports
SELECT cr.*, u.full_name, u.email 
FROM civic_reports cr 
JOIN users u ON cr.user_id = u.id 
ORDER BY cr.created_at DESC;

-- View user stats
SELECT full_name, email, civic_xp, civic_level, cash_earned,
       (SELECT COUNT(*) FROM civic_reports WHERE user_id = users.id) as total_reports
FROM users 
WHERE civic_xp > 0
ORDER BY civic_xp DESC;

-- Reports by type
SELECT type, COUNT(*) as count, AVG(xp_awarded) as avg_xp
FROM civic_reports 
GROUP BY type;
```

### 3. API Access
```javascript
// Get all reports (admin endpoint)
fetch('http://localhost:3001/api/admin/civic-reports', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));

// Get analytics
fetch('http://localhost:3001/api/admin/civic-analytics', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));
```

## Production Deployment

### 1. Environment Variables
Update your `.env` file:
```env
PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=smart_zambia
DB_PASSWORD=<your_db_password>
DB_PORT=5432
JWT_SECRET=<generate-secure-random-key>
```

### 2. Database Backup
```bash
# Backup your database
pg_dump smart_zambia > smart_zambia_backup.sql

# Restore if needed
psql -d smart_zambia < smart_zambia_backup.sql
```

### 3. Security Considerations
- Change JWT_SECRET in production
- Use HTTPS for all API calls
- Implement rate limiting
- Add input validation and sanitization
- Use environment-specific database credentials

## Troubleshooting

### Common Issues

1. **"Table doesn't exist" error:**
   - Run `civic_schema.sql` in your database
   - Check if PostgreSQL is running

2. **"Authentication failed" error:**
   - Make sure user is registered and logged in
   - Check if JWT token is valid

3. **"Cannot connect to database" error:**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`

4. **Frontend not showing civic data:**
   - Check browser console for errors
   - Verify API endpoints are working
   - Clear browser cache

### Testing Commands

```bash
# Test database connection
psql -d smart_zambia -c "SELECT COUNT(*) FROM civic_reports;"

# Test API endpoints
curl http://localhost:3001/api/destinations

# Check server logs
# Look at your terminal where you ran 'npm start'
```

## Success Indicators

✅ **Database Setup Complete:**
- Tables created successfully
- Can insert/query civic reports

✅ **Backend Working:**
- Server starts without errors
- API endpoints respond correctly
- Authentication works

✅ **Frontend Integration:**
- Users can submit civic reports
- Reports appear in admin dashboard
- XP and cash rewards are awarded

✅ **Admin Dashboard:**
- Shows real-time statistics
- Map displays report locations
- Can update report status

Your Smart Zambia civic data collection system is now fully operational!