/**
 * Daily Challenges System
 * 
 * Provides users with engaging, time-limited tasks that encourage platform exploration.
 * Features: 5 categories, 4 difficulty levels, progress tracking, streak bonuses, bonus challenges
 * 
 * @module DailyChallenges
 */

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

/**
 * Challenge categories with styling and metadata
 */
const CHALLENGE_CATEGORIES = {
  exploration: {
    name: 'Exploration',
    icon: 'fa-map-marked-alt',
    color: '#10B981',
    gradient: 'from-green-500 to-emerald-600',
    description: 'Discover new destinations and hidden gems'
  },
  social: {
    name: 'Social',
    icon: 'fa-users',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Connect with other travelers and share experiences'
  },
  learning: {
    name: 'Learning',
    icon: 'fa-graduation-cap',
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-violet-600',
    description: 'Learn about Zambian culture, history, and traditions'
  },
  civic: {
    name: 'Civic',
    icon: 'fa-hands-helping',
    color: '#F59E0B',
    gradient: 'from-orange-500 to-amber-600',
    description: 'Contribute to your community and help improve the platform'
  },
  creative: {
    name: 'Creative',
    icon: 'fa-palette',
    color: '#EC4899',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Express yourself through photos, stories, and itineraries'
  }
};

/**
 * Challenge difficulty levels with XP ranges
 */
const DIFFICULTY_LEVELS = {
  easy: {
    name: 'Easy',
    minXP: 50,
    maxXP: 100,
    minLevel: 1,
    color: '#10B981'
  },
  medium: {
    name: 'Medium',
    minXP: 100,
    maxXP: 200,
    minLevel: 3,
    color: '#3B82F6'
  },
  hard: {
    name: 'Hard',
    minXP: 200,
    maxXP: 400,
    minLevel: 5,
    color: '#F59E0B'
  },
  expert: {
    name: 'Expert',
    minXP: 400,
    maxXP: 800,
    minLevel: 10,
    color: '#EF4444'
  }
};

/**
 * Streak bonus multipliers
 */
const STREAK_BONUSES = {
  3: 0.10,   // 10% bonus at 3 days
  7: 0.25,   // 25% bonus at 7 days
  30: 0.50   // 50% bonus at 30 days
};

/**
 * Challenge pool - All available challenges
 */
