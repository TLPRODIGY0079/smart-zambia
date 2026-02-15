# Medium Effort Features - Implementation Guide

## ✅ Feature #1: User Reviews & Ratings (COMPLETE)

### Database Schema
**File**: `smart-zambia-api/reviews_schema.sql`

Tables created:
- `destination_reviews` - Main reviews table
- `review_helpful` - Tracks helpful votes
- `review_photos` - Photos attached to reviews
- `review_responses` - Responses from owners/admins

Features:
- ✅ 1-5 star ratings
- ✅ Review title and text
- ✅ Visit date tracking
- ✅ Photo uploads (up to 5 per review)
- ✅ Helpful votes system
- ✅ Verified reviews badge
- ✅ Soft delete (status field)
- ✅ XP rewards (50 XP per review)

### API Routes
**File**: `smart-zambia-api/reviews-routes.js`

Endpoints:
```
GET    /destinations/:id/reviews      - Get all reviews for destination
GET    /reviews/:id                   - Get single review with details
GET    /users/:id/reviews              - Get user's reviews
POST   /destinations/:id/reviews      - Create new review
PUT    /reviews/:id                   - Update review
DELETE /reviews/:id                   - Delete review (soft)
POST   /reviews/:id/helpful           - Mark review as helpful
POST   /reviews/:id/responses         - Add response to review
```

Features:
- ✅ Pagination (10 per page)
- ✅ Sorting (recent, helpful, rating_high, rating_low)
- ✅ Rating summary with breakdown
- ✅ Authentication required for write operations
- ✅ Ownership verification
- ✅ Duplicate review prevention

### Frontend Module
**File**: `smart-zambia-frontend/js/reviews.js`

Functions:
- `loadReviews(destinationId, page, sort)` - Load and display reviews
- `renderReviews(data)` - Render review cards
- `renderRatingSummary(summary)` - Show rating breakdown
- `openReviewModal(destId, name)` - Open write review form
- `submitReview(event)` - Submit new review
- `toggleHelpful(reviewId)` - Vote review as helpful
- `changePage(page)` - Pagination
- `changeSort(sort)` - Change sort order

UI Components:
- ✅ Rating summary with stars and breakdown
- ✅ Review cards with user info
- ✅ Write review modal with star rating
- ✅ Photo upload preview
- ✅ Helpful voting
- ✅ Pagination controls
- ✅ Sort dropdown

### Integration Steps

1. **Run Database Migration**:
```bash
psql -U your_user -d smart_zambia -f smart-zambia-api/reviews_schema.sql
```

2. **Add Routes to Server**:
```javascript
// In smart-zambia-api/server.js
const reviewsRoutes = require('./reviews-routes');
app.use('/api', reviewsRoutes);
```

3. **Add Script to Frontend**:
```html
<!-- In smart-zambia-frontend/index.html before </body> -->
<script src="js/reviews.js"></script>
```

4. **Add UI to Destination Modal**:
```html
<!-- Add to destination modal -->
<div id="reviewsSection" class="mt-8">
  <!-- Rating Summary -->
  <div id="ratingSummary" class="mb-6"></div>
  
  <!-- Write Review Button -->
  <button onclick="ReviewsModule.openReviewModal(currentDestination.id, currentDestination.name)" 
          class="btn-primary mb-6">
    <i class="fas fa-star mr-2"></i>Write a Review
  </button>
  
  <!-- Sort Options -->
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-xl font-bold">Reviews</h3>
    <select onchange="ReviewsModule.changeSort(this.value)" class="input-field" style="width: auto;">
      <option value="recent">Most Recent</option>
      <option value="helpful">Most Helpful</option>
      <option value="rating_high">Highest Rating</option>
      <option value="rating_low">Lowest Rating</option>
    </select>
  </div>
  
  <!-- Reviews List -->
  <div id="reviewsList"></div>
  
  <!-- Pagination -->
  <div id="reviewsPagination"></div>
</div>
```

5. **Initialize on Destination Open**:
```javascript
// In openDestination() function
ReviewsModule.currentDestination = { id: dest.id, name: dest.name };
ReviewsModule.loadReviews(dest.id);
```

---

## 🎯 Next Features to Implement

### Feature #2: Photo Gallery per Destination
**Status**: Ready to implement

Database needs:
- `destination_photos` table
- Photo metadata (user, date, likes, comments)
- Gallery categories (user-submitted, official, featured)

