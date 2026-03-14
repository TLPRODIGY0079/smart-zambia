# Quick Performance Test Guide

## Test the New Features in 2 Minutes!

### 1. Test Skeleton Loaders (30 seconds)

**Destinations Grid:**
1. Open the app
2. Click "Discover" tab
3. ✅ Should see 6 shimmer skeleton cards briefly
4. ✅ Then real destinations fade in

**Tour Guides:**
1. Click "Book" tab
2. ✅ Should see 3 skeleton cards briefly
3. ✅ Then real tour guides appear

### 2. Test Toast System (30 seconds)

**Success Toast:**
1. Click on any destination
2. Click "Add to Wishlist"
3. ✅ Should see green toast slide in from right
4. ✅ Auto-dismisses after 4 seconds

**Info Toast:**
1. Try any action
2. ✅ Should see blue/green toast instead of alert()
3. ✅ Can click X to close manually

**Multiple Toasts:**
1. Quickly click multiple destinations
2. Add to wishlist multiple times
3. ✅ Should see toasts stack vertically

### 3. Test Caching (1 minute)

**First Load:**
1. Open browser console (F12)
2. Refresh page (F5)
3. Look for: "Showing X cached destinations"
4. ✅ If no cache: Shows skeleton → loads data
5. ✅ If cached: Shows data instantly

**Cache Refresh:**
1. Wait 10 seconds
2. Click "Discover" tab again
3. Look in console for: "Cache is fresh, skipping API call"
4. ✅ No API call made (instant display)

**Offline Mode:**
1. Open DevTools → Network tab
2. Set to "Offline"
3. Refresh page
4. ✅ Should still show cached destinations
5. ✅ Toast shows "Failed to load, showing cached data"

## Expected Console Output

### On First Load (No Cache):
```
Loading destinations from API...
Loaded 21 destinations from API
```

### On Return Visit (With Cache):
```
Loading destinations from API...
Showing 21 cached destinations
Cache is fresh, skipping API call
```

### On Stale Cache:
```
Loading destinations from API...
Showing 21 cached destinations
Cache is stale, refreshing from API...
Loaded 21 destinations from API
```

## Visual Checks

### Skeleton Loaders:
- ✅ Shimmer animation (left to right)
- ✅ Matches card layout
- ✅ Smooth transition to real content
- ✅ Works in dark mode

### Toast Notifications:
- ✅ Slides in smoothly
- ✅ Correct color for type
- ✅ Icon matches type
- ✅ Auto-dismisses
- ✅ Can manually close
- ✅ Stacks properly

### Caching:
- ✅ Instant load on return visit
- ✅ Works offline
- ✅ Silent background refresh
- ✅ No loading spinners for cached data

## Performance Metrics

Open DevTools → Performance tab:

### Before Optimizations:
- Time to Interactive: 2-3 seconds
- First Contentful Paint: 2-3 seconds
- Largest Contentful Paint: 2-3 seconds

### After Optimizations:
- Time to Interactive: < 500ms (cached)
- First Contentful Paint: < 100ms (skeleton)
- Largest Contentful Paint: < 1 second

## Mobile Test

1. Open DevTools → Toggle device toolbar
2. Select mobile device
3. ✅ Toasts slide from top (not right)
4. ✅ Skeleton loaders responsive
5. ✅ Everything works smoothly

## Success Criteria

✅ Skeleton loaders show before content
✅ Toasts replace all alert() calls
✅ Cached data shows instantly
✅ Background refresh is silent
✅ Works offline with cached data
✅ No console errors
✅ Smooth animations
✅ Fast perceived performance

## Troubleshooting

### Skeleton doesn't show:
- Hard refresh: Ctrl+Shift+R
- Clear cache and reload

### Toast doesn't appear:
- Check console for errors
- Verify toast container exists

### Cache not working:
- Check localStorage in DevTools
- Look for keys starting with "cache_"
- Clear localStorage and try again

### Still seeing alert():
- Some alerts may not be replaced yet
- Check console for which function called it

## Next Steps

If all tests pass:
1. ✅ Performance optimizations working
2. ✅ App feels fast
3. ✅ No dead moments
4. ✅ Ready for production!

If issues found:
1. Check console for errors
2. Verify all files are saved
3. Hard refresh browser
4. Clear cache and try again