const CHALLENGE_POOL = [
  // EXPLORATION CHALLENGES
  {
    id: 'explore_3_destinations',
    category: 'exploration',
    difficulty: 'easy',
    title: 'Explore 3 New Destinations',
    description: 'Visit and view details of 3 destinations you haven\'t seen before',
    icon: 'fa-map-marked-alt',
    type: 'counter',
    target: 3,
    trackingKey: 'destinations_viewed',
    xpReward: 75,
    minLevel: 1
  },
  {
    id: 'visit_waterfall',
    category: 'exploration',
    difficulty: 'medium',
    title: 'Visit a Waterfall',
    description: 'Explore any waterfall destination in Zambia',
    icon: 'fa-water',
    type: 'boolean',
    trackingKey: 'waterfall_visited',
    xpReward: 150,
    minLevel: 3
  },
  {
    id: 'explore_5_destinations',
    category: 'exploration',
    difficulty: 'medium',
    title: 'Destination Explorer',
    description: 'Visit and view details of 5 different destinations',
    icon: 'fa-compass',
    type: 'counter',
    target: 5,
    trackingKey: 'destinations_viewed',
    xpReward: 175,
    minLevel: 3
  },
  {
    id: 'explore_all_regions',
    category: 'exploration',
    difficulty: 'hard',
    title: 'Regional Explorer',
    description: 'Visit at least one destination in 5 different regions',
    icon: 'fa-globe-africa',
    type: 'collection',
    target: 5,
    trackingKey: 'regions_explored',
    xpReward: 300,
    minLevel: 5
  },
  {
    id: 'discover_hidden_gem',
    category: 'exploration',
    difficulty: 'hard',
    title: 'Hidden Gem Hunter',
    description: 'Find and visit a hidden gem destination',
    icon: 'fa-gem',
    type: 'boolean',
    trackingKey: 'hidden_gem_found',
    xpReward: 250,
    minLevel: 5
  },
  
  // SOCIAL CHALLENGES
  {
    id: 'write_2_reviews',
    category: 'social',
    difficulty: 'easy',
    title: 'Share Your Thoughts',
    description: 'Write reviews for 2 destinations',
    icon: 'fa-star',
    type: 'counter',
    target: 2,
    trackingKey: 'reviews_written',
    xpReward: 100,
    minLevel: 1
  },
  {
    id: 'write_detailed_review',
    category: 'social',
    difficulty: 'medium',
    title: 'Detailed Reviewer',
    description: 'Write a review with at least 100 words',
    icon: 'fa-pen-fancy',
    type: 'boolean',
    trackingKey: 'detailed_review_written',
    xpReward: 150,
    minLevel: 2
  },
  {
    id: 'add_3_friends',
    category: 'social',
    difficulty: 'medium',
    title: 'Make New Friends',
    description: 'Add 3 new friends to your network',
    icon: 'fa-user-plus',
    type: 'counter',
    target: 3,
    trackingKey: 'friends_added',
    xpReward: 150,
    minLevel: 2
  },
  {
    id: 'share_5_destinations',
    category: 'social',
    difficulty: 'medium',
    title: 'Spread the Word',
    description: 'Share 5 destinations on social media',
    icon: 'fa-share-alt',
    type: 'counter',
    target: 5,
    trackingKey: 'destinations_shared',
    xpReward: 175,
    minLevel: 3
  },
  {
    id: 'help_5_users',
    category: 'social',
    difficulty: 'hard',
    title: 'Community Helper',
    description: 'Help 5 users by answering questions or providing recommendations',
    icon: 'fa-hands-helping',
    type: 'counter',
    target: 5,
    trackingKey: 'users_helped',
    xpReward: 300,
    minLevel: 5
  },
  
  // LEARNING CHALLENGES
  {
    id: 'complete_trivia',
    category: 'learning',
    difficulty: 'easy',
    title: 'Trivia Master',
    description: 'Complete a Zambia trivia quiz with 80% or higher',
    icon: 'fa-question-circle',
    type: 'boolean',
    trackingKey: 'trivia_completed',
    xpReward: 100,
    minLevel: 1
  },
  {
    id: 'read_3_guides',
    category: 'learning',
    difficulty: 'easy',
    title: 'Knowledge Seeker',
    description: 'Read destination guides for 3 different places',
    icon: 'fa-book-open',
    type: 'counter',
    target: 3,
    trackingKey: 'guides_read',
    xpReward: 75,
    minLevel: 1
  },
  {
    id: 'read_5_guides',
    category: 'learning',
    difficulty: 'medium',
    title: 'Avid Reader',
    description: 'Read destination guides for 5 different places',
    icon: 'fa-book-reader',
    type: 'counter',
    target: 5,
    trackingKey: 'guides_read',
    xpReward: 150,
    minLevel: 2
  },
  {
    id: 'learn_culture',
    category: 'learning',
    difficulty: 'hard',
    title: 'Cultural Expert',
    description: 'Complete all cultural learning modules',
    icon: 'fa-university',
    type: 'boolean',
    trackingKey: 'culture_modules_completed',
    xpReward: 350,
    minLevel: 5
  },
  {
    id: 'history_buff',
    category: 'learning',
    difficulty: 'hard',
    title: 'History Buff',
    description: 'Learn about 10 historical sites in Zambia',
    icon: 'fa-landmark',
    type: 'counter',
    target: 10,
    trackingKey: 'historical_sites_learned',
    xpReward: 300,
    minLevel: 5
  },
  
  // CIVIC CHALLENGES
  {
    id: 'submit_2_reports',
    category: 'civic',
    difficulty: 'easy',
    title: 'Community Helper',
    description: 'Submit 2 civic duty reports',
    icon: 'fa-clipboard-check',
    type: 'counter',
    target: 2,
    trackingKey: 'civic_reports_submitted',
    xpReward: 125,
    minLevel: 1
  },
  {
    id: 'help_improve',
    category: 'civic',
    difficulty: 'medium',
    title: 'Platform Improver',
    description: 'Submit feedback or report a bug',
    icon: 'fa-bug',
    type: 'boolean',
    trackingKey: 'feedback_submitted',
    xpReward: 150,
    minLevel: 2
  },
  {
    id: 'submit_5_reports',
    category: 'civic',
    difficulty: 'medium',
    title: 'Active Citizen',
    description: 'Submit 5 civic duty reports',
    icon: 'fa-flag',
    type: 'counter',
    target: 5,
    trackingKey: 'civic_reports_submitted',
    xpReward: 200,
    minLevel: 3
  },
  {
    id: 'community_leader',
    category: 'civic',
    difficulty: 'hard',
    title: 'Community Leader',
    description: 'Participate in a community event and submit 3 reports',
    icon: 'fa-users-cog',
    type: 'counter',
    target: 3,
    trackingKey: 'event_reports_submitted',
    xpReward: 350,
    minLevel: 5
  },
  
  // CREATIVE CHALLENGES
  {
    id: 'upload_3_photos',
    category: 'creative',
    difficulty: 'easy',
    title: 'Photographer',
    description: 'Upload 3 photos to destination galleries',
    icon: 'fa-camera',
    type: 'counter',
    target: 3,
    trackingKey: 'photos_uploaded',
    xpReward: 100,
    minLevel: 1
  },
  {
    id: 'upload_5_photos',
    category: 'creative',
    difficulty: 'medium',
    title: 'Photo Enthusiast',
    description: 'Upload 5 photos to destination galleries',
    icon: 'fa-camera-retro',
    type: 'counter',
    target: 5,
    trackingKey: 'photos_uploaded',
    xpReward: 175,
    minLevel: 2
  },
  {
    id: 'create_itinerary',
    category: 'creative',
    difficulty: 'medium',
    title: 'Trip Planner',
    description: 'Create a complete trip itinerary with at least 5 destinations',
    icon: 'fa-route',
    type: 'boolean',
    trackingKey: 'itinerary_created',
    xpReward: 200,
    minLevel: 3
  },
  {
    id: 'write_travel_story',
    category: 'creative',
    difficulty: 'hard',
    title: 'Storyteller',
    description: 'Write a travel story of at least 500 words',
    icon: 'fa-feather-alt',
    type: 'boolean',
    trackingKey: 'story_written',
    xpReward: 300,
    minLevel: 5
  },
  {
    id: 'create_photo_album',
    category: 'creative',
    difficulty: 'hard',
    title: 'Album Creator',
    description: 'Create a photo album with at least 10 photos and descriptions',
    icon: 'fa-images',
    type: 'boolean',
    trackingKey: 'album_created',
    xpReward: 350,
    minLevel: 5
  }
];

// ============================================================================
// DATA MODELS
// ============================================================================

/**
 * Get default challenge state
 * @returns {Object} Default challenge state
 */
function getDefaultChallengeState() {
  return {
    activeChallenge: null,
    bonusChallenge: null,
    challengeStreak: 0,
    longestStreak: 0,
    lastCompletionDate: null,
    completedChallenges: [],
    totalCompleted: 0,
    totalXPEarned: 0,
    completionByCategory: {
      exploration: 0,
      social: 0,
      learning: 0,
      civic: 0,
      creative: 0
    },
    recentChallenges: [],
    lastAssignedDate: null
  };
}

/**
 * Create a challenge instance from pool challenge
 * @param {Object} poolChallenge - Challenge from pool
 * @returns {Object} Challenge instance
 */
function createChallengeInstance(poolChallenge) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return {
    id: poolChallenge.id,
    category: poolChallenge.category,
    difficulty: poolChallenge.difficulty,
    title: poolChallenge.title,
    description: poolChallenge.description,
    icon: poolChallenge.icon,
    type: poolChallenge.type,
    target: poolChallenge.target || 1,
    current: 0,
    progress: 0,
    trackingKey: poolChallenge.trackingKey,
    xpReward: poolChallenge.xpReward,
    assignedDate: today,
    expiresAt: tomorrow.toISOString()
  };
}