API endpoints:
- GET /destinations/:id/photos
- POST /destinations/:id/photos
- DELETE /photos/:id
- POST /photos/:id/like

Frontend:
- Lightbox gallery viewer
- Photo upload with drag & drop
- Grid/masonry layout
- Like and comment system

---

### Feature #3: Chat/Messaging
**Status**: Ready to implement

Database needs:
- `conversations` table
- `messages` table
- `message_read_status` table

API endpoints:
- GET /conversations
- GET /conversations/:id/messages
- POST /conversations
- POST /messages
- PUT /messages/:id/read

Frontend:
- Chat UI component
- Real-time updates (WebSocket or polling)
- Message notifications
- Typing indicators

---

### Feature #4: Trip Countdown
**Status**: Ready to implement

Database needs:
- `user_trips` table
- Trip dates and destinations
- Reminder preferences

API endpoints:
- GET /trips
- POST /trips
- PUT /trips/:id
- DELETE /trips/:id

Frontend:
- Countdown timer component
- Trip calendar view
- Reminder settings
- Packing list integration

---

### Feature #5: Destination Comparison
**Status**: Ready to implement

Database needs:
- No new tables (uses existing destination data)
- Comparison history (optional)

API endpoints:
- GET /destinations/compare?ids=1,2,3

Frontend:
- Side-by-side comparison table
- Select destinations to compare
- Save comparisons
- Share comparison

---

### Feature #6: Local Tips Section
**Status**: Ready to implement

Database needs:
- `local_tips` table
- Tip categories (food, transport, safety, etc.)
- User submissions and votes

API endpoints:
- GET /destinations/:id/tips
- POST /destinations/:id/tips
- PUT /tips/:id/vote

Frontend:
- Tips list by category
- Submit tip form
- Upvote/downvote
- Featured tips

---

### Feature #7: Language Phrases
**Status**: Ready to implement

Database needs:
- `language_phrases` table
- Categories (greetings, directions, food, etc.)
- Audio file URLs

API endpoints:
- GET /languages/:lang/phrases
- GET /phrases/:id/audio

Frontend:
- Phrase list by category
- Audio playback
- Phonetic spelling
- Favorites/bookmarks

---

### Feature #8: Packing List Generator
**Status**: Ready to implement

Database needs:
- `packing_templates` table
- Destination-specific items
- Weather-based suggestions

API endpoints:
- GET /destinations/:id/packing-list
- POST /packing-lists
- PUT /packing-lists/:id

Frontend:
- Auto-generated list
- Customizable items
- Check-off functionality
- Share list

---

## 📊 Implementation Priority

Recommended order:
1. ✅ User Reviews & Ratings (DONE)
2. Photo Gallery per Destination (High visual impact)
3. Trip Countdown (High user engagement)
4. Local Tips Section (Valuable content)
5. Destination Comparison (Useful for planning)
6. Language Phrases (Unique feature)
7. Packing List Generator (Practical utility)
8. Chat/Messaging (Complex, implement last)

---

## 🔧 Configuration

### Environment Variables Needed:
```env
# Already have these
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=3000

# New for photo uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Or use AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1
```

### Dependencies to Install:
```bash
# For photo uploads
npm install multer cloudinary
# or
npm install multer aws-sdk

# For real-time chat (optional)
npm install socket.io

# For notifications
npm install web-push
```

---

## 📝 Testing Checklist

### Reviews & Ratings:
- [ ] Can create review with rating 1-5
- [ ] Can add photos to review
- [ ] Can edit own review
- [ ] Can delete own review
- [ ] Can mark review as helpful
- [ ] Pagination works correctly
- [ ] Sorting works (recent, helpful, rating)
- [ ] Rating summary calculates correctly
- [ ] XP awarded on review submission
- [ ] Cannot review same destination twice
- [ ] Verified badge shows for verified users

---

## 🚀 Deployment Notes

1. Run database migrations in order
2. Update server.js to include new routes
3. Add new scripts to frontend HTML
4. Configure environment variables
5. Test all endpoints with Postman
6. Test frontend UI flows
7. Monitor error logs
8. Set up photo storage (Cloudinary/S3)

---

**Status**: Feature #1 (Reviews & Ratings) is complete and ready for integration!
**Next**: Choose which feature to implement next from the list above.
