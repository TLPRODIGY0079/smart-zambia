# Smart Zambia - Enhanced Tourism Platform

A comprehensive full-stack tourism platform showcasing Zambia's destinations with advanced features including travel stories, VR tours, booking systems, offline functionality, and safety features.

## 🆕 New Enhanced Features

### 📸 Travel Stories & Photo Sharing
- **User Photo Uploads**: Share your travel experiences with the community
- **Travel Stories Feed**: Browse photos and stories from other travelers
- **Social Interactions**: Like and comment on travel stories
- **Destination Tagging**: Tag photos with specific destinations

### 👥 Travel Buddy Matching
- **Smart Matching**: Find travel companions based on interests and location
- **Profile Compatibility**: Match with users who share similar travel preferences
- **Connection System**: Send and receive travel buddy requests
- **Group Adventures**: Plan trips with matched travel partners

### 🎫 Comprehensive Booking System
- **Tour Guide Booking**: Reserve certified local guides
  - Wildlife safari specialists
  - Cultural tour experts
  - Adventure sports guides
- **Activity Reservations**: Book popular activities
  - Devil's Pool swimming
  - Gorge Swing adventures
  - Helicopter flights
  - White water rafting
  - Sunset cruises
  - Walking safaris
- **Transportation Booking**: 
  - Domestic and international flights
  - Intercity bus services
  - Car rental options

### 🥽 VR Tours & 360° Experiences
- **Virtual Reality Previews**: Experience destinations before visiting
- **360° Tours**: Immersive panoramic views of attractions
- **"Try Before You Visit"**: Virtual previews of activities like Devil's Pool
- **VR Safari Experiences**: Wildlife encounters in virtual reality

### 🗺️ Route Optimization & Trip Planning
- **Multi-Destination Planning**: Optimize routes for multiple destinations
- **Smart Itinerary Generation**: AI-powered trip planning based on:
  - Trip duration (3 days to 3 weeks)
  - Budget constraints ($500 - $3000+)
  - Personal interests
  - Starting location
- **Cost-Optimized Routes**: Minimize travel time and expenses

### 🎭 Cultural Events Integration
- **Live Events Calendar**: Traditional ceremonies and festivals
  - Kuomboka Ceremony (Lozi people)
  - Nc'wala Ceremony (Ngoni people)
  - Livingstone Cultural Festival
  - Zambia International Trade Fair
- **Event Notifications**: Get alerts for upcoming cultural events
- **Cultural Context**: Learn about traditions and customs

### 💰 Local Payment & Pricing
- **Dual Currency Display**: USD and Kwacha (ZMW) pricing
- **Local Payment Methods**:
  - MTN Mobile Money
  - Airtel Money
  - Visa/Mastercard
- **Real-time Cost Calculator**:
  - Accommodation costs
  - Transportation expenses
  - Activity fees
  - Food budgets
  - Currency conversion (USD ↔ ZMW)

### 🛡️ Enhanced Safety Features
- **Emergency Contacts Integration**:
  - Police: 999 / 991
  - Tourist Helpline: +260-211-229087
  - Medical Emergency services
- **Real-time Safety Alerts**: Weather warnings, road closures, security updates
- **Medical Facility Locator**: Find hospitals and clinics by province
- **Embassy Contact Information**: Consular services for international visitors

### 📱 Offline Functionality
- **Works Without Internet**: Essential features available offline
- **Offline Data Sync**: Automatic synchronization when connection restored
- **Cached Destinations**: Top 20 destinations available offline
- **Emergency Contacts**: Always accessible safety information
- **Offline Report Submission**: Submit civic reports without internet

## 🏗️ Technical Architecture

### Frontend Enhancements
```
smart-zambia-frontend/
├── index.html              # Enhanced main interface
├── js/
│   ├── main.js             # Core application logic
│   ├── enhanced-features.js # New features implementation
│   └── api.js              # API service layer
├── sw.js                   # Service Worker for offline support
└── css/
    └── style.css           # Enhanced responsive styles
```

### Backend API Enhancements
```
smart-zambia-api/
├── server.js               # Main server with enhanced routes
├── enhanced-routes.js      # New API endpoints
├── enhanced_features_schema.sql # Database schema for new features
└── package.json            # Updated dependencies
```

## 🚀 Setup Instructions

### 1. Database Setup (Enhanced)

```bash
# Create database
createdb smart_zambia

# Run all schemas in order
psql -d smart_zambia -f smart-zambia-api/schema.sql
psql -d smart_zambia -f smart-zambia-api/civic_schema.sql
psql -d smart_zambia -f smart-zambia-api/enhanced_schema.sql
psql -d smart_zambia -f smart-zambia-api/enhanced_features_schema.sql
```

