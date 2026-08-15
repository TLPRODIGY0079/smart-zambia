// Additional Supabase Services
// This file contains services for bookings, reviews, check-ins, achievements, etc.

import { supabase } from './client.js';

// ============================================
// BOOKINGS SERVICE
// ============================================
export const bookingsService = {
  /**
   * Get user's bookings
   * @param {string} userId - User UUID
   */
  async getUserBookings(userId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        destinations (name, province, image_urls),
        tour_guide_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get bookings for tour guide
   * @param {string} tourGuideId - Tour guide UUID
   */
  async getTourGuideBookings(tourGuideId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        destinations (name, province, image_urls),
        user_id
      `)
      .eq('tour_guide_id', tourGuideId)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Create booking
   * @param {object} bookingData - Booking data
   */
  async createBooking(bookingData) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update booking
   * @param {string} bookingId - Booking UUID
   * @param {object} updates - Booking updates
   */
  async updateBooking(bookingId, updates) {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Cancel booking
   * @param {string} bookingId - Booking UUID
   * @param {string} reason - Cancellation reason
   */
  async cancelBooking(bookingId, reason) {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================
// REVIEWS SERVICE
// ============================================
export const reviewsService = {
  /**
   * Get reviews for destination
   * @param {string} destinationId - Destination UUID
   */
  async getDestinationReviews(destinationId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('destination_id', destinationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get user's reviews
   * @param {string} userId - User UUID
   */
  async getUserReviews(userId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        destinations (name, image_urls)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Create review
   * @param {object} reviewData - Review data
   */
  async createReview(reviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update review
   * @param {string} reviewId - Review UUID
   * @param {object} updates - Review updates
   */
  async updateReview(reviewId, updates) {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete review (admin only)
   * @param {string} reviewId - Review UUID
   */
  async deleteReview(reviewId) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  /**
   * Mark review as helpful
   * @param {string} reviewId - Review UUID
   */
  async markHelpful(reviewId) {
    const { data, error } = await supabase.rpc('increment_helpful_count', {
      review_id: reviewId
    });

    if (error) throw error;
    return data;
  }
};

// ============================================
// CHECK-INS SERVICE
// ============================================
export const checkInsService = {
  /**
   * Get user's check-ins
   * @param {string} userId - User UUID
   */
  async getUserCheckIns(userId) {
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        *,
        destinations (name, province, image_urls)
      `)
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Create check-in
   * @param {object} checkInData - Check-in data
   */
  async createCheckIn(checkInData) {
    const { data, error } = await supabase
      .from('check_ins')
      .insert(checkInData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Calculate user's check-in streak
   * @param {string} userId - User UUID
   */
  async getCheckInStreak(userId) {
    const { data, error } = await supabase
      .from('check_ins')
      .select('checked_in_at')
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    // Calculate consecutive days
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const checkIn of data) {
      const checkInDate = new Date(checkIn.checked_in_at);
      checkInDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate - checkInDate) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
        currentDate = new Date(checkInDate);
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  }
};

// ============================================
// ACHIEVEMENTS SERVICE
// ============================================
export const achievementsService = {
  /**
   * Get all achievements
   */
  async getAllAchievements() {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('xp_reward', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get user's unlocked achievements
   * @param {string} userId - User UUID
   */
  async getUserAchievements(userId) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        unlocked_at,
        achievements (*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Unlock achievement for user
   * @param {string} userId - User UUID
   * @param {string} achievementCode - Achievement code
   */
  async unlockAchievement(userId, achievementCode) {
    // First get achievement ID
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .select('id')
      .eq('code', achievementCode)
      .single();

    if (achievementError) throw achievementError;

    // Check if already unlocked
    const { data: existing, error: checkError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievement.id)
      .single();

    if (existing) return existing; // Already unlocked

    // Unlock achievement
    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievement.id
      })
      .select(`
        unlocked_at,
        achievements (*)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================
// TRIP PLANS SERVICE
// ============================================
export const tripPlansService = {
  /**
   * Get user's trip plans
   * @param {string} userId - User UUID
   */
  async getUserTripPlans(userId) {
    const { data, error } = await supabase
      .from('trip_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get public trip plans
   */
  async getPublicTripPlans() {
    const { data, error } = await supabase
      .from('trip_plans')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get trip plan by share token
   * @param {string} shareToken - Share token
   */
  async getTripPlanByToken(shareToken) {
    const { data, error } = await supabase
      .from('trip_plans')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('share_token', shareToken)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create trip plan
   * @param {object} tripPlanData - Trip plan data
   */
  async createTripPlan(tripPlanData) {
    const shareToken = tripPlanData.is_public ? 
      crypto.randomUUID().replace(/-/g, '').substring(0, 12) : null;

    const { data, error } = await supabase
      .from('trip_plans')
      .insert({
        ...tripPlanData,
        share_token: shareToken
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update trip plan
   * @param {string} tripPlanId - Trip plan UUID
   * @param {object} updates - Trip plan updates
   */
  async updateTripPlan(tripPlanId, updates) {
    const { data, error } = await supabase
      .from('trip_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', tripPlanId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete trip plan
   * @param {string} tripPlanId - Trip plan UUID
   */
  async deleteTripPlan(tripPlanId) {
    const { error } = await supabase
      .from('trip_plans')
      .delete()
      .eq('id', tripPlanId);

    if (error) throw error;
  }
};

// ============================================
// FAVORITES SERVICE
// ============================================
export const favoritesService = {
  /**
   * Get user's favorites
   * @param {string} userId - User UUID
   */
  async getUserFavorites(userId) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        collection_name,
        destinations (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Add destination to favorites
   * @param {string} userId - User UUID
   * @param {string} destinationId - Destination UUID
   * @param {string} collectionName - Collection name
   */
  async addFavorite(userId, destinationId, collectionName = 'Default') {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        destination_id: destinationId,
        collection_name: collectionName
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove destination from favorites
   * @param {string} userId - User UUID
   * @param {string} destinationId - Destination UUID
   * @param {string} collectionName - Collection name
   */
  async removeFavorite(userId, destinationId, collectionName = 'Default') {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('destination_id', destinationId)
      .eq('collection_name', collectionName);

    if (error) throw error;
  },

  /**
   * Get user's favorite collections
   * @param {string} userId - User UUID
   */
  async getUserCollections(userId) {
    const { data, error } = await supabase
      .from('favorites')
      .select('collection_name')
      .eq('user_id', userId);

    if (error) throw error;

    const collections = [...new Set(data.map(f => f.collection_name))];
    return collections;
  }
};

// ============================================
// SEARCH HISTORY SERVICE
// ============================================
export const searchHistoryService = {
  /**
   * Get user's search history
   * @param {string} userId - User UUID
   */
  async getUserSearchHistory(userId) {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  },

  /**
   * Add search to history
   * @param {string} userId - User UUID
   * @param {string} query - Search query
   */
  async addSearch(userId, query) {
    const { data, error } = await supabase
      .from('search_history')
      .insert({
        user_id: userId,
        query
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Clear user's search history
   * @param {string} userId - User UUID
   */
  async clearSearchHistory(userId) {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Get popular searches (aggregated from all users)
   */
  async getPopularSearches() {
    const { data, error } = await supabase
      .from('search_history')
      .select('query')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Aggregate and count
    const counts = {};
    data.forEach(item => {
      counts[item.query] = (counts[item.query] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));
  }
};

// ============================================
// NOTIFICATIONS SERVICE
// ============================================
export const notificationsService = {
  /**
   * Get user's notifications
   * @param {string} unreadOnly - Get only unread notifications
   */
  async getUserNotifications(userId, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get unread notification count
   * @param {string} userId - User UUID
   */
  async getUnreadCount(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return data;
  },

  /**
   * Create notification
   * @param {object} notificationData - Notification data
   */
  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification UUID
   */
  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Mark all notifications as read
   * @param {string} userId - User UUID
   */
  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  /**
   * Delete notification
   * @param {string} notificationId - Notification UUID
   */
  async deleteNotification(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Subscribe to real-time notifications
   * @param {string} userId - User UUID
   * @param {function} callback - Callback function
   */
  subscribeToNotifications(userId, callback) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => callback(payload.new)
      )
      .subscribe();
  }
};

// ============================================
// CHAT MESSAGES SERVICE
// ============================================
export const chatService = {
  /**
   * Get chat messages for booking
   * @param {string} bookingId - Booking UUID
   */
  async getChatMessages(bookingId) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey (username, avatar_url),
        receiver:profiles!chat_messages_receiver_id_fkey (username, avatar_url)
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Send chat message
   * @param {object} messageData - Message data
   */
  async sendMessage(messageData) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark message as read
   * @param {string} messageId - Message UUID
   */
  async markAsRead(messageId) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
  },

  /**
   * Subscribe to real-time chat messages
   * @param {string} bookingId - Booking UUID
   * @param {function} callback - Callback function
   */
  subscribeToChat(bookingId, callback) {
    return supabase
      .channel(`chat:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => callback(payload.new)
      )
      .subscribe();
  }
};

// ============================================
// TOUR GUIDE APPLICATIONS SERVICE
// ============================================
export const tourGuideService = {
  /**
   * Submit tour guide application
   * @param {object} applicationData - Application data
   */
  async submitApplication(applicationData) {
    const { data, error } = await supabase
      .from('tour_guide_applications')
      .insert(applicationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user's application
   * @param {string} userId - User UUID
   */
  async getUserApplication(userId) {
    const { data, error } = await supabase
      .from('tour_guide_applications')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  /**
   * Get all pending applications (admin)
   */
  async getPendingApplications() {
    const { data, error } = await supabase
      .from('tour_guide_applications')
      .select(`
        *,
        profiles (username, full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Approve application (admin)
   * @param {string} applicationId - Application UUID
   * @param {string} adminId - Admin UUID
   */
  async approveApplication(applicationId, adminId) {
    const { data, error } = await supabase
      .from('tour_guide_applications')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;

    // Assign tour guide role
    await supabase
      .from('user_roles')
      .insert({
        user_id: data.user_id,
        role: 'tour_guide',
        granted_by: adminId,
        verified: true
      });

    return data;
  },

  /**
   * Reject application (admin)
   * @param {string} applicationId - Application UUID
   * @param {string} adminId - Admin UUID
   * @param {string} reason - Rejection reason
   */
  async rejectApplication(applicationId, adminId, reason) {
    const { data, error } = await supabase
      .from('tour_guide_applications')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================
// COMMISSIONS SERVICE
// ============================================
export const commissionsService = {
  /**
   * Get tour guide's commissions
   * @param {string} tourGuideId - Tour guide UUID
   */
  async getTourGuideCommissions(tourGuideId) {
    const { data, error } = await supabase
      .from('commissions')
      .select(`
        *,
        bookings (id, booking_date, total_price)
      `)
      .eq('tour_guide_id', tourGuideId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get total earnings for tour guide
   * @param {string} tourGuideId - Tour guide UUID
   */
  async getTotalEarnings(tourGuideId) {
    const { data, error } = await supabase
      .from('commissions')
      .select('commission_amount')
      .eq('tour_guide_id', tourGuideId);

    if (error) throw error;

    const total = data.reduce((sum, c) => sum + parseFloat(c.commission_amount), 0);
    return total;
  },

  /**
   * Create commission (system only)
   * @param {object} commissionData - Commission data
   */
  async createCommission(commissionData) {
    const { data, error } = await supabase
      .from('commissions')
      .insert(commissionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================
// CIVIC REPORTS SERVICE
// ============================================
export const civicService = {
  /**
   * Get user's civic reports
   * @param {string} userId - User UUID
   */
  async getUserCivicReports(userId) {
    const { data, error } = await supabase
      .from('civic_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Create civic report
   * @param {object} reportData - Report data
   */
  async createCivicReport(reportData) {
    const { data, error } = await supabase
      .from('civic_reports')
      .insert(reportData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all civic reports (admin)
   */
  async getAllCivicReports() {
    const { data, error } = await supabase
      .from('civic_reports')
      .select(`
        *,
        profiles (username, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Update civic report status (admin)
   * @param {string} reportId - Report UUID
   * @param {string} status - New status
   */
  async updateCivicReportStatus(reportId, status) {
    const { data, error } = await supabase
      .from('civic_reports')
      .update({ status })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================
// ADMIN AUDIT LOG SERVICE
// ============================================
export const auditService = {
  /**
   * Log admin action
   * @param {object} logData - Log data
   */
  async logAction(logData) {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .insert(logData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get audit logs (admin)
   */
  async getAuditLogs(limit = 100) {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select(`
        *,
        profiles (username)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};
