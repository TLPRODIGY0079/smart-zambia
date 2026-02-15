// =============================================
// REVIEWS & RATINGS API ROUTES
// =============================================

const express = require('express');
const router = express.Router();

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// =============================================
// GET REVIEWS
// =============================================

// Get all reviews for a destination
router.get('/destinations/:destinationId/reviews', async (req, res) => {
  const { destinationId } = req.params;
  const { page = 1, limit = 10, sort = 'recent' } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    let orderBy = 'dr.created_at DESC';
    if (sort === 'helpful') orderBy = 'dr.helpful_count DESC, dr.created_at DESC';
    if (sort === 'rating_high') orderBy = 'dr.rating DESC, dr.created_at DESC';
    if (sort === 'rating_low') orderBy = 'dr.rating ASC, dr.created_at DESC';
    
    const result = await pool.query(`
      SELECT 
        dr.*,
        u.full_name as user_name,
        u.email as user_email,
        (SELECT COUNT(*) FROM review_photos WHERE review_id = dr.id) as photo_count,
        (SELECT COUNT(*) FROM review_responses WHERE review_id = dr.id) as response_count
      FROM destination_reviews dr
      JOIN users u ON dr.user_id = u.id
      WHERE dr.destination_id = $1 AND dr.status = 'active'
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
    `, [destinationId, limit, offset]);
    
    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM destination_reviews WHERE destination_id = $1 AND status = $2',
      [destinationId, 'active']
    );
    
    // Get rating summary
    const summaryResult = await pool.query(`
      SELECT 
        AVG(rating)::NUMERIC(3,2) as average_rating,
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM destination_reviews
      WHERE destination_id = $1 AND status = 'active'
    `, [destinationId]);
    
    res.json({
      reviews: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      },
      summary: summaryResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get single review with details
router.get('/reviews/:reviewId', async (req, res) => {
  const { reviewId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        dr.*,
        u.full_name as user_name,
        u.email as user_email
      FROM destination_reviews dr
      JOIN users u ON dr.user_id = u.id
      WHERE dr.id = $1 AND dr.status = 'active'
    `, [reviewId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Get photos
    const photosResult = await pool.query(
      'SELECT * FROM review_photos WHERE review_id = $1 ORDER BY display_order',
      [reviewId]
    );
    
    // Get responses
    const responsesResult = await pool.query(`
      SELECT rr.*, u.full_name as responder_name
      FROM review_responses rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.review_id = $1
      ORDER BY rr.created_at ASC
    `, [reviewId]);
    
    const review = result.rows[0];
    review.photos = photosResult.rows;
    review.responses = responsesResult.rows;
    
    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Get user's reviews
router.get('/users/:userId/reviews', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  // Verify user can only see their own reviews unless admin
  if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  try {
    const result = await pool.query(`
      SELECT dr.*, 
        (SELECT COUNT(*) FROM review_photos WHERE review_id = dr.id) as photo_count
      FROM destination_reviews dr
      WHERE dr.user_id = $1
      ORDER BY dr.created_at DESC
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// =============================================
// CREATE REVIEW
// =============================================

router.post('/destinations/:destinationId/reviews', authenticateToken, async (req, res) => {
  const { destinationId } = req.params;
  const { rating, title, review_text, visit_date, photos } = req.body;
  const userId = req.user.id;
  
  // Validation
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  if (!title || title.trim().length < 5) {
    return res.status(400).json({ error: 'Title must be at least 5 characters' });
  }
  if (!review_text || review_text.trim().length < 20) {
    return res.status(400).json({ error: 'Review must be at least 20 characters' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if user already reviewed this destination
    const existingReview = await client.query(
      'SELECT id FROM destination_reviews WHERE user_id = $1 AND destination_id = $2',
      [userId, destinationId]
    );
    
    if (existingReview.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You have already reviewed this destination' });
    }
    
    // Insert review
    const reviewResult = await client.query(`
      INSERT INTO destination_reviews 
        (user_id, destination_id, rating, title, review_text, visit_date, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [userId, destinationId, rating, title.trim(), review_text.trim(), visit_date || null, false]);
    
    const review = reviewResult.rows[0];
    
    // Insert photos if provided
    if (photos && Array.isArray(photos) && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        await client.query(`
          INSERT INTO review_photos (review_id, photo_url, caption, display_order)
          VALUES ($1, $2, $3, $4)
        `, [review.id, photos[i].url, photos[i].caption || null, i]);
      }
    }
    
    // Award XP for review
    await client.query(
      'UPDATE users SET xp = xp + $1 WHERE id = $2',
      [50, userId]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({
      review,
      reward: { xp: 50, message: 'Thanks for your review!' }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  } finally {
    client.release();
  }
});

// =============================================
// UPDATE REVIEW
// =============================================

router.put('/reviews/:reviewId', authenticateToken, async (req, res) => {
  const { reviewId } = req.params;
  const { rating, title, review_text, visit_date } = req.body;
  const userId = req.user.id;
  
  try {
    // Check ownership
    const checkResult = await pool.query(
      'SELECT user_id FROM destination_reviews WHERE id = $1',
      [reviewId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update review
    const result = await pool.query(`
      UPDATE destination_reviews
      SET rating = $1, title = $2, review_text = $3, visit_date = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [rating, title.trim(), review_text.trim(), visit_date || null, reviewId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// =============================================
// DELETE REVIEW
// =============================================

router.delete('/reviews/:reviewId', authenticateToken, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  
  try {
    // Check ownership
    const checkResult = await pool.query(
      'SELECT user_id FROM destination_reviews WHERE id = $1',
      [reviewId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (checkResult.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Soft delete
    await pool.query(
      'UPDATE destination_reviews SET status = $1 WHERE id = $2',
      ['deleted', reviewId]
    );
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// =============================================
// MARK REVIEW AS HELPFUL
// =============================================

router.post('/reviews/:reviewId/helpful', authenticateToken, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  
  try {
    // Check if already marked helpful
    const existing = await pool.query(
      'SELECT id FROM review_helpful WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );
    
    if (existing.rows.length > 0) {
      // Remove helpful mark
      await pool.query(
        'DELETE FROM review_helpful WHERE review_id = $1 AND user_id = $2',
        [reviewId, userId]
      );
      await pool.query(
        'UPDATE destination_reviews SET helpful_count = helpful_count - 1 WHERE id = $1',
        [reviewId]
      );
      return res.json({ helpful: false, message: 'Removed helpful mark' });
    }
    
    // Add helpful mark
    await pool.query(
      'INSERT INTO review_helpful (review_id, user_id) VALUES ($1, $2)',
      [reviewId, userId]
    );
    await pool.query(
      'UPDATE destination_reviews SET helpful_count = helpful_count + 1 WHERE id = $1',
      [reviewId]
    );
    
    res.json({ helpful: true, message: 'Marked as helpful' });
  } catch (error) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({ error: 'Failed to mark review' });
  }
});

// =============================================
// ADD RESPONSE TO REVIEW
// =============================================

router.post('/reviews/:reviewId/responses', authenticateToken, async (req, res) => {
  const { reviewId } = req.params;
  const { response_text } = req.body;
  const userId = req.user.id;
  
  if (!response_text || response_text.trim().length < 10) {
    return res.status(400).json({ error: 'Response must be at least 10 characters' });
  }
  
  try {
    const result = await pool.query(`
      INSERT INTO review_responses (review_id, user_id, response_text, is_official)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [reviewId, userId, response_text.trim(), req.user.role === 'admin']);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

module.exports = router;