### 2. Backend Setup (Enhanced)

```bash
cd smart-zambia-api

# Install dependencies
npm install

# Create .env file with enhanced variables
cp .env.example .env

# Edit .env with your configuration
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=smart_zambia
# JWT_SECRET=your-secret-key
# UPLOAD_PATH=./uploads
# VR_CONTENT_PATH=./vr-content

# Start enhanced server
npm start
```

### 3. Frontend Setup (Enhanced)

```bash
cd smart-zambia-frontend

# Option 1: Use Live Server (VS Code extension)
# Right-click index.html > Open with Live Server

# Option 2: Use Python HTTP server
python -m http.server 8000

# Option 3: Use Node http-server
npx http-server -p 8000
```

## 🔧 New API Endpoints

### Travel Stories
- `GET /api/stories` - Get travel stories feed
- `POST /api/stories` - Upload new travel story with photo

### Travel Buddies
- `GET /api/travel-buddies` - Find compatible travel partners
- `POST /api/buddy-request` - Send travel buddy request

### Booking System
- `GET /api/tour-guides` - Get available tour guides
- `POST /api/bookings/guide` - Book a tour guide
- `POST /api/bookings/activity` - Reserve activities
- `GET /api/bookings/user` - Get user's bookings

### VR Tours
- `GET /api/vr-tours` - Get available VR experiences
- `POST /api/vr-tours/:id/view` - Track VR tour views

### Cultural Events
- `GET /api/cultural-events` - Get upcoming cultural events

### Route Optimization
- `POST /api/itinerary/generate` - Generate optimized travel itinerary

### Safety & Emergency
- `GET /api/emergency-contacts` - Get emergency contact information
- `GET /api/medical-facilities` - Find medical facilities
- `GET /api/safety-alerts` - Get current safety alerts

### Offline Support
- `GET /api/offline-package` - Download offline data package
- `POST /api/sync/offline` - Sync offline data when connection restored

## 💡 Usage Examples

### Book a Tour Guide
```javascript
const booking = await fetch('/api/bookings/guide', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    guide_id: 1,
    date: '2024-06-15',
    duration: 8,
    message: 'Wildlife photography tour'
  })
});
```

### Generate Optimized Itinerary
```javascript
const itinerary = await fetch('/api/itinerary/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    duration: 7,
    budget: 1500,
    interests: ['Wildlife', 'Nature'],
    start_location: 'Lusaka'
  })
});
```

### Upload Travel Story
```javascript
const story = await fetch('/api/stories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Amazing Victoria Falls Experience',
    description: 'The thundering waters were incredible!',
    image_url: 'https://example.com/photo.jpg',
    destination_id: 1
  })
});
```

## 🌟 Key Features Summary

### ✅ Implemented Features
- [x] Travel stories and photo sharing
- [x] Travel buddy matching system
- [x] Comprehensive booking system (guides, activities, transport)
- [x] VR tours and 360° experiences
- [x] Route optimization and trip planning
- [x] Cultural events calendar
- [x] Dual currency pricing (USD/ZMW)
- [x] Local payment methods integration
- [x] Cost calculator with real-time updates
- [x] Emergency contacts and safety alerts
- [x] Medical facility locator
- [x] Embassy contact information
- [x] Offline functionality with sync
- [x] Enhanced responsive design
- [x] Real-time notifications

### 🎯 User Experience Enhancements
- **Seamless Offline Experience**: Core features work without internet
- **Smart Recommendations**: AI-powered suggestions based on user preferences
- **Social Integration**: Connect with fellow travelers and share experiences
- **Comprehensive Planning**: End-to-end trip planning and booking
- **Safety First**: Always-accessible emergency information
- **Local Integration**: Support for local payment methods and currency

### 📊 Performance Optimizations
- **Service Worker**: Efficient caching and offline support
- **Image Optimization**: Lazy loading and responsive images
- **Database Indexing**: Optimized queries for fast data retrieval
- **API Caching**: Reduced server load with intelligent caching
- **Progressive Loading**: Content loads progressively for better UX

## 🚀 Deployment Ready

The enhanced Smart Zambia platform is now ready for production deployment with:
- Scalable architecture
- Offline-first design
- Comprehensive safety features
- Local market integration
- Advanced booking capabilities
- Social travel features

Perfect for promoting Zambian tourism while ensuring visitor safety and providing exceptional user experiences both online and offline.

## 📄 License

MIT License - Built for promoting Zambian tourism and supporting local communities.