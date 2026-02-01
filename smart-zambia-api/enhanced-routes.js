// Enhanced API endpoints for Smart Zambia
// Add these routes to server.js

// ========================
// TRAVEL STORIES & PHOTOS
// ========================

// Get travel stories
app.get('/api/stories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.full_name, up.profile_image_url 
      FROM travel_stories s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY s.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Stories error:', err);
    res.status(500).json({ error: 'Failed to get stories' });
  }
});

// Upload photo story
app.post('/api/stories', authenticateToken, async (req, res) => {
  const { title, description, image_url, destination_id } = req.body;
  const userId = req.user.id;
  
  try {
    const result = await pool.query(
      'INSERT INTO travel_stories (user_id, title, description, image_url, destination_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, description, image_url, destination_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Story upload error:', err);
    res.status(500).json({ error: 'Failed to upload story' });
  }
});

// ========================
// TRAVEL BUDDY MATCHING
// ========================

// Find travel buddies
app.get('/api/travel-buddies', authenticateToken, async (req, res) => {
  const { interests, location } = req.query;
  const userId = req.user.id;
  
  try {
    let query = `
      SELECT u.id, u.full_name, up.bio, up.location, up.interests, up.profile_image_url
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id != $1 AND up.privacy_settings->>'profile_public' = 'true'
    `;
    const params = [userId];
    
    if (interests) {
      query += ' AND up.interests && $2';
      params.push(interests.split(','));
    }
    
    query += ' ORDER BY RANDOM() LIMIT 20';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Travel buddies error:', err);
    res.status(500).json({ error: 'Failed to find travel buddies' });
  }
});

// Send buddy request
app.post('/api/buddy-request', authenticateToken, async (req, res) => {
  const { buddy_id, message } = req.body;
  const userId = req.user.id;
  
  try {
    await pool.query(
      'INSERT INTO buddy_requests (requester_id, buddy_id, message) VALUES ($1, $2, $3)',
      [userId, buddy_id, message]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Buddy request error:', err);
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// ========================
// BOOKING SYSTEM
// ========================

// Get tour guides
app.get('/api/tour-guides', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tour_guides 
      WHERE verified = true 
      ORDER BY rating DESC, name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Tour guides error:', err);
    res.status(500).json({ error: 'Failed to get tour guides' });
  }
});

// Book tour guide
app.post('/api/bookings/guide', authenticateToken, async (req, res) => {
  const { guide_id, date, duration, message } = req.body;
  const userId = req.user.id;
  
  try {
    const result = await pool.query(
      'INSERT INTO bookings (user_id, type, guide_id, booking_date, duration, message, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, 'guide', guide_id, date, duration, message, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Guide booking error:', err);
    res.status(500).json({ error: 'Failed to book guide' });
  }
});

// Book activity
app.post('/api/bookings/activity', authenticateToken, async (req, res) => {
  const { activity_name, date, participants, special_requirements } = req.body;
  const userId = req.user.id;
  
  try {
    const result = await pool.query(
      'INSERT INTO bookings (user_id, type, activity_name, booking_date, participants, special_requirements, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, 'activity', activity_name, date, participants, special_requirements, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Activity booking error:', err);
    res.status(500).json({ error: 'Failed to book activity' });
  }
});

// ========================
// CULTURAL EVENTS
// ========================

// Get cultural events
app.get('/api/cultural-events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM cultural_events 
      WHERE event_date >= CURRENT_DATE 
      ORDER BY event_date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Cultural events error:', err);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// ========================
// VR TOURS
// ========================

// Get VR tours
app.get('/api/vr-tours', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vr.*, d.name as destination_name 
      FROM vr_tours vr
      JOIN destinations d ON vr.destination_id = d.id
      ORDER BY vr.popularity DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('VR tours error:', err);
    res.status(500).json({ error: 'Failed to get VR tours' });
  }
});

// Track VR tour view
app.post('/api/vr-tours/:id/view', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    await pool.query(
      'INSERT INTO vr_tour_views (user_id, tour_id) VALUES ($1, $2)',
      [userId, id]
    );
    
    // Update popularity
    await pool.query(
      'UPDATE vr_tours SET views = views + 1 WHERE id = $1',
      [id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('VR view error:', err);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// ========================
// ROUTE OPTIMIZATION
// ========================

// Generate optimized itinerary
app.post('/api/itinerary/generate', authenticateToken, async (req, res) => {
  const { duration, budget, interests, start_location } = req.body;
  
  try {
    // Get destinations based on interests and budget
    let query = 'SELECT * FROM destinations WHERE 1=1';
    const params = [];
    
    if (interests && interests.length > 0) {
      query += ' AND category = ANY($1)';
      params.push(interests);
    }
    
    if (budget) {
      query += ` AND entry_fee_foreign <= $${params.length + 1}`;
      params.push(budget / duration * 0.3); // 30% of daily budget for entries
    }
    
    query += ' ORDER BY rating DESC, featured DESC';
    
    const destinations = await pool.query(query, params);
    
    // Simple optimization algorithm
    const itinerary = optimizeItinerary(destinations.rows, duration, budget, start_location);
    
    res.json({ itinerary, total_cost: itinerary.reduce((sum, day) => sum + day.estimated_cost, 0) });
  } catch (err) {
    console.error('Itinerary error:', err);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});

function optimizeItinerary(destinations, duration, budget, startLocation) {
  const dailyBudget = budget / duration;
  const selectedDestinations = destinations.slice(0, Math.min(duration, destinations.length));
  
  return selectedDestinations.map((dest, index) => ({
    day: index + 1,
    destination: dest.name,
    activities: getRecommendedActivities(dest.category),
    estimated_cost: Math.round(dailyBudget * (0.8 + Math.random() * 0.4)),
    travel_time: index === 0 ? 0 : Math.round(Math.random() * 4 + 1), // 1-5 hours
    accommodation: getAccommodationSuggestion(dest.province, dailyBudget * 0.4)
  }));
}

function getRecommendedActivities(category) {
  const activities = {
    'Nature': ['Hiking', 'Photography', 'Scenic viewing'],
    'Wildlife': ['Game drive', 'Bird watching', 'Photography'],
    'Adventure': ['Extreme sports', 'Guided tours', 'Photography'],
    'Heritage': ['Cultural tours', 'Museum visits', 'Local interactions']
  };
  return activities[category] || ['Sightseeing', 'Photography', 'Exploration'];
}

function getAccommodationSuggestion(province, budget) {
  if (budget > 100) return 'Luxury lodge';
  if (budget > 50) return 'Mid-range hotel';
  return 'Budget accommodation';
}

// ========================
// SAFETY & EMERGENCY
// ========================

// Get emergency contacts
app.get('/api/emergency-contacts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM emergency_contacts ORDER BY priority ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Emergency contacts error:', err);
    res.status(500).json({ error: 'Failed to get emergency contacts' });
  }
});

// Get medical facilities
app.get('/api/medical-facilities', async (req, res) => {
  const { province, city } = req.query;
  
  try {
    let query = 'SELECT * FROM medical_facilities WHERE 1=1';
    const params = [];
    
    if (province) {
      query += ' AND province = $1';
      params.push(province);
    }
    
    if (city) {
      query += ` AND city = $${params.length + 1}`;
      params.push(city);
    }
    
    query += ' ORDER BY type, name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Medical facilities error:', err);
    res.status(500).json({ error: 'Failed to get medical facilities' });
  }
});

// Get safety alerts
app.get('/api/safety-alerts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM safety_alerts 
      WHERE active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY severity DESC, created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Safety alerts error:', err);
    res.status(500).json({ error: 'Failed to get safety alerts' });
  }
});