// ============================================================================
// EXPOSE TO WINDOW
// ============================================================================

// Expose constants and functions to window object for cross-module access
window.CHALLENGE_CATEGORIES = CHALLENGE_CATEGORIES;
window.DIFFICULTY_LEVELS = DIFFICULTY_LEVELS;
window.STREAK_BONUSES = STREAK_BONUSES;
window.CHALLENGE_POOL = CHALLENGE_POOL;
window.getDefaultChallengeState = getDefaultChallengeState;
window.createChallengeInstance = createChallengeInstance;

console.log('✅ Daily Challenges module structure initialized');
console.log(`📊 Challenge pool loaded: ${CHALLENGE_POOL.length} challenges`);
console.log(`📁 Categories: ${Object.keys(CHALLENGE_CATEGORIES).length}`);
console.log(`⚡ Difficulty levels: ${Object.keys(DIFFICULTY_LEVELS).length}`);


// ============================================================================
// DATA PERSISTENCE LAYER
// ============================================================================

/**
 * Save challenge state to localStorage
 * @param {Object} state - Challenge state to save
 * @returns {boolean} Success status
 */
function saveChallengeState(state) {
  try {
    const userId = window.state?.user?.id || 'guest';
    const key = `challengeState_${userId}`;
    localStorage.setItem(key, JSON.stringify(state));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('❌ localStorage quota exceeded for challenges');
      // Attempt cleanup - remove old completed challenges
      try {
        const cleanedState = {
          ...state,
          completedChallenges: state.completedChallenges.slice(-50) // Keep last 50
        };
        const userId = window.state?.user?.id || 'guest';
        const key = `challengeState_${userId}`;
        localStorage.setItem(key, JSON.stringify(cleanedState));
        console.log('✅ Cleaned up old challenge data and saved');
        return true;
      } catch (cleanupError) {
        console.error('❌ Failed to save even after cleanup:', cleanupError);
        return false;
      }
    } else {
      console.error('❌ Failed to save challenge state:', error);
      return false;
    }
  }
}

/**
 * Load challenge state from localStorage
 * @returns {Object} Challenge state
 */
