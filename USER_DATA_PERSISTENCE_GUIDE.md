# User Data Persistence Implementation

## Overview
All user data (XP, level, achievements, visited destinations, profile images, login streaks) is now persisted to the backend database and will be retained across logins.

## What Was Implemented

### 1. Database Schema Updates
- **File**: `smart-zambia-api/schema.sql` and `smart-zambia-api/update_user_profile_schema.sql`
- Added columns to `users` table:
  - `xp` - User's experience points
  - `level` - User's current level
  - `login_streak` - Consecutive days logged in
  - `last_login` - Last login timestamp
  - `profile_image_url` - Profile picture (base64 or URL)

- New tables created:
  - `user_achievements` - Stores earned achievements
  - `user_visited_destinations` - Tracks which destinations user has visited

### 2. Backend API Endpoints
- **File**: `smart-zambia-api/server.js`

New endpoints added:
- `GET /api/me/profile` - Get all user profile data (XP, level, achievements, visited destinations)
- `POST /api/me/profile/xp` - Update user XP and level
- `POST /api/me/profile/achievements` - Add new achievement
- `POST /api/me/profile/visited/:destinationId` - Mark destination as visited
- `POST /api/me/profile/streak` - Update login streak
- `POST /api/me/profile/image` - Upload profile image

### 3. Frontend Integration
- **File**: `smart-zambia-frontend/js/api-integration.js`

New functions added:
- `loadUserProfileData()` - Loads all user data from backend on login
- `saveUserXP(xp, level, cashEarned)` - Syncs XP/level to backend
- `saveUserAchievement(achievement)` - Syncs achievement to backend
- `saveVisitedDestination(destinationId)` - Syncs visited destination to backend
- `saveLoginStreak(loginStreak)` - Syncs login streak to backend
- `saveProfileImage(imageUrl)` - Syncs profile image to backend

### 4. Automatic Syncing
- **File**: `smart-zambia-frontend/index.html`

Updated functions to automatically sync data:
- `addScore()` - Now syncs XP to backend after adding points
- `updateLevel()` - Syncs level changes to backend
- `unlockAchievement()` - Syncs new achievements to backend
- `openDestination()` - Syncs visited destinations to backend
- `handleProfileImageUpload()` - Syncs profile image to backend

## How It Works

### On Login/Registration:
1. User logs in or registers
2. Backend returns JWT token and basic user info
3. Frontend calls `loadUserProfileData()` to fetch all user data from backend
4. `window.state` is populated with backend data (XP, level, achievements, etc.)
5. Profile page displays the loaded data

### During Usage:
1. User earns XP → `addScore()` is called → `saveUserXP()` syncs to backend
2. User unlocks achievement → `unlockAchievement()` is called → `saveUserAchievement()` syncs to backend
3. User visits destination → `openDestination()` is called → `saveVisitedDestination()` syncs to backend
4. User uploads profile image → `handleProfileImageUpload()` is called → `saveProfileImage()` syncs to backend

### On Next Login:
1. User logs in
2. `loadUserProfileData()` fetches all data from backend
3. All progress is restored (XP, level, achievements, visited destinations, profile image)

## Setup Instructions

### 1. Update Database Schema
Run the migration script to add new columns and tables:

```bash
cd smart-zambia-api
psql -U postgres -d smart_zambia -f update_user_profile_schema.sql
```

Or if using the connection string:
```bash
psql postgresql://postgres:password@localhost:5433/smart_zambia -f update_user_profile_schema.sql
```

### 2. Restart Backend Server
```bash
cd smart-zambia-api
npm start
```

### 3. Test the Implementation
1. Register a new user or login
2. Earn some XP by visiting destinations
3. Unlock achievements
4. Upload a profile image
5. Logout
6. Login again
7. Verify all data is retained (XP, level, achievements, visited destinations, profile image)

## Data Flow Diagram

```
User Action (Frontend)
    ↓
Update window.state
    ↓
Call sync function (saveUserXP, saveUserAchievement, etc.)
    ↓
POST to Backend API
    ↓
Update Database
    ↓
Return success
```

```
User Login (Frontend)
    ↓
Authenticate with Backend
    ↓
Call loadUserProfileData()
    ↓
GET from Backend API
    ↓
Fetch from Database
    ↓
Return user data
    ↓
Populate window.state
    ↓
Display in UI
```

## Fallback Behavior

If the backend is unavailable or user is not logged in:
- Data is still saved to `localStorage` as before
- Sync functions check if user is logged in before making API calls
- No errors are thrown if sync fails (graceful degradation)

## Testing Checklist

- [ ] Register new user - data starts at 0
- [ ] Earn XP - syncs to backend
- [ ] Level up - syncs to backend
- [ ] Unlock achievement - syncs to backend
- [ ] Visit destination - syncs to backend
- [ ] Upload profile image - syncs to backend
- [ ] Logout and login - all data is restored
- [ ] Check database directly - verify data is stored
- [ ] Test with backend offline - localStorage fallback works

## Database Queries for Verification

Check user profile data:
```sql
SELECT id, email, full_name, xp, level, login_streak, cash_earned 
FROM users 
WHERE email = 'user@example.com';
```

Check user achievements:
```sql
SELECT * FROM user_achievements 
WHERE user_id = 1 
ORDER BY created_at DESC;
```

Check visited destinations:
```sql
SELECT uvd.*, d.name 
FROM user_visited_destinations uvd
JOIN destinations d ON uvd.destination_id = d.id
WHERE uvd.user_id = 1
ORDER BY uvd.visited_at DESC;
```

## Notes

- Profile images are stored as base64 strings in the database (for simplicity)
- For production, consider using cloud storage (AWS S3, Cloudinary) for images
- All sync operations are asynchronous and non-blocking
- Errors in sync operations are logged but don't interrupt user experience
- Reviews are already synced via the reviews API (separate implementation)
- Favorites are already synced via the favorites API (separate implementation)

## Future Enhancements

- Add periodic auto-save (every 30 seconds)
- Implement offline queue for sync operations
- Add conflict resolution for concurrent updates
- Migrate profile images to cloud storage
- Add data export functionality
- Implement data backup/restore