// ========================
// OFFLINE SYNC
// ========================

// Sync offline data
app.post('/api/sync/offline', authenticateToken, async (req, res) => {
  const { reports, photos, bookings } = req.body;
  const userId = req.user.id;
  
  try {
    const results = { reports: [], photos: [], bookings: [] };
    
    // Sync offline reports
    if (reports && reports.length > 0) {
      for (const report of reports) {
        const result = await pool.query(
          'INSERT INTO civic_reports (user_id, type, title, description, latitude, longitude, offline_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [userId, report.type, report.title, report.description, report.latitude, report.longitude, report.offline_id]
        );
        results.reports.push({ offline_id: report.offline_id, server_id: result.rows[0].id });
      }
    }
    
    // Sync offline photos
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        const result = await pool.query(
          'INSERT INTO travel_stories (user_id, title, description, image_url, offline_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [userId, photo.title, photo.description, photo.image_url, photo.offline_id]
        );
        results.photos.push({ offline_id: photo.offline_id, server_id: result.rows[0].id });
      }
    }
    
    res.json({ success: true, synced: results });
  } catch (err) {
    console.error('Offline sync error:', err);
    res.status(500).json({ error: 'Failed to sync offline data' });
  }
});

// Get offline data package
app.get('/api/offline-package', authenticateToken, async (req, res) => {
  try {
    const destinations = await pool.query('SELECT * FROM destinations ORDER BY featured DESC, rating DESC LIMIT 20');
    const emergencyContacts = await pool.query('SELECT * FROM emergency_contacts');
    const medicalFacilities = await pool.query('SELECT * FROM medical_facilities LIMIT 50');
    
    res.json({
      destinations: destinations.rows,
      emergency_contacts: emergencyContacts.rows,
      medical_facilities: medicalFacilities.rows,
      last_updated: new Date().toISOString()
    });
  } catch (err) {
    console.error('Offline package error:', err);
    res.status(500).json({ error: 'Failed to get offline package' });
  }
});