function loadChallengeState() {
  try {
    const userId = window.state?.user?.id || 'guest';
    const key = `challengeState_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      console.log('📝 No existing challenge state, using defaults');
      return getDefaultChallengeState();
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate and merge with defaults to handle missing fields
    const defaultState = getDefaultChallengeState();
    const validatedState = {
      activeChallenge: parsed.activeChallenge || defaultState.activeChallenge,
      bonusChallenge: parsed.bonusChallenge || defaultState.bonusChallenge,
      challengeStreak: typeof parsed.challengeStreak === 'number' ? parsed.challengeStreak : defaultState.challengeStreak,
      longestStreak: typeof parsed.longestStreak === 'number' ? parsed.longestStreak : defaultState.longestStreak,
      lastCompletionDate: parsed.lastCompletionDate || defaultState.lastCompletionDate,
      completedChallenges: Array.isArray(parsed.completedChallenges) ? parsed.completedChallenges : defaultState.completedChallenges,
      totalCompleted: typeof parsed.totalCompleted === 'number' ? parsed.totalCompleted : defaultState.totalCompleted,
      totalXPEarned: typeof parsed.totalXPEarned === 'number' ? parsed.totalXPEarned : defaultState.totalXPEarned,
      completionByCategory: parsed.completionByCategory || defaultState.completionByCategory,
      recentChallenges: Array.isArray(parsed.recentChallenges) ? parsed.recentChallenges : defaultState.recentChallenges,
      lastAssignedDate: parsed.lastAssignedDate || defaultState.lastAssignedDate
    };
    
    console.log('✅ Challenge state loaded from localStorage');
    return validatedState;
    
  } catch (error) {
    console.error('❌ Failed to load challenge state:', error);
    console.log('📝 Using default challenge state');
    return getDefaultChallengeState();
  }
}

/**
 * Clear challenge state (for testing or reset)
 * @returns {boolean} Success status
 */
function clearChallengeState() {
  try {
    const userId = window.state?.user?.id || 'guest';
    const key = `challengeState_${userId}`;
    localStorage.removeItem(key);
    console.log('🗑️ Challenge state cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear challenge state:', error);
    return false;
  }
}

// ============================================================================
// BACKEND API INTEGRATION (Placeholder for future implementation)
// ============================================================================

/**
 * Sync challenge data to backend
 * @param {Object} challengeData - Challenge data to sync
 * @returns {Promise<boolean>} Success status
 */
async function syncChallengeToBackend(challengeData) {
  // TODO: Implement backend sync when API is ready
  // For now, just log and return success
  console.log('📡 Backend sync (placeholder):', challengeData);
  return Promise.resolve(true);
}

/**
 * Fetch challenge data from backend
 * @returns {Promise<Object|null>} Challenge data or null
 */
async function fetchChallengeFromBackend() {
  // TODO: Implement backend fetch when API is ready
  // For now, return null to use localStorage
  console.log('📡 Backend fetch (placeholder)');
  return Promise.resolve(null);
}

// ============================================================================
// EXPOSE PERSISTENCE FUNCTIONS
// ============================================================================

window.saveChallengeState = saveChallengeState;
window.loadChallengeState = loadChallengeState;
window.clearChallengeState = clearChallengeState;
window.syncChallengeToBackend = syncChallengeToBackend;
window.fetchChallengeFromBackend = fetchChallengeFromBackend;

console.log('✅ Challenge persistence layer initialized');


// ============================================================================
// CHALLENGE POOL MANAGEMENT
// ============================================================================

/**
 * Challenge Pool Manager
 * Manages the collection of available challenges
 */
const ChallengePool = {
  /**
   * Get all challenges from the pool
   * @returns {Array} All challenges
   */
  getAllChallenges: function() {
    return [...CHALLENGE_POOL];
  },
  
  /**
   * Get challenges by category
   * @param {string} category - Category name
   * @returns {Array} Filtered challenges
   */
  getChallengesByCategory: function(category) {
    return CHALLENGE_POOL.filter(c => c.category === category);
  },
  
  /**
   * Get challenges by difficulty
   * @param {string} difficulty - Difficulty level
   * @returns {Array} Filtered challenges
   */
  getChallengesByDifficulty: function(difficulty) {
    return CHALLENGE_POOL.filter(c => c.difficulty === difficulty);
  },
  
  /**
   * Get challenge by ID
   * @param {string} challengeId - Challenge ID
   * @returns {Object|null} Challenge or null
   */
  getChallengeById: function(challengeId) {
    return CHALLENGE_POOL.find(c => c.id === challengeId) || null;
  },
  
  /**
   * Select appropriate challenge for user
   * @param {number} userLevel - User's current level
   * @param {Array} recentChallenges - Recently assigned challenge IDs
   * @param {Object} completionByCategory - Completion counts by category
   * @returns {Object|null} Selected challenge or null
   */
  selectChallenge: function(userLevel, recentChallenges = [], completionByCategory = {}) {
    // Step 1: Filter by level appropriateness
    let eligibleChallenges = CHALLENGE_POOL.filter(challenge => {
      if (challenge.minLevel > userLevel) return false;
      if (challenge.maxLevel && challenge.maxLevel < userLevel) return false;
      return true;
    });
    
    if (eligibleChallenges.length === 0) {
      console.warn('⚠️ No eligible challenges for user level:', userLevel);
      // Fallback: Allow any challenge
      eligibleChallenges = [...CHALLENGE_POOL];
    }
    
    // Step 2: Exclude recent challenges (last 14 days)
    const recentSet = new Set(recentChallenges.slice(-14));
    eligibleChallenges = eligibleChallenges.filter(challenge => {
      return !recentSet.has(challenge.id);
    });
    
    if (eligibleChallenges.length === 0) {
      console.warn('⚠️ All challenges recently used, resetting rotation');
      // Reset: Allow any level-appropriate challenge
      eligibleChallenges = CHALLENGE_POOL.filter(challenge => {
        if (challenge.minLevel > userLevel) return false;
        if (challenge.maxLevel && challenge.maxLevel < userLevel) return false;
        return true;
      });
    }
    
    // Step 3: Determine target category (rotate through categories)
    const categories = Object.keys(CHALLENGE_CATEGORIES);
    const leastCompletedCategory = categories.reduce((min, cat) => {
      const minCount = completionByCategory[min] || 0;
      const catCount = completionByCategory[cat] || 0;
      return catCount < minCount ? cat : min;
    }, categories[0]);
    
    // Step 4: Prefer challenges from least completed category
    let categoryChallenge = eligibleChallenges.filter(c => c.category === leastCompletedCategory);
    if (categoryChallenge.length === 0) {
      categoryChallenge = eligibleChallenges;
    }
    
    // Step 5: Select random challenge from filtered list
    if (categoryChallenge.length === 0) {
      console.error('❌ No challenges available');
      return null;
    }
    
    const selectedChallenge = categoryChallenge[Math.floor(Math.random() * categoryChallenge.length)];
    
    console.log(`✅ Selected challenge: ${selectedChallenge.title} (${selectedChallenge.category}, ${selectedChallenge.difficulty})`);
    return selectedChallenge;
  },
  
  /**
   * Add new challenge to pool (admin function)
   * @param {Object} challengeData - Challenge data
   * @returns {boolean} Success status
   */
  addChallenge: function(challengeData) {
    // Validate required fields
    const required = ['id', 'category', 'difficulty', 'title', 'description', 'type', 'trackingKey', 'xpReward'];
    for (const field of required) {
      if (!challengeData[field]) {
        console.error(`❌ Missing required field: ${field}`);
        return false;
      }
    }
    
    // Check for duplicate ID
    if (CHALLENGE_POOL.find(c => c.id === challengeData.id)) {
      console.error(`❌ Challenge with ID ${challengeData.id} already exists`);
      return false;
    }
    
    // Add to pool
    CHALLENGE_POOL.push(challengeData);
    console.log(`✅ Added challenge: ${challengeData.title}`);
    
    // TODO: Sync to backend
    syncChallengeToBackend({ action: 'add', challenge: challengeData });
    
    return true;
  },
  
  /**
   * Remove challenge from pool (admin function)
   * @param {string} challengeId - Challenge ID
   * @returns {boolean} Success status
   */
  removeChallenge: function(challengeId) {
    const index = CHALLENGE_POOL.findIndex(c => c.id === challengeId);
    if (index === -1) {
      console.error(`❌ Challenge not found: ${challengeId}`);
      return false;
    }
    
    CHALLENGE_POOL.splice(index, 1);
    console.log(`✅ Removed challenge: ${challengeId}`);
    
    // TODO: Sync to backend
    syncChallengeToBackend({ action: 'remove', challengeId });
    
    return true;
  },
  
  /**
   * Get challenge statistics
   * @returns {Object} Statistics
   */
  getStatistics: function() {
    const stats = {
      total: CHALLENGE_POOL.length,
      byCategory: {},
      byDifficulty: {}
    };
    
    // Count by category
    for (const category of Object.keys(CHALLENGE_CATEGORIES)) {
      stats.byCategory[category] = CHALLENGE_POOL.filter(c => c.category === category).length;
    }
    
    // Count by difficulty
    for (const difficulty of Object.keys(DIFFICULTY_LEVELS)) {
      stats.byDifficulty[difficulty] = CHALLENGE_POOL.filter(c => c.difficulty === difficulty).length;
    }
    
    return stats;
  }
};

// ============================================================================
// EXPOSE CHALLENGE POOL
// ============================================================================

window.ChallengePool = ChallengePool;

console.log('✅ Challenge Pool module initialized');
console.log('📊 Pool statistics:', ChallengePool.getStatistics());


// ============================================================================
// PROGRESS TRACKER
// ============================================================================

/**
 * Progress Tracker
 * Tracks user progress on active challenges
 */
const ProgressTracker = {
  /**
   * Update progress for a challenge
   * @param {string} challengeId - Challenge ID
   * @param {number} progress - Progress value (0-100)
   * @returns {boolean} Success status
   */
  updateProgress: function(challengeId, progress) {
    const state = window.state?.challenges;
    if (!state) return false;
    
    const challenge = state.activeChallenge?.id === challengeId ? state.activeChallenge : 
                     state.bonusChallenge?.id === challengeId ? state.bonusChallenge : null;
    
    if (!challenge) {
      console.warn('⚠️ Challenge not found:', challengeId);
      return false;
    }
    
    // Validate progress
    progress = Math.max(0, Math.min(100, progress));
    challenge.progress = progress;
    
    // Save state
    saveChallengeState(state);
    
    // Update UI if available
    if (typeof window.UIController?.updateProgressBar === 'function') {
      window.UIController.updateProgressBar(progress);
    }
    
    return true;
  },
  
  /**
   * Get current progress for a challenge
   * @param {string} challengeId - Challenge ID
   * @returns {number} Progress percentage
   */
  getProgress: function(challengeId) {
    const state = window.state?.challenges;
    if (!state) return 0;
    
    const challenge = state.activeChallenge?.id === challengeId ? state.activeChallenge : 
                     state.bonusChallenge?.id === challengeId ? state.bonusChallenge : null;
    
    return challenge ? challenge.progress : 0;
  },
  
  /**
   * Check if challenge is completed
   * @param {string} challengeId - Challenge ID
   * @returns {boolean} Completion status
   */
  isCompleted: function(challengeId) {
    return this.getProgress(challengeId) >= 100;
  },
  
  /**
   * Reset progress for a challenge
   * @param {string} challengeId - Challenge ID
   * @returns {boolean} Success status
   */
  resetProgress: function(challengeId) {
    return this.updateProgress(challengeId, 0);
  },
  
  /**
   * Track action and update progress
   * @param {string} actionType - Action type (tracking key)
   * @param {*} actionData - Action data
   * @returns {boolean} Success status
   */
  trackAction: function(actionType, actionData) {
    const state = window.state?.challenges;
    if (!state || !state.activeChallenge) return false;
    
    const challenge = state.activeChallenge;
    
    // Check if action matches challenge tracking key
    if (actionType !== challenge.trackingKey) {
      // Also check bonus challenge
      if (state.bonusChallenge && actionType === state.bonusChallenge.trackingKey) {
        return this._updateChallengeProgress(state.bonusChallenge, actionData);
      }
      return false;
    }
    
    return this._updateChallengeProgress(challenge, actionData);
  },
  
  /**
   * Internal: Update challenge progress based on type
   * @private
   */
  _updateChallengeProgress: function(challenge, actionData) {
    switch (challenge.type) {
      case 'counter':
        challenge.current = Math.min(challenge.current + 1, challenge.target);
        challenge.progress = (challenge.current / challenge.target) * 100;
        break;
        
      case 'boolean':
        challenge.current = 1;
        challenge.progress = 100;
        break;
        
      case 'collection':
        // actionData should be an array of unique items
        if (Array.isArray(actionData)) {
          challenge.current = actionData.length;
          challenge.progress = (challenge.current / challenge.target) * 100;
        }
        break;
        
      default:
        console.warn('⚠️ Unknown challenge type:', challenge.type);
        return false;
    }
    
    // Save state
    const state = window.state.challenges;
    saveChallengeState(state);
    
    // Update UI
    if (typeof window.UIController?.updateProgressBar === 'function') {
      window.UIController.updateProgressBar(challenge.progress);
    }
    
    // Check if completed
    if (challenge.progress >= 100) {
      console.log('🎉 Challenge completed!');
      // Trigger completion handler
      if (typeof window.ChallengeManager?.completeChallenge === 'function') {
        setTimeout(() => window.ChallengeManager.completeChallenge(challenge.id), 100);
      }
    }
    
    return true;
  }
};

// ============================================================================
// STREAK MANAGER
// ============================================================================

/**
 * Streak Manager
 * Manages challenge completion streaks
 */
const StreakManager = {
  /**
   * Get current streak
   * @returns {number} Current streak count
   */
  getCurrentStreak: function() {
    return window.state?.challenges?.challengeStreak || 0;
  },
  
  /**
   * Update streak on challenge completion
   * @returns {number} New streak value
   */
  updateStreak: function() {
    const state = window.state?.challenges;
    if (!state) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const lastCompletion = state.lastCompletionDate;
    
    if (!lastCompletion) {
      // First completion
      state.challengeStreak = 1;
      state.lastCompletionDate = today;
    } else {
      const lastDate = new Date(lastCompletion);
      const currentDate = new Date(today);
      const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        state.challengeStreak += 1;
        state.lastCompletionDate = today;
      } else if (daysDiff === 0) {
        // Same day (bonus challenge)
        // Don't increment streak
      } else {
        // Streak broken
        state.challengeStreak = 1;
        state.lastCompletionDate = today;
      }
    }
    
    // Update longest streak
    if (state.challengeStreak > state.longestStreak) {
      state.longestStreak = state.challengeStreak;
    }
    
    saveChallengeState(state);
    console.log(`🔥 Challenge streak: ${state.challengeStreak} days`);
    
    return state.challengeStreak;
  },
  
  /**
   * Calculate streak bonus XP
   * @param {number} baseXP - Base XP amount
   * @returns {number} Bonus XP amount
   */
  getStreakBonus: function(baseXP) {
    const streak = this.getCurrentStreak();
    let multiplier = 0;
    
    // Determine multiplier based on streak
    if (streak >= 30) {
      multiplier = STREAK_BONUSES[30];
    } else if (streak >= 7) {
      multiplier = STREAK_BONUSES[7];
    } else if (streak >= 3) {
      multiplier = STREAK_BONUSES[3];
    }
    
    return Math.floor(baseXP * multiplier);
  },
  
  /**
   * Check and update streak status
   * @returns {boolean} Streak is active
   */
  checkStreak: function() {
    const state = window.state?.challenges;
    if (!state || !state.lastCompletionDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const lastDate = new Date(state.lastCompletionDate);
    const currentDate = new Date(today);
    const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      // Streak broken
      state.challengeStreak = 0;
      saveChallengeState(state);
      console.log('💔 Challenge streak broken');
      return false;
    }
    
    return true;
  }
};

// ============================================================================
// REWARD CALCULATOR
// ============================================================================

/**
 * Reward Calculator
 * Calculates XP rewards for challenges
 */
const RewardCalculator = {
  /**
   * Calculate base reward by difficulty
   * @param {string} difficulty - Difficulty level
   * @returns {number} Base XP amount
   */
  calculateBaseReward: function(difficulty) {
    const level = DIFFICULTY_LEVELS[difficulty];
    if (!level) return 50;
    
    // Return average of min and max
    return Math.floor((level.minXP + level.maxXP) / 2);
  },
  
  /**
   * Calculate total reward with bonuses
   * @param {number} baseXP - Base XP amount
   * @param {number} streak - Current streak
   * @param {number} bonusMultiplier - Additional multiplier
   * @returns {Object} Reward breakdown
   */
  calculateTotalReward: function(baseXP, streak = 0, bonusMultiplier = 1) {
    const streakBonus = StreakManager.getStreakBonus(baseXP);
    const totalXP = Math.floor((baseXP + streakBonus) * bonusMultiplier);
    
    return {
      baseXP: baseXP,
      streakBonus: streakBonus,
      bonusMultiplier: bonusMultiplier,
      totalXP: totalXP
    };
  },
  
  /**
   * Get bonus challenge reward (50% of daily)
   * @param {number} dailyReward - Daily challenge XP
   * @returns {number} Bonus challenge XP
   */
  getBonusChallengeReward: function(dailyReward) {
    return Math.floor(dailyReward * 0.5);
  }
};

// ============================================================================
// CHALLENGE TIMER
// ============================================================================

/**
 * Challenge Timer
 * Manages challenge expiration timing
 */
const ChallengeTimer = {
  /**
   * Get time remaining until midnight
   * @returns {Object} Time components
   */
  getTimeRemaining: function() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    
    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, total: diff };
  },
  
  /**
   * Format time for display
   * @param {number} hours - Hours
   * @param {number} minutes - Minutes
   * @param {number} seconds - Seconds
   * @returns {string} Formatted time
   */
  formatTime: function(hours, minutes, seconds) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  },
  
  /**
   * Check if challenge expired
   * @param {string} assignedDate - Date challenge was assigned (YYYY-MM-DD)
   * @returns {boolean} Is expired
   */
  isExpired: function(assignedDate) {
    if (!assignedDate) return true;
    
    const today = new Date().toISOString().split('T')[0];
    return assignedDate < today;
  },
  
  /**
   * Start timer updates
   * @param {Function} callback - Callback function
   * @returns {number} Interval ID
   */
  startTimer: function(callback) {
    // Update every minute
    return setInterval(() => {
      const time = this.getTimeRemaining();
      callback(time);
    }, 60000); // 60 seconds
  },
  
  /**
   * Check if time is urgent (< 2 hours)
   * @returns {boolean} Is urgent
   */
  isUrgent: function() {
    const time = this.getTimeRemaining();
    return time.hours < 2;
  }
};

// ============================================================================
// CHALLENGE MANAGER
// ============================================================================

/**
 * Challenge Manager
 * Main controller for challenge operations
 */
const ChallengeManager = {
  timerInterval: null,
  
  /**
   * Initialize the challenge system
   */
  init: function() {
    console.log('🚀 Initializing Challenge Manager...');
    
    // Initialize state if needed
    if (!window.state) {
      window.state = {};
    }
    
    // Load challenge state
    const savedState = loadChallengeState();
    window.state.challenges = savedState;
    
    // Check if new challenge needed
    if (this.needsNewChallenge()) {
      console.log('📋 Assigning new daily challenge...');
      this.assignDailyChallenge();
    } else {
      console.log('✅ Active challenge loaded');
    }
    
    // Start timer
    this.startTimerUpdates();
    
    console.log('✅ Challenge Manager initialized');
  },
  
  /**
   * Check if new challenge is needed
   * @returns {boolean} Needs new challenge
   */
  needsNewChallenge: function() {
    const state = window.state?.challenges;
    if (!state) return true;
    
    // No active challenge
    if (!state.activeChallenge) return true;
    
    // Challenge expired
    const today = new Date().toISOString().split('T')[0];
    if (state.lastAssignedDate !== today) return true;
    
    return false;
  },
  
  /**
   * Assign a new daily challenge
   * @returns {Object|null} Assigned challenge
   */
  assignDailyChallenge: function() {
    const state = window.state?.challenges;
    if (!state) {
      console.error('❌ Challenge state not initialized');
      return null;
    }
    
    // Get user level
    const userLevel = window.state?.user?.level || 1;
    
    // Select challenge
    const poolChallenge = ChallengePool.selectChallenge(
      userLevel,
      state.recentChallenges,
      state.completionByCategory
    );
    
    if (!poolChallenge) {
      console.error('❌ Failed to select challenge');
      return null;
    }
    
    // Create challenge instance
    const challenge = createChallengeInstance(poolChallenge);
    
    // Assign to state
    state.activeChallenge = challenge;
    state.lastAssignedDate = new Date().toISOString().split('T')[0];
    
    // Add to recent challenges
    state.recentChallenges.push(challenge.id);
    if (state.recentChallenges.length > 14) {
      state.recentChallenges.shift();
    }
    
    // Clear bonus challenge
    state.bonusChallenge = null;
    
    // Save state
    saveChallengeState(state);
    
    // Show notification
    if (typeof window.showAchievementToast === 'function') {
      window.showAchievementToast(
        `New Challenge: ${challenge.title}`,
        `Complete for ${challenge.xpReward} XP!`,
        'info'
      );
    }
    
    console.log(`✅ Assigned challenge: ${challenge.title}`);
    return challenge;
  },
  
  /**
   * Get current challenge status
   * @returns {Object} Challenge status
   */
  getChallengeStatus: function() {
    const state = window.state?.challenges;
    if (!state) return null;
    
    return {
      activeChallenge: state.activeChallenge,
      bonusChallenge: state.bonusChallenge,
      streak: state.challengeStreak,
      timeRemaining: ChallengeTimer.getTimeRemaining()
    };
  },
  
  /**
   * Complete a challenge
   * @param {string} challengeId - Challenge ID
   * @returns {boolean} Success status
   */
  completeChallenge: function(challengeId) {
    const state = window.state?.challenges;
    if (!state) return false;
    
    const isActive = state.activeChallenge?.id === challengeId;
    const isBonus = state.bonusChallenge?.id === challengeId;
    
    if (!isActive && !isBonus) {
      console.warn('⚠️ Challenge not found:', challengeId);
      return false;
    }
    
    const challenge = isActive ? state.activeChallenge : state.bonusChallenge;
    
    // Calculate rewards
    const streak = isActive ? StreakManager.updateStreak() : state.challengeStreak;
    const rewards = RewardCalculator.calculateTotalReward(
      challenge.xpReward,
      streak,
      isBonus ? 0.5 : 1
    );
    
    // Award XP
    if (typeof window.addScore === 'function') {
      window.addScore(rewards.totalXP);
    }
    
    // Update statistics
    state.totalCompleted += 1;
    state.totalXPEarned += rewards.totalXP;
    state.completionByCategory[challenge.category] += 1;
    
    // Add to history
    state.completedChallenges.push({
      id: challenge.id,
      category: challenge.category,
      completedDate: new Date().toISOString().split('T')[0],
      xpEarned: rewards.totalXP,
      streakBonus: rewards.streakBonus
    });
    
    // Unlock bonus challenge if daily completed
    if (isActive && !state.bonusChallenge) {
      this.unlockBonusChallenge();
    }
    
    // Clear completed challenge
    if (isActive) {
      state.activeChallenge = null;
    } else {
      state.bonusChallenge = null;
    }
    
    // Save state
    saveChallengeState(state);
    
    // Show celebration
    if (typeof window.showAchievementToast === 'function') {
      window.showAchievementToast(
        `Challenge Complete! 🎉`,
        `+${rewards.totalXP} XP (${rewards.streakBonus} streak bonus)`,
        'success'
      );
    }
    
    // Trigger confetti
    if (typeof window.triggerConfetti === 'function') {
      window.triggerConfetti();
    }
    
    console.log(`🎉 Challenge completed: ${challenge.title} (+${rewards.totalXP} XP)`);
    return true;
  },
  
  /**
   * Unlock bonus challenge
   * @returns {Object|null} Bonus challenge
   */
  unlockBonusChallenge: function() {
    const state = window.state?.challenges;
    if (!state) return null;
    
    const userLevel = window.state?.user?.level || 1;
    
    // Select a different challenge
    const poolChallenge = ChallengePool.selectChallenge(
      userLevel,
      state.recentChallenges,
      state.completionByCategory
    );
    
    if (!poolChallenge) return null;
    
    const bonusChallenge = createChallengeInstance(poolChallenge);
    bonusChallenge.xpReward = RewardCalculator.getBonusChallengeReward(bonusChallenge.xpReward);
    
    state.bonusChallenge = bonusChallenge;
    saveChallengeState(state);
    
    // Show notification
    if (typeof window.showAchievementToast === 'function') {
      window.showAchievementToast(
        `Bonus Challenge Unlocked! 🌟`,
        `${bonusChallenge.title} (+${bonusChallenge.xpReward} XP)`,
        'info'
      );
    }
    
    console.log(`🌟 Bonus challenge unlocked: ${bonusChallenge.title}`);
    return bonusChallenge;
  },
  
  /**
   * Start timer updates
   */
  startTimerUpdates: function() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = ChallengeTimer.startTimer((time) => {
      // Update UI if available
      if (typeof window.UIController?.updateTimerDisplay === 'function') {
        window.UIController.updateTimerDisplay(time);
      }
      
      // Check if urgent
      if (ChallengeTimer.isUrgent() && window.state?.challenges?.activeChallenge) {
        // Show urgent notification (once per session)
        if (!this.urgentNotificationShown) {
          if (typeof window.showAchievementToast === 'function') {
            window.showAchievementToast(
              'Challenge Expiring Soon! ⏰',
              'Complete your challenge before midnight!',
              'warning'
            );
          }
          this.urgentNotificationShown = true;
        }
      }
    });
  }
};

// ============================================================================
// EXPOSE MODULES
// ============================================================================

window.ProgressTracker = ProgressTracker;
window.StreakManager = StreakManager;
window.RewardCalculator = RewardCalculator;
window.ChallengeTimer = ChallengeTimer;
window.ChallengeManager = ChallengeManager;

console.log('✅ All challenge modules loaded');


// ============================================================================
// UI CONTROLLER
// ============================================================================

/**
 * UI Controller
 * Manages UI updates and animations for challenges
 */
const UIController = {
  /**
   * Display challenge card
   * @param {Object} challenge - Challenge object
   * @param {string} containerId - Container element ID
   */
  displayChallenge: function(challenge, containerId = 'challengeCard') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('⚠️ Challenge container not found:', containerId);
      return;
    }
    
    const category = CHALLENGE_CATEGORIES[challenge.category];
    const difficulty = DIFFICULTY_LEVELS[challenge.difficulty];
    
    const html = `
      <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition-all duration-300">
        <!-- Category Badge -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center">
              <i class="fas ${category.icon} text-white"></i>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-600">${category.name}</p>
              <p class="text-xs text-gray-400">${difficulty.name}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent">
              ${challenge.xpReward} XP
            </p>
          </div>
        </div>
        
        <!-- Challenge Title & Description -->
        <h3 class="text-xl font-bold text-gray-800 mb-2">${challenge.title}</h3>
        <p class="text-gray-600 mb-4">${challenge.description}</p>
        
        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>${challenge.current || 0}/${challenge.target || 1}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div class="h-full bg-gradient-to-r ${category.gradient} rounded-full transition-all duration-500"
                 style="width: ${challenge.progress || 0}%"
                 id="challengeProgressBar"></div>
          </div>
          <p class="text-xs text-gray-500 mt-1 text-right">${Math.floor(challenge.progress || 0)}% Complete</p>
        </div>
        
        <!-- Timer -->
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center space-x-2 text-gray-600">
            <i class="fas fa-clock"></i>
            <span id="challengeTimer">Loading...</span>
          </div>
          <button onclick="window.ChallengeManager.completeChallenge('${challenge.id}')" 
                  class="px-4 py-2 bg-gradient-to-r ${category.gradient} text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  ${challenge.progress >= 100 ? '' : 'disabled style="opacity: 0.5; cursor: not-allowed;"'}>
            ${challenge.progress >= 100 ? 'Claim Reward' : 'In Progress'}
          </button>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Update timer immediately
    this.updateTimerDisplay(ChallengeTimer.getTimeRemaining());
  },
  
  /**
   * Update progress bar
   * @param {number} progress - Progress percentage
   */
  updateProgressBar: function(progress) {
    const bar = document.getElementById('challengeProgressBar');
    if (bar) {
      bar.style.width = `${progress}%`;
    }
  },
  
  /**
   * Show completion celebration
   * @param {number} xpEarned - XP earned
   * @param {number} streak - Current streak
   */
  showCompletionCelebration: function(xpEarned, streak) {
    // Trigger confetti
    if (typeof window.triggerConfetti === 'function') {
      window.triggerConfetti();
    }
    
    // Show toast
    if (typeof window.showAchievementToast === 'function') {
      window.showAchievementToast(
        `Challenge Complete! 🎉`,
        `+${xpEarned} XP | ${streak} Day Streak`,
        'success'
      );
    }
  },
  
  /**
   * Update timer display
   * @param {Object} time - Time object
   */
  updateTimerDisplay: function(time) {
    const timerEl = document.getElementById('challengeTimer');
    if (!timerEl) return;
    
    const formatted = ChallengeTimer.formatTime(time.hours, time.minutes, time.seconds);
    timerEl.textContent = `${formatted} remaining`;
    
    // Add urgent styling if < 2 hours
    if (time.hours < 2) {
      timerEl.classList.add('text-red-500', 'font-bold');
    } else {
      timerEl.classList.remove('text-red-500', 'font-bold');
    }
  },
  
  /**
   * Display bonus challenge
   * @param {Object} challenge - Bonus challenge
   */
  displayBonusChallenge: function(challenge) {
    this.displayChallenge(challenge, 'bonusChallengeCard');
  },
  
  /**
   * Show challenge history
   * @param {Array} completedChallenges - Completed challenges
   */
  showHistory: function(completedChallenges) {
    const container = document.getElementById('challengeHistory');
    if (!container) return;
    
    if (completedChallenges.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">No completed challenges yet</p>';
      return;
    }
    
    const html = completedChallenges.slice(-10).reverse().map(c => {
      const category = CHALLENGE_CATEGORIES[c.category];
      return `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center">
              <i class="fas ${category.icon} text-white text-sm"></i>
            </div>
            <div>
              <p class="font-semibold text-gray-800">${c.id.replace(/_/g, ' ')}</p>
              <p class="text-xs text-gray-500">${c.completedDate}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-green-600">+${c.xpEarned} XP</p>
            ${c.streakBonus > 0 ? `<p class="text-xs text-gray-500">+${c.streakBonus} bonus</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
  },
  
  /**
   * Update challenge statistics display
   */
  updateStatistics: function() {
    const state = window.state?.challenges;
    if (!state) return;
    
    // Update total completed
    const totalEl = document.getElementById('totalChallengesCompleted');
    if (totalEl) totalEl.textContent = state.totalCompleted;
    
    // Update streak
    const streakEl = document.getElementById('challengeStreak');
    if (streakEl) streakEl.textContent = state.challengeStreak;
    
    // Update total XP
    const xpEl = document.getElementById('totalChallengeXP');
    if (xpEl) xpEl.textContent = state.totalXPEarned;
  }
};

// ============================================================================
// EXPOSE UI CONTROLLER
// ============================================================================

window.UIController = UIController;

console.log('✅ UI Controller initialized');


// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

/**
 * Auto-initialize when DOM is ready
 */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📋 Daily Challenges: DOM ready, initializing...');
      // Initialize after a short delay to ensure other systems are ready
      setTimeout(() => {
        if (typeof window.ChallengeManager !== 'undefined') {
          window.ChallengeManager.init();
        }
      }, 1000);
    });
  } else {
    // DOM already loaded
    console.log('📋 Daily Challenges: DOM already loaded, initializing...');
    setTimeout(() => {
      if (typeof window.ChallengeManager !== 'undefined') {
        window.ChallengeManager.init();
      }
    }, 1000);
  }
}

