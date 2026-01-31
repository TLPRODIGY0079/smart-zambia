# Smart Zambia - Data Access Guide

## Current Data Storage: Browser localStorage

All user data is currently stored locally in the browser. Here's how to access it:

### 1. Browser Developer Tools
1. Open your browser (Chrome/Firefox/Edge)
2. Press F12 or right-click → Inspect
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Click **Local Storage** → `http://localhost:8000`
5. View all stored data keys:
   - `civicReports` - All civic issue reports
   - `civicXP` - User's civic experience points
   - `civicLevel` - User's civic level
   - `cashEarned` - Total cash rewards earned
   - `achievements` - Unlocked achievements
   - `visitedDestinations` - Destinations visited
   - `userReviews` - User reviews
   - `travelStats` - Travel statistics

### 2. JavaScript Console Access
Open browser console (F12 → Console) and run:

```javascript
// View all civic reports
console.log(JSON.parse(localStorage.getItem('civicReports') || '[]'));

// View user stats
console.log({
  civicXP: localStorage.getItem('civicXP'),
  civicLevel: localStorage.getItem('civicLevel'),
  cashEarned: localStorage.getItem('cashEarned'),
  totalReports: JSON.parse(localStorage.getItem('civicReports') || '[]').length
});

// Export all data
const allData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  allData[key] = localStorage.getItem(key);
}
console.log('All Smart Zambia Data:', allData);
```

### 3. Data Export Function
Add this to your browser console to export data as JSON:

```javascript
function exportSmartZambiaData() {
  const data = {
    civicReports: JSON.parse(localStorage.getItem('civicReports') || '[]'),
    civicXP: parseInt(localStorage.getItem('civicXP') || '0'),
    civicLevel: parseInt(localStorage.getItem('civicLevel') || '1'),
    cashEarned: parseInt(localStorage.getItem('cashEarned') || '0'),
    achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
    visitedDestinations: JSON.parse(localStorage.getItem('visitedDestinations') || '[]'),
    userReviews: JSON.parse(localStorage.getItem('userReviews') || '{}'),
    travelStats: JSON.parse(localStorage.getItem('travelStats') || '{}'),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'smart-zambia-data.json';
  a.click();
}

// Run this to download your data
exportSmartZambiaData();
```

## Limitations of Current Setup

1. **Data is device-specific** - Only available on the browser/device where it was created
2. **No central database** - Data isn't shared between users or devices
3. **Can be lost** - Clearing browser data will delete everything
4. **No analytics** - Can't analyze patterns across all users

## Next Steps: Database Integration

To collect data centrally, you would need to:

1. **Add database endpoints** to your API server
2. **Modify the frontend** to send data to the server
3. **Create admin dashboard** to view collected data

Would you like me to implement a proper database backend to collect this civic data centrally?