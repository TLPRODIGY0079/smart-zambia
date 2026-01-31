// server.js
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'smart-zambia-secret-2026';

// Middleware
app.use(cors());
app.use(express.json());

// ========================
// AUTH ROUTES
// ========================

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
      [email, hash, fullName]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ========================
// DESTINATION ROUTES
// ========================

// GET all destinations (with full-text search + filters)
app.get('/api/destinations', async (req, res) => {
  try {
    const { province, category, featured, q } = req.query;
    let query = 'SELECT * FROM destinations WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Full-text search
    if (q) {
      query += ` AND search_vector @@ plainto_tsquery('english', $${paramIndex})`;
      params.push(q.trim());
      paramIndex++;
    }

    // Province filter
    if (province && province !== 'All') {
      query += ` AND province ILIKE $${paramIndex}`;
      params.push(`%${province}%`);
      paramIndex++;
    }

    // Category filter
    if (category && category !== 'All') {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Featured filter
    if (featured !== undefined) {
      query += ` AND featured = $${paramIndex}`;
      params.push(featured === 'true');
      paramIndex++;
    }

    query += ' ORDER BY featured DESC, rating DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Destinations fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// GET single destination
app.get('/api/destinations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return res.status(400).json({ error: 'Invalid destination ID' });
    }

    const result = await pool.query('SELECT * FROM destinations WHERE id = $1', [numId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Single destination error:', err);
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
});

// ========================
// ADMIN ROUTES
// ========================

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// POST new destination (admin only)
app.post('/api/admin/destinations', authenticateToken, async (req, res) => {
  const { name, province, category, rating, description, image_url, entry_fee_foreign, entry_fee_local, featured, lat, lng, secrets } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO destinations (name, province, category, rating, description, image_url, entry_fee_foreign, entry_fee_local, featured, lat, lng, secrets)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [name, province, category, rating, description, image_url, entry_fee_foreign, entry_fee_local, featured || false, lat, lng, JSON.stringify(secrets || [])]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create destination error:', err);
    res.status(500).json({ error: 'Failed to create destination' });
  }
});

// ========================
// CIVIC ROUTES
// ========================

// Submit civic report with photo upload and geolocation
app.post('/api/civic/report', authenticateToken, async (req, res) => {
  const { type, title, description, latitude, longitude, address, imageUrls, weatherData } = req.body;
  const userId = req.user.id;
  
  if (!type || !title || !latitude || !longitude) {
    return res.status(400).json({ error: 'Type, title, and location are required' });
  }

  try {
    // Tourism-focused report types with higher rewards
    const rewards = {
      flooded_area: { xp: 40, cash: 5 },
      blocked_trail: { xp: 35, cash: 4 },
      unsafe_viewpoint: { xp: 45, cash: 6 },
      damaged_facilities: { xp: 30, cash: 3 },
      wildlife_concern: { xp: 50, cash: 7 },
      tourist_safety: { xp: 55, cash: 8 },
      // Original types
      pothole: { xp: 25, cash: 2 },
      flooding: { xp: 50, cash: 5 },
      streetlight: { xp: 30, cash: 3 },
      waste: { xp: 20, cash: 2 },
      transport: { xp: 40, cash: 4 }
    };
    
    const reward = rewards[type] || { xp: 25, cash: 2 };
    
    // Insert report with enhanced data
    const reportResult = await pool.query(
      `INSERT INTO civic_reports (user_id, type, title, description, latitude, longitude, address, image_urls, weather_data, xp_awarded, cash_awarded)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [userId, type, title, description, latitude, longitude, address, imageUrls || [], weatherData || {}, reward.xp, reward.cash]
    );
    
    // Update user XP and cash
    await pool.query(
      'UPDATE users SET civic_xp = civic_xp + $1, cash_earned = cash_earned + $2 WHERE id = $3',
      [reward.xp, reward.cash, userId]
    );
    
    // Create social post
    await pool.query(
      `INSERT INTO social_posts (user_id, type, content, civic_report_id, image_urls) 
       VALUES ($1, 'civic_report', $2, $3, $4)`,
      [userId, `Reported: ${title}`, reportResult.rows[0].id, imageUrls || []]
    );
    
    // Create notification for nearby users (simplified)
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data) 
       SELECT id, 'new_report', 'New Report in Your Area', $1, $2 
       FROM users WHERE id != $3 LIMIT 10`,
      [`${title} reported near you`, JSON.stringify({reportId: reportResult.rows[0].id}), userId]
    );
    
    // Check for level up
    const userResult = await pool.query('SELECT civic_xp, civic_level FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    const newLevel = Math.floor(user.civic_xp / 100) + 1;
    
    if (newLevel > user.civic_level) {
      await pool.query('UPDATE users SET civic_level = $1 WHERE id = $2', [newLevel, userId]);
    }
    
    res.status(201).json({
      report: reportResult.rows[0],
      reward,
      levelUp: newLevel > user.civic_level
    });
  } catch (err) {
    console.error('Civic report error:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Vote on civic report
app.post('/api/civic/vote/:reportId', authenticateToken, async (req, res) => {
  const { reportId } = req.params;
  const { voteType } = req.body; // 'upvote' or 'downvote'
  const userId = req.user.id;
  
  try {
    // Check if user already voted
    const existingVote = await pool.query(
      'SELECT id FROM report_votes WHERE user_id = $1 AND report_id = $2',
      [userId, reportId]
    );
    
    if (existingVote.rows.length > 0) {
      return res.status(400).json({ error: 'Already voted on this report' });
    }
    
    // Insert vote
    await pool.query(
      'INSERT INTO report_votes (user_id, report_id, vote_type) VALUES ($1, $2, $3)',
      [userId, reportId, voteType]
    );
    
    // Update report vote count
    const voteChange = voteType === 'upvote' ? 1 : -1;
    await pool.query(
      'UPDATE civic_reports SET votes = votes + $1 WHERE id = $2',
      [voteChange, reportId]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// Get weather for destination
app.get('/api/destinations/:id/weather', async (req, res) => {
  const { id } = req.params;
  
  try {
    const destination = await pool.query('SELECT lat, lng, name FROM destinations WHERE id = $1', [id]);
    if (destination.rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    const dest = destination.rows[0];
    
    // Mock weather data (in production, use OpenWeatherMap API)
    const weatherData = {
      temperature: Math.round(20 + Math.random() * 15),
      condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 15),
      icon: '☀️',
      forecast: [
        { day: 'Today', high: 28, low: 18, condition: 'Sunny' },
        { day: 'Tomorrow', high: 26, low: 16, condition: 'Cloudy' },
        { day: 'Day 3', high: 24, low: 14, condition: 'Light Rain' }
      ]
    };
    
    res.json(weatherData);
  } catch (err) {
    console.error('Weather error:', err);
    res.status(500).json({ error: 'Failed to get weather' });
  }
});

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Get social feed
app.get('/api/social/feed', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sp.*, u.full_name, up.profile_image_url,
             d.name as destination_name, cr.title as report_title
      FROM social_posts sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN destinations d ON sp.destination_id = d.id
      LEFT JOIN civic_reports cr ON sp.civic_report_id = cr.id
      ORDER BY sp.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

// Get tourism services
app.get('/api/tourism/services', async (req, res) => {
  const { type, destinationId } = req.query;
  
  try {
    let query = 'SELECT * FROM tourism_services WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    if (destinationId) {
      query += ` AND destination_id = $${paramIndex}`;
      params.push(destinationId);
      paramIndex++;
    }
    
    query += ' ORDER BY rating DESC, name ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Services error:', err);
    res.status(500).json({ error: 'Failed to get services' });
  }
});

// Get merchants for voucher redemption
app.get('/api/merchants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM merchants ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Merchants error:', err);
    res.status(500).json({ error: 'Failed to get merchants' });
  }
});

// Redeem points for voucher
app.post('/api/vouchers/redeem', authenticateToken, async (req, res) => {
  const { merchantId, pointsToRedeem } = req.body;
  const userId = req.user.id;
  
  try {
    // Check user points (using civic_xp as points)
    const userResult = await pool.query('SELECT civic_xp FROM users WHERE id = $1', [userId]);
    const userPoints = userResult.rows[0].civic_xp;
    
    // Get merchant info
    const merchantResult = await pool.query('SELECT * FROM merchants WHERE id = $1', [merchantId]);
    const merchant = merchantResult.rows[0];
    
    if (pointsToRedeem < merchant.min_points_required) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    if (userPoints < pointsToRedeem) {
      return res.status(400).json({ error: 'Not enough points' });
    }
    
    // Calculate discount
    const discountAmount = (pointsToRedeem / 100) * merchant.discount_rate;
    const voucherCode = 'SZ' + Date.now().toString().slice(-8);
    
    // Create voucher
    await pool.query(
      `INSERT INTO vouchers (user_id, merchant_id, code, discount_amount, points_used, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, merchantId, voucherCode, discountAmount, pointsToRedeem, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)] // 30 days
    );
    
    // Deduct points
    await pool.query(
      'UPDATE users SET civic_xp = civic_xp - $1 WHERE id = $2',
      [pointsToRedeem, userId]
    );
    
    res.json({ 
      success: true, 
      voucherCode, 
      discountAmount,
      merchant: merchant.name
    });
  } catch (err) {
    console.error('Voucher error:', err);
    res.status(500).json({ error: 'Failed to redeem voucher' });
  }
});

// Get user profile with civic stats
app.get('/api/civic/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, email, full_name, civic_xp, civic_level, cash_earned FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const reportsResult = await pool.query(
      'SELECT COUNT(*) as total_reports, type FROM civic_reports WHERE user_id = $1 GROUP BY type',
      [req.user.id]
    );
    
    res.json({
      user: userResult.rows[0],
      reportStats: reportsResult.rows
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Award achievement
app.post('/api/civic/achievement', authenticateToken, async (req, res) => {
  const { achievementId, achievementName, xpAwarded, cashAwarded } = req.body;
  const userId = req.user.id;
  
  try {
    // Check if already earned
    const existing = await pool.query(
      'SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_id = $2',
      [userId, achievementId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Achievement already earned' });
    }
    
    // Insert achievement
    await pool.query(
      'INSERT INTO user_achievements (user_id, achievement_id, achievement_name, xp_awarded, cash_awarded) VALUES ($1, $2, $3, $4, $5)',
      [userId, achievementId, achievementName, xpAwarded || 0, cashAwarded || 0]
    );
    
    // Update user stats
    if (xpAwarded || cashAwarded) {
      await pool.query(
        'UPDATE users SET civic_xp = civic_xp + $1, cash_earned = cash_earned + $2 WHERE id = $3',
        [xpAwarded || 0, cashAwarded || 0, userId]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Achievement error:', err);
    res.status(500).json({ error: 'Failed to award achievement' });
  }
});

// ========================
// ADMIN CIVIC ROUTES
// ========================

// Get all civic reports (admin)
app.get('/api/admin/civic-reports', authenticateToken, async (req, res) => {
  try {
    const { status, type, limit = 50 } = req.query;
    let query = `
      SELECT cr.*, u.full_name, u.email 
      FROM civic_reports cr 
      JOIN users u ON cr.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      query += ` AND cr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (type) {
      query += ` AND cr.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    query += ` ORDER BY cr.created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Admin reports error:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Update report status (admin)
app.put('/api/admin/civic-reports/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, priority } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE civic_reports SET status = $1, priority = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, priority, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update report error:', err);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Get civic analytics (admin)
app.get('/api/admin/civic-analytics', authenticateToken, async (req, res) => {
  try {
    const totalReports = await pool.query('SELECT COUNT(*) as count FROM civic_reports');
    const reportsByType = await pool.query('SELECT type, COUNT(*) as count FROM civic_reports GROUP BY type');
    const reportsByStatus = await pool.query('SELECT status, COUNT(*) as count FROM civic_reports GROUP BY status');
    const topReporters = await pool.query(`
      SELECT u.full_name, u.email, COUNT(cr.id) as report_count, u.civic_xp, u.cash_earned
      FROM users u 
      LEFT JOIN civic_reports cr ON u.id = cr.user_id 
      GROUP BY u.id, u.full_name, u.email, u.civic_xp, u.cash_earned
      ORDER BY report_count DESC 
      LIMIT 10
    `);
    
    res.json({
      totalReports: totalReports.rows[0].count,
      reportsByType: reportsByType.rows,
      reportsByStatus: reportsByStatus.rows,
      topReporters: topReporters.rows
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ========================
// START SERVER
// ========================

app.listen(PORT, () => {
  console.log(`✅ Smart Zambia API running on http://localhost:${PORT}`);
  console.log(`🔐 JWT Secret: ${JWT_SECRET.substring(0, 8)}... (for dev only)`);
});