// ============================================================================
// GLOBAL HELPER FUNCTIONS
// ============================================================================

/**
 * Track a challenge action (called from other modules)
 * @param {string} actionType - Action type
 * @param {*} actionData - Action data
 */
window.trackChallengeAction = function(actionType, actionData) {
  if (typeof window.ProgressTracker !== 'undefined') {
    return window.ProgressTracker.trackAction(actionType, actionData);
  }
  return false;
};

/**
 * Get current challenge info (for display in other parts of the app)
 * @returns {Object|null} Challenge info
 */
window.getCurrentChallenge = function() {
  return window.state?.challenges?.activeChallenge || null;
};

/**
 * Get challenge statistics (for profile display)
 * @returns {Object} Statistics
 */
window.getChallengeStatistics = function() {
  const state = window.state?.challenges;
  if (!state) return null;
  
  return {
    totalCompleted: state.totalCompleted,
    currentStreak: state.challengeStreak,
    longestStreak: state.longestStreak,
    totalXPEarned: state.totalXPEarned,
    completionByCategory: state.completionByCategory
  };
};

console.log('✅ Daily Challenges System fully loaded and ready!');
console.log('📊 System Status:');
console.log(`   - Challenge Pool: ${CHALLENGE_POOL.length} challenges`);
console.log(`   - Categories: ${Object.keys(CHALLENGE_CATEGORIES).length}`);
console.log(`   - Difficulty Levels: ${Object.keys(DIFFICULTY_LEVELS).length}`);
console.log(`   - Modules: ChallengeManager, ProgressTracker, StreakManager, RewardCalculator, ChallengeTimer, UIController`);
