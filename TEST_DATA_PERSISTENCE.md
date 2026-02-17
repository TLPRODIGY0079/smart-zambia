# Testing User Data Persistence

## Quick Test Steps

### 1. Setup Database
```bash
cd smart-zambia-api
psql postgresql://postgres:password@localhost:5433/smart_zambia -f update_user_profile_schema.sql
```

Expected output: "User profile schema updated successfully!"

### 2. Start Backend
```bash
cd smart-zambia-api
npm start
```

Expected: Server running on http://localhost:3001

### 3. Open Frontend
Open `smart-zambia-frontend/index.html` in browser (or use Live Server)

### 4. Test Registration
1. Click "Create Account"
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
3. Click "Create Account"
4. Should see main app with 0 XP, Level 1

### 5. Test Data Creation
1. Click on "Discover" tab
2. Click on any destination (e.g., Victoria Falls)
3. Should earn +5 XP
4. Close modal
5. Click on another destination
6. Should earn more XP
7. Click "Profile" tab
8. Should see:
   - XP count (animated)
   - Level (animated)
   - Visited destinations count
   - Recent activity showing visited destinations

### 6. Test Profile Image
1. In Profile tab, click camera icon on avatar
2. Upload an image
3. Should see:
   - Image appears in profile
   - Image appears in navbar
   - +10 XP bonus
   - Toast notification

### 7. Test Logout/Login (CRITICAL TEST)
1. Click logout button (in navbar or mobile menu)
2. Should return to login screen
3. Login with same credentials:
   - Email: test@example.com
   - Password: test123
4. Click "Profile" tab
5. **VERIFY ALL DATA IS RETAINED:**
   - ✅ XP is same as before logout
   - ✅ Level is same
   - ✅ Profile image is displayed
   - ✅ Visited destinations count is correct
   - ✅ Recent activity shows previous visits
   - ✅ Achievements are still there

### 8. Verify in Database
```sql
-- Check user data
SELECT id, email, full_name, xp, level, login_streak, cash_earned 
FROM users 
WHERE email = 'test@example.com';

-- Check visited destinations
SELECT uvd.*, d.name 
FROM user_visited_destinations uvd
JOIN destinations d ON uvd.destination_id = d.id
WHERE uvd.user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Check achievements
SELECT * FROM user_achievements 
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
```

## Expected Results

### After First Login:
- XP: 0
- Level: 1
- Visited: 0
- Achievements: 0

### After Visiting 2 Destinations:
- XP: 10 (5 per destination)
- Level: 1
- Visited: 2
- Achievements: 1 (First Steps)

### After Uploading Profile Image:
- XP: 20 (10 from visits + 10 bonus)
- Level: 1
- Profile image visible

### After Logout and Login Again:
- **ALL DATA SHOULD BE EXACTLY THE SAME**
- XP: 20
- Level: 1
- Visited: 2
- Profile image: Still visible
- Recent activity: Shows 2 visits

## Troubleshooting

### Data Not Persisting
1. Check browser console for errors
2. Verify backend is running
3. Check network tab - should see POST requests to `/api/me/profile/*`
4. Verify JWT token in localStorage: `localStorage.getItem('authToken')`

### Profile Image Not Showing
1. Check localStorage: `localStorage.getItem('profileImage')`
2. Check database: `SELECT profile_image_url FROM users WHERE email = 'test@example.com'`
3. Verify image was synced to backend (check network tab)

### XP Not Syncing
1. Open browser console
2. Visit a destination
3. Should see: "XP saved to backend: {xp: X, level: Y, cashEarned: Z}"
4. If not, check if `window.saveUserXP` function exists

### Backend Errors
1. Check backend console for errors
2. Verify database connection
3. Check if tables exist: `\dt` in psql
4. Verify JWT_SECRET is set in .env

## Advanced Testing

### Test Multiple Users
1. Logout
2. Register new user: test2@example.com
3. Earn different XP
4. Logout
5. Login as first user (test@example.com)
6. Verify first user's data is separate and intact

### Test Achievements
1. Visit 5 different destinations
2. Should unlock "Explorer" achievement
3. Logout and login
4. Verify achievement is still there

### Test Favorites
1. Add destinations to favorites
2. Logout and login
3. Verify favorites are retained (already implemented)

## Success Criteria

✅ User can register and login
✅ XP is earned and displayed
✅ Level increases at 100 XP
✅ Profile image uploads and displays
✅ Visited destinations are tracked
✅ Achievements are earned and saved
✅ **ALL DATA PERSISTS AFTER LOGOUT/LOGIN**
✅ Data is stored in database (verified with SQL)
✅ Multiple users have separate data
✅ No console errors
✅ Smooth animations on profile page

## Performance Check

- Profile load time: < 1 second
- Data sync: Happens in background (non-blocking)
- No lag when earning XP
- Smooth counter animations
- No flickering on page load
