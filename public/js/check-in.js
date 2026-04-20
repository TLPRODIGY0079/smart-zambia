/**
 * Daily Check-In System
 * 
 * Gamification feature that encourages daily user engagement through:
 * - Streak tracking
 * - Progressive rewards
 * - Visual feedback via calendar
 * - Streak protection mechanics
 * 
 * Integrates with existing XP/level system and localStorage persistence.
 */

// ============================================================================
// DATA MODELS
// ============================================================================

/**
 * Default check-in state structure
 * Stored in window.state.checkIn and persisted to localStorage
 */
function getDefaultCheckInState() {
  return {
    // Current streak count
    currentStreak: 0,
    
    // Longest streak achieved
    longestStreak: 0,
    
    // Last check-in date (ISO 8601 string: "YYYY-MM-DD")
    lastCheckInDate: null,
    
    // Complete check-in history (array of ISO 8601 date strings)
    checkInHistory: [],
    
    // Streak freeze status
    freezeAvailable: true,
    
    // Total check-ins count
    totalCheckIns: 0,
    
    // Milestones achieved (array of integers: [7, 30, 100])
    milestonesAchieved: [],
    
    // Total XP earned from check-ins
    totalCheckInXP: 0
  };
}

/**
 * Milestone achievements configuration
 * Defines special achievements unlocked at specific streak thresholds
 */
const MILESTONE_ACHIEVEMENTS = {
  7: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Checked in for 7 consecutive days',
    icon: 'fa-fire',
    xpBonus: 50,
    streakRequired: 7
  },
  30: {
    id: 'monthly_master',
    name: 'Monthly Master',
    description: 'Checked in for 30 consecutive days',
    icon: 'fa-calendar-check',
    xpBonus: 200,
    streakRequired: 30
  },
  100: {
    id: 'century_champion',
    name: 'Century Champion',
    description: 'Checked in for 100 consecutive days',
    icon: 'fa-crown',
    xpBonus: 1000,
    streakRequired: 100
  }
};

// ============================================================================
// DATE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get today's date as YYYY-MM-DD string
 * @returns {string} ISO 8601 date string (YYYY-MM-DD)
 * Requirements: 9.4
 */
function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Parse date string to Date object with error handling
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} Date object, or current date if parsing fails
 * Requirements: 9.4
 */
function parseDate(dateString) {
  try {
    // Add time component to ensure consistent parsing across timezones
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return new Date(); // Fallback to current date
    }
    return date;
  } catch (error) {
    console.error('Date parsing error:', error);
    return new Date(); // Fallback to current date
  }
}

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day, false otherwise
 * Requirements: 9.4
 */
function isSameDay(date1, date2) {
  return date1.toISOString().split('T')[0] === 
         date2.toISOString().split('T')[0];
}

/**
 * Get days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Number of days between dates (absolute value)
 * Requirements: 9.4
 */
function getDaysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  return Math.round(Math.abs((date1 - date2) / oneDay));
}

/**
 * Check if date2 is the day after date1 (consecutive days)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if date2 is exactly one day after date1
 * Requirements: 9.4
 */
function isNextDay(date1, date2) {
  return getDaysBetween(date1, date2) === 1 && date2 > date1;
}

// ============================================================================
// DATA PERSISTENCE LAYER
// ============================================================================

/**
 * Save check-in state to localStorage with comprehensive error handling
 * Handles quota exceeded errors and storage unavailability
 * @param {object} state - Check-in state object to save
 * @returns {boolean} True if save successful, false otherwise
 * Requirements: 9.1, 9.2, 9.3, 9.5
 */
function saveCheckInState(state) {
  try {
    // Validate state structure before saving
    if (!state || typeof state !== 'object') {
      console.error('Invalid state object provided to saveCheckInState');
      return false;
    }
    
    // Serialize and save to localStorage
    const serialized = JSON.stringify(state);
    localStorage.setItem('checkInState', serialized);
    
    return true;
  } catch (error) {
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      
      // Attempt to clean up old data if possible
      try {
        // Remove non-essential data to free space
        const essentialState = {
          currentStreak: state.currentStreak,
          lastCheckInDate: state.lastCheckInDate,
          checkInHistory: state.checkInHistory.slice(-90), // Keep last 90 days
          freezeAvailable: state.freezeAvailable,
          totalCheckIns: state.totalCheckIns,
          longestStreak: state.longestStreak,
          milestonesAchieved: state.milestonesAchieved,
          totalCheckInXP: state.totalCheckInXP
        };
        localStorage.setItem('checkInState', JSON.stringify(essentialState));
        console.warn('Trimmed check-in history to free storage space');
        return true;
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError);
        // Show user notification if available
        if (typeof window.showNotification === 'function') {
          window.showNotification('Storage full. Check-in saved temporarily.', 'warning');
        }
        return false;
      }
    } else {
      console.error('Failed to save check-in state:', error);
      return false;
    }
  }
}

/**
 * Load check-in state from localStorage with validation and error handling
 * Validates data structure and handles missing or corrupted data
 * @returns {object} Valid check-in state object (defaults if corrupted)
 * Requirements: 9.1, 9.2, 9.3, 9.5
 */
function loadCheckInState() {
  try {
    const stored = localStorage.getItem('checkInState');
    
    // Return defaults if no stored data
    if (!stored) {
      return getDefaultCheckInState();
    }
    
    // Parse stored data
    const parsed = JSON.parse(stored);
    
    // Validate and sanitize each field with type checking
    const validated = {
      // Validate currentStreak: must be non-negative integer
      currentStreak: (typeof parsed.currentStreak === 'number' && 
                     parsed.currentStreak >= 0 && 
                     Number.isInteger(parsed.currentStreak)) 
                     ? parsed.currentStreak : 0,
      
      // Validate longestStreak: must be non-negative integer
      longestStreak: (typeof parsed.longestStreak === 'number' && 
                     parsed.longestStreak >= 0 && 
                     Number.isInteger(parsed.longestStreak)) 
                     ? parsed.longestStreak : 0,
      
      // Validate lastCheckInDate: must be string in YYYY-MM-DD format or null
      lastCheckInDate: validateDateString(parsed.lastCheckInDate),
      
      // Validate checkInHistory: must be array of valid date strings
      checkInHistory: validateCheckInHistory(parsed.checkInHistory),
      
      // Validate freezeAvailable: must be boolean
      freezeAvailable: typeof parsed.freezeAvailable === 'boolean' 
                      ? parsed.freezeAvailable : true,
      
      // Validate totalCheckIns: must be non-negative integer
      totalCheckIns: (typeof parsed.totalCheckIns === 'number' && 
                     parsed.totalCheckIns >= 0 && 
                     Number.isInteger(parsed.totalCheckIns)) 
                     ? parsed.totalCheckIns : 0,
      
      // Validate milestonesAchieved: must be array of valid milestone numbers
      milestonesAchieved: validateMilestones(parsed.milestonesAchieved),
      
      // Validate totalCheckInXP: must be non-negative integer
      totalCheckInXP: (typeof parsed.totalCheckInXP === 'number' && 
                      parsed.totalCheckInXP >= 0 && 
                      Number.isInteger(parsed.totalCheckInXP)) 
                      ? parsed.totalCheckInXP : 0
    };
    
    // Log if data was corrupted and corrected
    if (JSON.stringify(parsed) !== JSON.stringify(validated)) {
      console.warn('Check-in state had invalid data, corrected with defaults');
    }
    
    return validated;
    
  } catch (error) {
    console.error('Failed to load check-in state:', error);
    // Return defaults on any error
    return getDefaultCheckInState();
  }
}

/**
 * Validate date string format (YYYY-MM-DD)
 * @param {*} dateString - Value to validate
 * @returns {string|null} Valid date string or null
 * Requirements: 9.4
 */
function validateDateString(dateString) {
  if (dateString === null || dateString === undefined) {
    return null;
  }
  
  if (typeof dateString !== 'string') {
    console.warn('Invalid date type:', typeof dateString);
    return null;
  }
  
  // Check ISO 8601 format (YYYY-MM-DD)
  const iso8601Pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso8601Pattern.test(dateString)) {
    console.warn('Invalid date format:', dateString);
    return null;
  }
  
  // Validate date is actually valid (not 2024-13-45)
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) {
    console.warn('Invalid date value:', dateString);
    return null;
  }
  
  return dateString;
}

/**
 * Validate check-in history array
 * @param {*} history - Value to validate
 * @returns {Array<string>} Valid array of date strings
 * Requirements: 9.5
 */
function validateCheckInHistory(history) {
  if (!Array.isArray(history)) {
    console.warn('Check-in history is not an array:', typeof history);
    return [];
  }
  
  // Filter to only valid date strings
  const validated = history.filter(item => {
    if (typeof item !== 'string') {
      console.warn('Non-string item in check-in history:', typeof item);
      return false;
    }
    return validateDateString(item) !== null;
  });
  
  // Remove duplicates and sort chronologically
  const unique = [...new Set(validated)].sort();
  
  if (validated.length !== history.length) {
    console.warn(`Removed ${history.length - validated.length} invalid entries from check-in history`);
  }
  
  return unique;
}

/**
 * Validate milestones achieved array
 * @param {*} milestones - Value to validate
 * @returns {Array<number>} Valid array of milestone numbers
 * Requirements: 9.3
 */
function validateMilestones(milestones) {
  if (!Array.isArray(milestones)) {
    console.warn('Milestones is not an array:', typeof milestones);
    return [];
  }
  
  // Valid milestone values
  const validMilestones = [7, 30, 100];
  
  // Filter to only valid milestone numbers
  const validated = milestones.filter(item => {
    if (typeof item !== 'number' || !Number.isInteger(item)) {
      console.warn('Non-integer milestone:', item);
      return false;
    }
    if (!validMilestones.includes(item)) {
      console.warn('Invalid milestone value:', item);
      return false;
    }
    return true;
  });
  
  // Remove duplicates and sort
  const unique = [...new Set(validated)].sort((a, b) => a - b);
  
  return unique;
}

// ============================================================================
// STREAK CALCULATION LOGIC
// ============================================================================

/**
 * StreakCalculator - Handles streak calculation logic
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
const StreakCalculator = {
  /**
   * Calculate current streak based on check-in history
   * @param {Array<string>} checkInHistory - Array of check-in dates (YYYY-MM-DD)
   * @param {string|null} lastCheckInDate - Last check-in date (YYYY-MM-DD)
   * @param {string} currentDate - Current date (YYYY-MM-DD), defaults to today
   * @returns {number} Current streak count
   * Requirements: 2.1, 2.2, 2.3, 2.4
   */
  calculateStreak: function(checkInHistory, lastCheckInDate, currentDate = getTodayString()) {
    // Handle edge case: empty history
    if (!checkInHistory || checkInHistory.length === 0) {
      return 0;
    }
    
    // Handle edge case: null lastCheckInDate
    if (!lastCheckInDate) {
      return 0;
    }
    
    // Parse dates
    const lastCheckIn = parseDate(lastCheckInDate);
    const today = parseDate(currentDate);
    
    // Check if last check-in was today (already checked in)
    if (this.isToday(lastCheckIn, today)) {
      // Count backwards through history to find streak
      return this.countConsecutiveStreak(checkInHistory, currentDate);
    }
    
    // Check if last check-in was yesterday (can continue streak)
    if (this.isYesterday(lastCheckIn, today)) {
      // Streak continues - count backwards through history
      return this.countConsecutiveStreak(checkInHistory, lastCheckInDate);
    }
    
    // Last check-in was 2+ days ago - streak is broken
    return 0;
  },
  
  /**
   * Count consecutive days in check-in history working backwards from a date
   * @param {Array<string>} checkInHistory - Array of check-in dates (YYYY-MM-DD)
   * @param {string} fromDate - Date to count backwards from (YYYY-MM-DD)
   * @returns {number} Number of consecutive days
   */
  countConsecutiveStreak: function(checkInHistory, fromDate) {
    if (!checkInHistory || checkInHistory.length === 0) {
      return 0;
    }
    
    // Create a Set for O(1) lookup
    const historySet = new Set(checkInHistory);
    
    let streak = 0;
    let currentDateStr = fromDate;
    
    // Count backwards through consecutive days
    while (historySet.has(currentDateStr)) {
      streak++;
      // Move to previous day using string manipulation to avoid timezone issues
      const [year, month, day] = currentDateStr.split('-').map(Number);
      const currentDate = new Date(year, month - 1, day); // month is 0-indexed
      currentDate.setDate(currentDate.getDate() - 1);
      
      // Format back to YYYY-MM-DD
      const newYear = currentDate.getFullYear();
      const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      const newDay = String(currentDate.getDate()).padStart(2, '0');
      currentDateStr = `${newYear}-${newMonth}-${newDay}`;
    }
    
    return streak;
  },
  
  /**
   * Check if two dates are consecutive days (date2 is day after date1)
   * @param {Date|string} date1 - First date
   * @param {Date|string} date2 - Second date
   * @returns {boolean} True if consecutive days
   * Requirements: 2.1, 2.3
   */
  areConsecutiveDays: function(date1, date2) {
    // Parse dates if strings
    const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;
    
    // Use existing isNextDay utility
    return isNextDay(d1, d2);
  },
  
  /**
   * Check if a date is today
   * @param {Date|string} date - Date to check
   * @param {Date|string} referenceDate - Reference date (defaults to today)
   * @returns {boolean} True if date is today
   * Requirements: 2.3
   */
  isToday: function(date, referenceDate = new Date()) {
    // Parse dates if strings
    const checkDate = typeof date === 'string' ? parseDate(date) : date;
    const refDate = typeof referenceDate === 'string' ? parseDate(referenceDate) : referenceDate;
    
    // Use existing isSameDay utility
    return isSameDay(checkDate, refDate);
  },
  
  /**
   * Check if a date is yesterday
   * @param {Date|string} date - Date to check
   * @param {Date|string} referenceDate - Reference date (defaults to today)
   * @returns {boolean} True if date is yesterday
   * Requirements: 2.3
   */
  isYesterday: function(date, referenceDate = new Date()) {
    // Parse dates if strings
    const checkDate = typeof date === 'string' ? parseDate(date) : date;
    const refDate = typeof referenceDate === 'string' ? parseDate(referenceDate) : referenceDate;
    
    // Calculate yesterday
    const yesterday = new Date(refDate);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Use existing isSameDay utility
    return isSameDay(checkDate, yesterday);
  }
};

// ============================================================================
// REWARD CALCULATION SYSTEM
// ============================================================================

/**
 * RewardCalculator - Calculates XP rewards based on streak length
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7
 */
const RewardCalculator = {
  /**
   * Base reward amount (XP)
   */
  BASE_REWARD: 10,
  
  /**
   * Calculate daily reward based on streak day
   * Formula: 10 + (streakDay * 2) + milestone bonus
   * 
   * Examples:
   * - Day 1: 10 + (1 * 2) = 12 XP
   * - Day 7: 10 + (7 * 2) + 50 = 74 XP (24 + 50 milestone bonus)
   * - Day 30: 10 + (30 * 2) + 200 = 270 XP (70 + 200 milestone bonus)
   * - Day 100: 10 + (100 * 2) + 1000 = 1210 XP (210 + 1000 milestone bonus)
   * 
   * @param {number} streakDay - Current streak day (1-based)
   * @returns {number} Total XP reward (daily + milestone bonus)
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7
   */
  calculateDailyReward: function(streakDay) {
    // Validate input
    if (typeof streakDay !== 'number' || streakDay < 1 || !Number.isInteger(streakDay)) {
      console.warn('Invalid streakDay provided to calculateDailyReward:', streakDay);
      return this.BASE_REWARD;
    }
    
    // Calculate base daily reward with progressive formula
    const dailyReward = this.BASE_REWARD + (streakDay * 2);
    
    // Add milestone bonus if applicable
    const milestoneBonus = this.getMilestoneBonus(streakDay);
    
    return dailyReward + milestoneBonus;
  },
  
  /**
   * Get milestone bonus XP for specific streak days
   * 
   * Milestone bonuses:
   * - Day 7: +50 XP (Week Warrior)
   * - Day 30: +200 XP (Monthly Master)
   * - Day 100: +1000 XP (Century Champion)
   * 
   * @param {number} streakDay - Current streak day (1-based)
   * @returns {number} Milestone bonus XP (0 if not a milestone)
   * Requirements: 3.2, 3.3, 3.4, 3.6
   */
  getMilestoneBonus: function(streakDay) {
    // Check if this day is a milestone
    if (streakDay === 7) {
      return 50;
    }
    if (streakDay === 30) {
      return 200;
    }
    if (streakDay === 100) {
      return 1000;
    }
    
    // Not a milestone day
    return 0;
  },
  
  /**
   * Check if a streak day is a milestone
   * @param {number} streakDay - Current streak day (1-based)
   * @returns {boolean} True if milestone day (7, 30, or 100)
   * Requirements: 3.6
   */
  isMilestone: function(streakDay) {
    return streakDay === 7 || streakDay === 30 || streakDay === 100;
  },
  
  /**
   * Get milestone achievement data for a specific streak day
   * @param {number} streakDay - Current streak day (1-based)
   * @returns {object|null} Achievement object or null if not a milestone
   * Requirements: 3.6, 6.1, 6.2, 6.3
   */
  getMilestoneAchievement: function(streakDay) {
    // Check if this is a milestone day
    if (!this.isMilestone(streakDay)) {
      return null;
    }
    
    // Return the achievement data from MILESTONE_ACHIEVEMENTS
    return MILESTONE_ACHIEVEMENTS[streakDay] || null;
  }
};

// ============================================================================
// STREAK FREEZE MECHANICS
// ============================================================================

/**
 * FreezeManager - Manages streak freeze mechanics
 * Freeze protects streaks when missing 1 day, but not 2+ days
 * Requirements: 5.1, 5.2, 5.4, 5.5
 */
const FreezeManager = {
  /**
   * Check if freeze is available
   * @returns {boolean} True if freeze is available, false otherwise
   * Requirements: 5.1
   */
  isFreezeAvailable: function() {
    // Check if window.state.checkIn exists
    if (!window.state || !window.state.checkIn) {
      console.warn('Check-in state not initialized');
      return false;
    }
    
    const state = window.state.checkIn;
    
    // Freeze is available if:
    // 1. freezeAvailable flag is true
    // 2. User has an active streak (currentStreak > 0)
    return state.freezeAvailable === true && state.currentStreak > 0;
  },
  
  /**
   * Consume a freeze to protect streak
   * Updates state to mark freeze as used
   * @returns {boolean} True if freeze was consumed successfully, false otherwise
   * Requirements: 5.2
   */
  consumeFreeze: function() {
    // Check if window.state.checkIn exists
    if (!window.state || !window.state.checkIn) {
      console.error('Check-in state not initialized');
      return false;
    }
    
    const state = window.state.checkIn;
    
    // Can only consume if freeze is available
    if (!state.freezeAvailable) {
      console.warn('Cannot consume freeze: freeze not available');
      return false;
    }
    
    // Consume the freeze
    state.freezeAvailable = false;
    
    console.log('Freeze consumed to protect streak');
    return true;
  },
  
  /**
   * Restore freeze after successful check-in
   * Freeze is restored when user checks in after using it
   * @returns {boolean} True if freeze was restored, false otherwise
   * Requirements: 5.4
   */
  restoreFreeze: function() {
    // Check if window.state.checkIn exists
    if (!window.state || !window.state.checkIn) {
      console.error('Check-in state not initialized');
      return false;
    }
    
    const state = window.state.checkIn;
    
    // Only restore if freeze is currently unavailable
    if (state.freezeAvailable) {
      // Already available, no need to restore
      return false;
    }
    
    // Restore the freeze
    state.freezeAvailable = true;
    
    console.log('Freeze restored after successful check-in');
    return true;
  },
  
  /**
   * Check if freeze should be applied for a given gap
   * Freeze applies only when:
   * - Exactly 1 day was missed (not 2+)
   * - Freeze is available
   * 
   * @param {number} daysSinceLastCheckIn - Number of days since last check-in
   * @param {boolean} freezeAvailable - Whether freeze is currently available
   * @returns {boolean} True if freeze should be applied, false otherwise
   * Requirements: 5.2, 5.5
   */
  shouldApplyFreeze: function(daysSinceLastCheckIn, freezeAvailable) {
    // Validate inputs
    if (typeof daysSinceLastCheckIn !== 'number' || daysSinceLastCheckIn < 0) {
      console.warn('Invalid daysSinceLastCheckIn:', daysSinceLastCheckIn);
      return false;
    }
    
    if (typeof freezeAvailable !== 'boolean') {
      console.warn('Invalid freezeAvailable:', freezeAvailable);
      return false;
    }
    
    // Freeze applies only when:
    // 1. Exactly 1 day was missed (daysSinceLastCheckIn === 2, because today is day 2 after last check-in)
    // 2. Freeze is available
    // 
    // Note: If last check-in was yesterday (1 day ago), daysSinceLastCheckIn would be 1
    // If last check-in was 2 days ago, daysSinceLastCheckIn would be 2
    // So we check for daysSinceLastCheckIn === 2 (missed exactly 1 day)
    const missedExactlyOneDay = daysSinceLastCheckIn === 2;
    
    return missedExactlyOneDay && freezeAvailable;
  }
};

// ============================================================================
// CALENDAR RENDERING
// ============================================================================

/**
 * CalendarRenderer - Renders the check-in calendar UI
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */
const CalendarRenderer = {
  /**
   * Current displayed month and year
   */
  currentDisplayMonth: new Date().getMonth(),
  currentDisplayYear: new Date().getFullYear(),
  
  /**
   * Render calendar for a specific month
   * Generates HTML for calendar grid showing check-in history
   * 
   * @param {number} year - Year to render (e.g., 2024)
   * @param {number} month - Month to render (0-11, Jan-Dec)
   * @param {Array<string>} checkInHistory - Array of check-in dates (YYYY-MM-DD)
   * @returns {string} HTML string for calendar grid
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
   */
  renderMonth: function(year, month, checkInHistory) {
    try {
      // Validate inputs
      if (typeof year !== 'number' || year < 1900 || year > 2100) {
        throw new Error(`Invalid year: ${year}`);
      }
      
      if (typeof month !== 'number' || month < 0 || month > 11) {
        throw new Error(`Invalid month: ${month}`);
      }
      
      if (!Array.isArray(checkInHistory)) {
        console.warn('Invalid checkInHistory, using empty array');
        checkInHistory = [];
      }
      
      // Get calendar data
      const daysInMonth = this.getDaysInMonth(year, month);
      const firstDayOfWeek = this.getFirstDayOfMonth(year, month);
      const today = getTodayString();
      
      // Month names for header
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      // Day names for header
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Build HTML
      let html = '<div class="calendar-container">';
      
      // Calendar header with navigation
      html += '<div class="calendar-header">';
      html += `<button class="calendar-nav-btn" onclick="window.CalendarRenderer.navigateMonth(-1)" aria-label="Previous month">`;
      html += '<i class="fas fa-chevron-left"></i>';
      html += '</button>';
      html += `<h3 class="calendar-title">${monthNames[month]} ${year}</h3>`;
      html += `<button class="calendar-nav-btn" onclick="window.CalendarRenderer.navigateMonth(1)" aria-label="Next month">`;
      html += '<i class="fas fa-chevron-right"></i>';
      html += '</button>';
      html += '</div>';
      
      // Day names header
      html += '<div class="calendar-days-header">';
      dayNames.forEach(day => {
        html += `<div class="calendar-day-name">${day}</div>`;
      });
      html += '</div>';
      
      // Calendar grid
      html += '<div class="calendar-grid">';
      
      // Empty cells for days before month starts
      for (let i = 0; i < firstDayOfWeek; i++) {
        html += '<div class="calendar-day calendar-day-empty"></div>';
      }
      
      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        // Format date as YYYY-MM-DD
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Check if this date has a check-in
        const hasCheckIn = this.hasCheckIn(dateStr, checkInHistory);
        
        // Check if this is today
        const isToday = dateStr === today;
        
        // Build CSS classes
        let classes = 'calendar-day';
        if (hasCheckIn) {
          classes += ' calendar-day-checked-in';
        }
        if (isToday) {
          classes += ' calendar-day-today';
        }
        
        // Build day cell
        html += `<div class="${classes}" data-date="${dateStr}">`;
        html += `<span class="calendar-day-number">${day}</span>`;
        if (hasCheckIn) {
          html += '<i class="fas fa-check calendar-check-icon"></i>';
        }
        html += '</div>';
      }
      
      html += '</div>'; // Close calendar-grid
      html += '</div>'; // Close calendar-container
      
      return html;
      
    } catch (error) {
      console.error('Calendar rendering failed:', error);
      return '<div class="calendar-error"><p class="text-red-500">Unable to load calendar. Please refresh.</p></div>';
    }
  },
  
  /**
   * Get number of days in a month
   * Handles leap years correctly
   * 
   * @param {number} year - Year (e.g., 2024)
   * @param {number} month - Month (0-11, Jan-Dec)
   * @returns {number} Number of days in month (28-31)
   * Requirements: 4.1
   */
  getDaysInMonth: function(year, month) {
    // Create date for first day of next month, then subtract 1 day
    // This automatically handles leap years
    return new Date(year, month + 1, 0).getDate();
  },
  
  /**
   * Get first day of month (0-6, Sun-Sat)
   * Used to determine calendar grid offset
   * 
   * @param {number} year - Year (e.g., 2024)
   * @param {number} month - Month (0-11, Jan-Dec)
   * @returns {number} Day of week (0=Sunday, 6=Saturday)
   * Requirements: 4.1
   */
  getFirstDayOfMonth: function(year, month) {
    return new Date(year, month, 1).getDay();
  },
  
  /**
   * Check if a specific date has a check-in
   * 
   * @param {string} date - Date to check (YYYY-MM-DD)
   * @param {Array<string>} checkInHistory - Array of check-in dates
   * @returns {boolean} True if date has check-in, false otherwise
   * Requirements: 4.2, 4.3
   */
  hasCheckIn: function(date, checkInHistory) {
    if (!Array.isArray(checkInHistory)) {
      return false;
    }
    return checkInHistory.includes(date);
  },
  
  /**
   * Navigate to previous or next month
   * Updates displayed month and re-renders calendar
   * 
   * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
   * @returns {boolean} True if navigation successful, false otherwise
   * Requirements: 4.5
   */
  navigateMonth: function(direction) {
    try {
      // Validate direction
      if (direction !== -1 && direction !== 1) {
        console.error('Invalid navigation direction:', direction);
        return false;
      }
      
      // Calculate new month/year
      this.currentDisplayMonth += direction;
      
      // Handle month overflow/underflow
      if (this.currentDisplayMonth > 11) {
        this.currentDisplayMonth = 0;
        this.currentDisplayYear += 1;
      } else if (this.currentDisplayMonth < 0) {
        this.currentDisplayMonth = 11;
        this.currentDisplayYear -= 1;
      }
      
      // Re-render calendar with new month
      this.updateCalendarDisplay();
      
      console.log(`Navigated to ${this.currentDisplayYear}-${this.currentDisplayMonth + 1}`);
      return true;
      
    } catch (error) {
      console.error('Calendar navigation failed:', error);
      return false;
    }
  },
  
  /**
   * Update calendar display in DOM
   * Renders calendar for current displayed month
   * Requirements: 4.5
   */
  updateCalendarDisplay: function() {
    // Check if we're in browser environment
    if (typeof document === 'undefined') {
      return;
    }
    
    // Get calendar container element
    const container = document.getElementById('check-in-calendar');
    if (!container) {
      console.warn('Calendar container element not found');
      return;
    }
    
    // Get check-in history from state
    const checkInHistory = window.state?.checkIn?.checkInHistory || [];
    
    // Render and update
    const html = this.renderMonth(
      this.currentDisplayYear,
      this.currentDisplayMonth,
      checkInHistory
    );
    
    container.innerHTML = html;
  },
  
  /**
   * Initialize calendar display
   * Sets up calendar for current month
   * Requirements: 4.1
   */
  init: function() {
    // Set to current month/year
    const now = new Date();
    this.currentDisplayMonth = now.getMonth();
    this.currentDisplayYear = now.getFullYear();
    
    // Update display if in browser
    if (typeof document !== 'undefined') {
      this.updateCalendarDisplay();
    }
  }
};

// ============================================================================
// UI CONTROLLER
// ============================================================================

/**
 * UIController - Manages UI updates and animations
 * Requirements: 5.3, 6.5, 7.1, 7.2, 7.3, 8.2, 8.3, 8.5
 */
const UIController = {
  /**
   * Update check-in button state
   * Enable/disable button and update styling based on check-in availability
   * 
   * @param {boolean} canCheckIn - Whether check-in is available
   * @returns {boolean} True if update successful, false otherwise
   * Requirements: 7.2, 7.3
   */
  updateCheckInButton: function(canCheckIn) {
    // Check if we're in browser environment
    if (typeof document === 'undefined') {
      return false;
    }
    
    // Get check-in button element
    const button = document.getElementById('check-in-button');
    if (!button) {
      console.warn('Check-in button element not found');
      return false;
    }
    
    try {
      if (canCheckIn) {
        // Enable button for check-in
        button.disabled = false;
        button.classList.remove('opacity-50', 'cursor-not-allowed');
        button.classList.add('hover:scale-105', 'transition-transform');
        button.textContent = '✓ Check In';
        button.setAttribute('aria-label', 'Check in for today');
      } else {
        // Disable button - already checked in
        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
        button.classList.remove('hover:scale-105', 'transition-transform');
        button.textContent = '✓ Checked In';
        button.setAttribute('aria-label', 'Already checked in today');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating check-in button:', error);
      return false;
    }
  },
  
  /**
   * Update streak display with animation
   * Updates the streak counter with smooth number animation
   * 
   * @param {number} streak - New streak value to display
   * @returns {boolean} True if update successful, false otherwise
   * Requirements: 7.1
   */
  updateStreakDisplay: function(streak) {
    // Check if we're in browser environment
    if (typeof document === 'undefined') {
      return false;
    }
    
    // Validate input
    if (typeof streak !== 'number' || streak < 0 || !Number.isInteger(streak)) {
      console.error('Invalid streak value provided to updateStreakDisplay:', streak);
      return false;
    }
    
    // Get streak display element
    const streakElement = document.getElementById('streak-counter');
    if (!streakElement) {
      console.warn('Streak counter element not found');
      return false;
    }
    
    try {
      // Get current value
      const currentValue = parseInt(streakElement.textContent) || 0;
      
      // Animate counter from current to new value
      this.animateCounter(streakElement, streak, 800);
      
      // Add pulse animation class for visual feedback
      streakElement.classList.add('animate-pulse');
      setTimeout(() => {
        streakElement.classList.remove('animate-pulse');
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error updating streak display:', error);
      return false;
    }
  },
  
  /**
   * Show check-in success notification
   * Display success notification with XP earned and new streak
   * 
   * @param {number} xpEarned - XP earned from check-in
   * @param {number} newStreak - New streak count
   * @returns {boolean} True if notification shown successfully, false otherwise
   * Requirements: 8.2
   */
  showCheckInSuccess: function(xpEarned, newStreak) {
    // Validate inputs
    if (typeof xpEarned !== 'number' || xpEarned < 0) {
      console.error('Invalid xpEarned provided to showCheckInSuccess:', xpEarned);
      return false;
    }
    
    if (typeof newStreak !== 'number' || newStreak < 1) {
      console.error('Invalid newStreak provided to showCheckInSuccess:', newStreak);
      return false;
    }
    
    // Build notification message
    const message = `✅ Check-in complete! +${xpEarned} XP (${newStreak} day streak)`;
    
    // Check if showAchievementToast function exists
    if (typeof window.showAchievementToast === 'function') {
      try {
        window.showAchievementToast(message, 'success');
        console.log('Check-in success notification shown');
        return true;
      } catch (error) {
        console.error('Error showing check-in success notification:', error);
      }
    }
    
    // Fallback: console log
    console.log(`📢 ${message}`);
    return false;
  },
  
  /**
   * Show milestone celebration with confetti
   * Display special celebration for milestone achievements
   * 
   * @param {number} milestone - Milestone day (7, 30, or 100)
   * @param {object} achievement - Achievement object with name, description, icon, xpBonus
   * @returns {boolean} True if celebration shown successfully, false otherwise
   * Requirements: 6.5, 8.5
   */
  showMilestoneCelebration: function(milestone, achievement) {
    // Validate inputs
    if (typeof milestone !== 'number' || ![7, 30, 100].includes(milestone)) {
      console.error('Invalid milestone provided to showMilestoneCelebration:', milestone);
      return false;
    }
    
    if (!achievement || typeof achievement !== 'object') {
      console.error('Invalid achievement object provided to showMilestoneCelebration:', achievement);
      return false;
    }
    
    try {
      // Build celebration message
      const message = `🎉 ${achievement.name}! ${achievement.description} (+${achievement.xpBonus} bonus XP)`;
      
      // Show achievement toast if available
      if (typeof window.showAchievementToast === 'function') {
        window.showAchievementToast(message, 'success');
      } else {
        console.log(`📢 ${message}`);
      }
      
      // Trigger confetti animation with custom particle count based on milestone
      if (typeof window.triggerConfetti === 'function') {
        try {
          // More confetti for bigger milestones
          let particleCount = 100;
          if (milestone === 30) particleCount = 150;
          if (milestone === 100) particleCount = 200;
          
          window.triggerConfetti({ particleCount: particleCount });
          console.log(`✓ Confetti triggered for milestone ${milestone} with ${particleCount} particles`);
        } catch (error) {
          console.warn('Error triggering confetti:', error);
        }
      } else {
        console.log('🎊 Confetti effect (function not available)');
      }
      
      // Add celebration animation to streak display if element exists
      if (typeof document !== 'undefined') {
        const streakElement = document.getElementById('streak-counter');
        if (streakElement) {
          // Add bounce animation
          streakElement.classList.add('animate-bounce');
          setTimeout(() => {
            streakElement.classList.remove('animate-bounce');
          }, 2000);
          
          // Add scale pulse effect
          try {
            streakElement.style.transform = 'scale(1.2)';
            streakElement.style.transition = 'transform 0.3s ease-out';
            setTimeout(() => {
              streakElement.style.transform = 'scale(1)';
            }, 300);
          } catch (styleError) {
            console.warn('Could not apply style animation:', styleError);
          }
        }
        
        // Add celebration effect to check-in button
        const checkInButton = document.getElementById('check-in-button');
        if (checkInButton) {
          checkInButton.classList.add('animate-pulse');
          setTimeout(() => {
            checkInButton.classList.remove('animate-pulse');
          }, 2000);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error showing milestone celebration:', error);
      return false;
    }
  },
  
  /**
   * Show freeze protection notification
   * Display message when streak freeze is used or available
   * 
   * @param {boolean} freezeUsed - Whether freeze was just used (true) or is available (false)
   * @returns {boolean} True if notification shown successfully, false otherwise
   * Requirements: 5.3, 8.3
   */
  showFreezeNotification: function(freezeUsed) {
    // Validate input
    if (typeof freezeUsed !== 'boolean') {
      console.error('Invalid freezeUsed provided to showFreezeNotification:', freezeUsed);
      return false;
    }
    
    try {
      let message = '';
      let notificationType = 'info';
      
      if (freezeUsed) {
        // Freeze was just consumed
        message = '❄️ Streak Freeze used! Your streak is protected.';
        notificationType = 'warning';
        
        // Add freeze animation effect
        if (typeof document !== 'undefined') {
          const freezeIndicator = document.getElementById('freeze-status-indicator');
          if (freezeIndicator) {
            // Add visual feedback for freeze usage
            freezeIndicator.classList.add('used');
            freezeIndicator.innerHTML = '<i class="fas fa-snowflake"></i><span>Freeze Used</span>';
            
            // Add shake animation
            freezeIndicator.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
              freezeIndicator.style.animation = '';
            }, 500);
          }
        }
      } else {
        // Freeze is available
        message = '❄️ Streak Freeze available - miss one day without losing your streak!';
        notificationType = 'info';
      }
      
      // Show notification if function available
      if (typeof window.showAchievementToast === 'function') {
        window.showAchievementToast(message, notificationType);
        return true;
      } else {
        console.log(`📢 ${message}`);
        return false;
      }
    } catch (error) {
      console.error('Error showing freeze notification:', error);
      return false;
    }
  },
  
  /**
   * Show check-in success animation
   * Add visual feedback when check-in is successful
   * 
   * @returns {boolean} True if animation shown successfully, false otherwise
   * Requirements: 8.5
   */
  showCheckInSuccessAnimation: function() {
    if (typeof document === 'undefined') {
      return false;
    }
    
    try {
      // Animate check-in button
      const checkInButton = document.getElementById('check-in-button');
      if (checkInButton) {
        // Change to success state
        checkInButton.classList.add('checked-in');
        checkInButton.innerHTML = '<i class="fas fa-check-circle text-2xl"></i><span>Checked In!</span>';
        
        // Add success pulse animation
        checkInButton.style.transform = 'scale(1.1)';
        checkInButton.style.transition = 'transform 0.3s ease-out';
        setTimeout(() => {
          checkInButton.style.transform = 'scale(1)';
        }, 300);
      }
      
      // Animate streak counter
      const streakCounter = document.getElementById('streak-counter');
      if (streakCounter) {
        // Add glow effect
        streakCounter.style.textShadow = '0 0 30px rgba(102,126,234,0.8), 0 4px 20px rgba(0,0,0,0.2)';
        setTimeout(() => {
          streakCounter.style.textShadow = '0 4px 20px rgba(0,0,0,0.2)';
        }, 1000);
      }
      
      // Add success ripple effect to container
      const container = document.querySelector('.check-in-header');
      if (container) {
        container.style.animation = 'pulse 0.5s ease-out';
        setTimeout(() => {
          container.style.animation = '';
        }, 500);
      }
      
      return true;
    } catch (error) {
      console.error('Error showing check-in success animation:', error);
      return false;
    }
  },
  
  /**
   * Update calendar display
   * Refresh calendar to show latest check-in data
   * 
   * @returns {boolean} True if calendar updated successfully, false otherwise
   * Requirements: 7.1
   */
  updateCalendar: function() {
    // Check if we're in browser environment
    if (typeof document === 'undefined') {
      return false;
    }
    
    try {
      // Check if CalendarRenderer is available
      if (typeof window.CalendarRenderer === 'object' && 
          typeof window.CalendarRenderer.updateCalendarDisplay === 'function') {
        window.CalendarRenderer.updateCalendarDisplay();
        console.log('Calendar display updated');
        return true;
      } else {
        console.warn('CalendarRenderer not available');
        return false;
      }
    } catch (error) {
      console.error('Error updating calendar:', error);
      return false;
    }
  },
  
  /**
   * Animate counter with smooth number transition
   * Smoothly animates a number from current value to target value
   * 
   * @param {HTMLElement} element - DOM element containing the counter
   * @param {number} targetValue - Target value to animate to
   * @param {number} duration - Animation duration in milliseconds (default: 1000)
   * @returns {boolean} True if animation started successfully, false otherwise
   * Requirements: 7.1
   */
  animateCounter: function(element, targetValue, duration = 1000) {
    // Validate inputs
    if (!element || !(element instanceof HTMLElement)) {
      console.error('Invalid element provided to animateCounter');
      return false;
    }
    
    if (typeof targetValue !== 'number' || targetValue < 0 || !Number.isInteger(targetValue)) {
      console.error('Invalid targetValue provided to animateCounter:', targetValue);
      return false;
    }
    
    if (typeof duration !== 'number' || duration <= 0) {
      console.error('Invalid duration provided to animateCounter:', duration);
      return false;
    }
    
    try {
      // Get current value from element
      const currentValue = parseInt(element.textContent) || 0;
      
      // If values are the same, no animation needed
      if (currentValue === targetValue) {
        element.textContent = targetValue;
        return true;
      }
      
      // Calculate animation parameters
      const startTime = performance.now();
      const difference = targetValue - currentValue;
      
      // Animation function using requestAnimationFrame
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        // Calculate current value
        const current = Math.round(currentValue + (difference * easeOut));
        
        // Update element
        element.textContent = current;
        
        // Continue animation if not complete
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final value is exact
          element.textContent = targetValue;
        }
      };
      
      // Start animation
      requestAnimationFrame(animate);
      
      return true;
    } catch (error) {
      console.error('Error animating counter:', error);
      // Fallback: set value directly
      element.textContent = targetValue;
      return false;
    }
  }
};

// ============================================================================
// REMINDER SYSTEM
// ============================================================================

/**
 * ReminderSystem - Manages check-in reminders and countdown display
 * Requirements: 12.1, 12.2, 12.3, 12.4
 */
const ReminderSystem = {
  /**
   * Countdown interval ID for cleanup
   */
  countdownInterval: null,
  
  /**
   * Check if reminder should be displayed
   * Reminder shows when user hasn't checked in today
   * 
   * @returns {boolean} True if reminder should be shown, false otherwise
   * Requirements: 12.1, 12.2
   */
  shouldShowReminder: function() {
    // Check if window.state.checkIn exists
    if (!window.state || !window.state.checkIn) {
      console.warn('Check-in state not initialized');
      return false;
    }
    
    const state = window.state.checkIn;
    const today = getTodayString();
    
    // Show reminder if user hasn't checked in today
    const hasCheckedInToday = state.checkInHistory.includes(today);
    
    return !hasCheckedInToday;
  },
  
  /**
   * Update reminder indicator in navigation
   * Shows visual indicator when check-in is pending
   * More prominent if streak is at risk
   * 
   * @returns {boolean} True if indicator updated successfully, false otherwise
   * Requirements: 12.1, 12.4
   */
  updateReminderIndicator: function() {
    // Check if we're in browser environment
    if (typeof document === 'undefined') {
      return false;
    }
    
    // Get reminder indicator element
    const indicator = document.getElementById('check-in-reminder-indicator');
    if (!indicator) {
      console.warn('Check-in reminder indicator element not found');
      return false;
    }
    
    try {
      const shouldShow = this.shouldShowReminder();
      
      if (shouldShow) {
        // Check if streak is at risk (has active streak)
        const state = window.state.checkIn;
        const hasActiveStreak = state && state.currentStreak > 0;
        
        // Show indicator
        indicator.classList.remove('hidden');
        
        // Make more prominent if streak is at risk
        if (hasActiveStreak) {
          // Streak at risk - use warning style
          indicator.classList.add('animate-pulse', 'bg-red-500');
          indicator.classList.remove('bg-blue-500');
          indicator.setAttribute('title', `Don't lose your ${state.currentStreak} day streak! Check in today.`);
        } else {
          // No streak - use subtle style
          indicator.classList.add('bg-blue-500');
          indicator.classList.remove('animate-pulse', 'bg-red-500');
          indicator.setAttribute('title', 'Check in today to start your streak!');
        }
      } else {
        // Hide indicator - already checked in
        indicator.classList.add('hidden');
        indicator.classList.remove('animate-pulse', 'bg-red-500', 'bg-blue-500');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating reminder indicator:', error);
      return false;
    }
  },
  
  /**
   * Calculate time remaining until day ends
   * Returns hours, minutes, and seconds until midnight
   * 
   * @returns {object} Object with hours, minutes, seconds, and formatted string
   * Requirements: 12.3
   */
  calculateTimeRemaining: function() {
    try {
      // Get current time
      const now = new Date();
      
      // Calculate midnight (end of day)
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      
      // Calculate difference in milliseconds
      const diff = midnight - now;
      
      // Convert to hours, minutes, seconds
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Format as string
      const formatted = `${hours}h ${minutes}m ${seconds}s`;
      
      return {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        formatted: formatted,
        totalMilliseconds: diff
      };
    } catch (error) {
      console.error('Error calculating time remaining:', error);
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        formatted: '0h 0m 0s',
        totalMilliseconds: 0
      };
    }
  },
  
  /**
   * Update countdown display
   * Refreshes countdown timer showing time until day ends
   * 
   * @returns {boolean} True if countdown updated successfully, false otherwise
   * Requirements: 12.3
   */
  updateCountdown: function() {
    // Check if we're in browser environment
    if (typeof document === 'undefined') {
      return false;
    }
    
    // Get countdown display element
    const countdownElement = document.getElementById('check-in-countdown');
    if (!countdownElement) {
      console.warn('Check-in countdown element not found');
      return false;
    }
    
    try {
      // Only show countdown if reminder should be shown
      const shouldShow = this.shouldShowReminder();
      
      if (shouldShow) {
        // Calculate time remaining
        const timeRemaining = this.calculateTimeRemaining();
        
        // Update countdown text
        countdownElement.textContent = timeRemaining.formatted;
        countdownElement.classList.remove('hidden');
        
        // Add urgency styling if less than 1 hour remaining
        if (timeRemaining.hours < 1) {
          countdownElement.classList.add('text-red-500', 'font-bold');
        } else {
          countdownElement.classList.remove('text-red-500', 'font-bold');
        }
      } else {
        // Hide countdown - already checked in
        countdownElement.classList.add('hidden');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating countdown:', error);
      return false;
    }
  },
  
  /**
   * Start countdown timer
   * Updates countdown every minute (60 seconds)
   * 
   * @returns {boolean} True if timer started successfully, false otherwise
   * Requirements: 12.3
   */
  startCountdownTimer: function() {
    // Stop existing timer if running
    this.stopCountdownTimer();
    
    try {
      // Initial update
      this.updateCountdown();
      this.updateReminderIndicator();
      
      // Update every minute (60000 milliseconds)
      this.countdownInterval = setInterval(() => {
        this.updateCountdown();
        this.updateReminderIndicator();
      }, 60000);
      
      console.log('Countdown timer started (updates every minute)');
      return true;
    } catch (error) {
      console.error('Error starting countdown timer:', error);
      return false;
    }
  },
  
  /**
   * Stop countdown timer
   * Cleans up interval to prevent memory leaks
   * 
   * @returns {boolean} True if timer stopped successfully, false otherwise
   */
  stopCountdownTimer: function() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
      console.log('Countdown timer stopped');
      return true;
    }
    return false;
  },
  
  /**
   * Initialize reminder system
   * Sets up countdown timer and initial display
   * 
   * @returns {boolean} True if initialization successful, false otherwise
   * Requirements: 12.1, 12.2, 12.3
   */
  init: function() {
    console.log('Initializing Reminder System...');
    
    // Check if we're in browser environment
    if (typeof document === 'undefined') {
      console.warn('Not in browser environment, skipping reminder system initialization');
      return false;
    }
    
    try {
      // Initial update of reminder indicator and countdown
      this.updateReminderIndicator();
      this.updateCountdown();
      
      // Start countdown timer
      this.startCountdownTimer();
      
      console.log('Reminder System initialized');
      return true;
    } catch (error) {
      console.error('Error initializing reminder system:', error);
      return false;
    }
  },
  
  /**
   * Refresh reminder display
   * Updates all reminder UI elements
   * Call this after check-in to hide reminders
   * 
   * @returns {boolean} True if refresh successful, false otherwise
   * Requirements: 12.1, 12.2, 12.3
   */
  refresh: function() {
    try {
      this.updateReminderIndicator();
      this.updateCountdown();
      return true;
    } catch (error) {
      console.error('Error refreshing reminder display:', error);
      return false;
    }
  }
};

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

/**
 * CheckInManager - Main controller for check-in operations
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.5
 */
const CheckInManager = {
  /**
   * Initialize the check-in system
   * - Load check-in data from storage
   * - Set up UI event listeners
   * - Check if check-in is available today
   * - Update UI state
   * Requirements: 1.1, 1.2
   */
  init: function() {
    console.log('Initializing Daily Check-In System...');
    
    // Initialize window.state.checkIn if not exists
    if (!window.state) {
      window.state = {};
    }
    
    // Load persisted data from localStorage (with validation)
    window.state.checkIn = loadCheckInState();
    
    console.log('Check-In System initialized:', window.state.checkIn);
    
    // Set up event listeners if UI elements exist
    this.setupEventListeners();
    
    // Initialize reminder system if in browser environment
    if (typeof document !== 'undefined' && typeof window.ReminderSystem === 'object') {
      window.ReminderSystem.init();
    }
  },
  
  /**
   * Set up event listeners for check-in UI
   * Requirements: 1.2
   */
  setupEventListeners: function() {
    // Check if we're in a browser environment
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') {
      return; // Not in browser, skip event listener setup
    }
    
    // Check if check-in button exists
    const checkInButton = document.getElementById('check-in-button');
    if (checkInButton) {
      checkInButton.addEventListener('click', () => {
        this.processCheckIn();
      });
    }
  },
  
  /**
   * Save current check-in state to localStorage
   * @returns {boolean} True if save successful
   * Requirements: 1.5, 2.5
   */
  saveState: function() {
    return saveCheckInState(window.state.checkIn);
  },
  
  /**
   * Validate if check-in is allowed today
   * Checks if a check-in has already occurred for the current day
   * @returns {boolean} True if no check-in today, false otherwise
   * Requirements: 1.1
   */
  canCheckInToday: function() {
    const state = window.state.checkIn;
    const today = getTodayString();
    
    // Check if today's date exists in check-in history
    return !state.checkInHistory.includes(today);
  },
  
  /**
   * Get check-in status for today
   * @returns {object} Status object with checkedIn, streak, freezeAvailable
   * Requirements: 1.1, 2.5
   */
  getCheckInStatus: function() {
    const state = window.state.checkIn;
    return {
      checkedIn: !this.canCheckInToday(),
      streak: state.currentStreak,
      freezeAvailable: state.freezeAvailable,
      totalCheckIns: state.totalCheckIns,
      longestStreak: state.longestStreak,
      lastCheckInDate: state.lastCheckInDate,
      milestonesAchieved: state.milestonesAchieved,
      totalCheckInXP: state.totalCheckInXP
    };
  },
  
  /**
   * Process a check-in request
   * Main entry point for check-in functionality
   * 
   * Flow:
   * 1. Validate check-in is allowed (not already done today)
   * 2. Calculate new streak (with freeze logic if needed)
   * 3. Calculate and award rewards
   * 4. Update state and localStorage
   * 5. Trigger UI updates and notifications
   * 6. Check for milestone achievements
   * 
   * Requirements: 1.1, 1.2, 1.3, 1.4, 2.5
   */
  processCheckIn: function() {
    console.log('Processing check-in...');
    
    // Step 1: Validate check-in is allowed
    if (!this.canCheckInToday()) {
      console.warn('Check-in already completed today');
      this.showAlreadyCheckedInMessage();
      return false;
    }
    
    const state = window.state.checkIn;
    const today = getTodayString();
    const lastCheckInDate = state.lastCheckInDate;
    
    // Step 2: Calculate new streak with freeze logic
    let newStreak = 0;
    let freezeUsed = false;
    
    if (!lastCheckInDate) {
      // First ever check-in
      newStreak = 1;
    } else {
      const lastCheckIn = parseDate(lastCheckInDate);
      const todayDate = parseDate(today);
      const daysSince = getDaysBetween(lastCheckIn, todayDate);
      
      if (daysSince === 1) {
        // Consecutive day - increment streak
        newStreak = state.currentStreak + 1;
      } else if (daysSince === 2 && FreezeManager.isFreezeAvailable()) {
        // Missed exactly 1 day, but freeze is available
        FreezeManager.consumeFreeze();
        newStreak = state.currentStreak + 1;
        freezeUsed = true;
        console.log('Freeze used to protect streak');
      } else {
        // Streak broken - start new streak
        newStreak = 1;
      }
    }
    
    // Step 3: Calculate rewards
    const xpReward = RewardCalculator.calculateDailyReward(newStreak);
    const isMilestone = RewardCalculator.isMilestone(newStreak);
    const milestoneAchievement = isMilestone ? RewardCalculator.getMilestoneAchievement(newStreak) : null;
    
    // Step 4: Update state
    state.currentStreak = newStreak;
    state.lastCheckInDate = today;
    state.checkInHistory.push(today);
    state.totalCheckIns += 1;
    state.totalCheckInXP += xpReward;
    
    // Update longest streak if current is higher
    if (newStreak > state.longestStreak) {
      state.longestStreak = newStreak;
    }
    
    // Restore freeze if it was used previously (not this check-in)
    if (!freezeUsed && !state.freezeAvailable) {
      FreezeManager.restoreFreeze();
    }
    
    // Add milestone to achieved list if new
    if (isMilestone && !state.milestonesAchieved.includes(newStreak)) {
      state.milestonesAchieved.push(newStreak);
      state.milestonesAchieved.sort((a, b) => a - b);
    }
    
    // Step 5: Persist to localStorage
    this.saveState();
    
    // Step 6: Integrate with existing systems
    this.awardXP(xpReward);
    
    if (milestoneAchievement) {
      this.unlockMilestoneAchievement(milestoneAchievement);
    }
    
    // Step 7: Show notifications
    this.showCheckInNotification(xpReward, newStreak, isMilestone, milestoneAchievement);
    
    if (freezeUsed) {
      this.showFreezeUsedNotification();
    }
    
    // Step 8: Show success animation
    if (typeof window.UIController === 'object' && 
        typeof window.UIController.showCheckInSuccessAnimation === 'function') {
      window.UIController.showCheckInSuccessAnimation();
    }
    
    // Step 9: Refresh reminder system to hide reminders
    if (typeof window.ReminderSystem === 'object' && 
        typeof window.ReminderSystem.refresh === 'function') {
      window.ReminderSystem.refresh();
    }
    
    console.log('Check-in completed successfully:', {
      streak: newStreak,
      xpEarned: xpReward,
      milestone: isMilestone,
      freezeUsed: freezeUsed
    });
    
    return true;
  },
  
  /**
   * Award XP to user via existing XP system
   * Wrapper for addScore() with existence checks and fallback behavior
   * 
   * @param {number} amount - XP amount to award
   * @returns {boolean} True if XP was awarded successfully, false if fallback used
   * Requirements: 3.5, 11.1
   */
  awardXP: function(amount) {
    // Validate input
    if (typeof amount !== 'number' || amount < 0 || !Number.isInteger(amount)) {
      console.error('Invalid XP amount provided to awardXP:', amount);
      return false;
    }
    
    // Check if addScore function exists and is callable
    if (typeof window.addScore === 'function') {
      try {
        window.addScore(amount);
        console.log(`✓ Awarded ${amount} XP via addScore`);
        return true;
      } catch (error) {
        console.error('Error calling addScore:', error);
        // Fall through to fallback behavior
      }
    }
    
    // Fallback behavior: Store pending XP for later award
    console.warn(`⚠ addScore function not available, storing ${amount} XP as pending`);
    
    if (!window.pendingCheckInXP) {
      window.pendingCheckInXP = 0;
    }
    window.pendingCheckInXP += amount;
    
    // Log pending XP for debugging
    console.log(`Pending check-in XP: ${window.pendingCheckInXP}`);
    
    return false;
  },
  
  /**
   * Unlock milestone achievement via existing achievement system
   * Wrapper for unlockAchievement() with existence checks and fallback behavior
   * 
   * @param {object} achievement - Achievement object with id, name, description, icon, xpBonus
   * @returns {boolean} True if achievement was unlocked successfully, false if fallback used
   * Requirements: 6.4, 11.2
   */
  unlockMilestoneAchievement: function(achievement) {
    // Validate input
    if (!achievement || typeof achievement !== 'object') {
      console.error('Invalid achievement object provided to unlockMilestoneAchievement:', achievement);
      return false;
    }
    
    // Validate required achievement fields
    if (!achievement.id || !achievement.name) {
      console.error('Achievement missing required fields (id, name):', achievement);
      return false;
    }
    
    // Check if unlockAchievement function exists and is callable
    if (typeof window.unlockAchievement === 'function') {
      try {
        window.unlockAchievement(achievement);
        console.log(`✓ Unlocked achievement via unlockAchievement: ${achievement.name}`);
        return true;
      } catch (error) {
        console.error('Error calling unlockAchievement:', error);
        // Fall through to fallback behavior
      }
    }
    
    // Fallback behavior: Store pending achievements for later unlock
    console.warn(`⚠ unlockAchievement function not available, storing achievement: ${achievement.name}`);
    
    if (!window.pendingCheckInAchievements) {
      window.pendingCheckInAchievements = [];
    }
    
    // Avoid duplicates
    const alreadyPending = window.pendingCheckInAchievements.some(a => a.id === achievement.id);
    if (!alreadyPending) {
      window.pendingCheckInAchievements.push(achievement);
      console.log(`Pending check-in achievements: ${window.pendingCheckInAchievements.length}`);
    }
    
    return false;
  },
  
  /**
   * Show check-in success notification
   * Wrapper for showAchievementToast() with existence checks and fallback behavior
   * 
   * @param {number} xpEarned - XP earned from check-in
   * @param {number} newStreak - New streak count
   * @param {boolean} isMilestone - Whether this is a milestone
   * @param {object|null} milestoneAchievement - Milestone achievement data
   * @returns {boolean} True if notification was shown successfully, false if fallback used
   * Requirements: 8.1, 8.4, 11.3
   */
  showCheckInNotification: function(xpEarned, newStreak, isMilestone, milestoneAchievement) {
    // Validate inputs
    if (typeof xpEarned !== 'number' || xpEarned < 0) {
      console.error('Invalid xpEarned provided to showCheckInNotification:', xpEarned);
      return false;
    }
    
    if (typeof newStreak !== 'number' || newStreak < 1) {
      console.error('Invalid newStreak provided to showCheckInNotification:', newStreak);
      return false;
    }
    
    // Build notification message
    let message = '';
    let notificationType = 'info';
    
    if (isMilestone && milestoneAchievement) {
      message = `🎉 ${milestoneAchievement.name}! +${xpEarned} XP (${newStreak} day streak!)`;
      notificationType = 'success';
    } else {
      message = `✅ Check-in complete! +${xpEarned} XP (${newStreak} day streak)`;
      notificationType = 'info';
    }
    
    // Check if showAchievementToast function exists and is callable
    if (typeof window.showAchievementToast === 'function') {
      try {
        window.showAchievementToast(message, notificationType);
        console.log(`✓ Notification shown via showAchievementToast: ${message}`);
        
        // Trigger confetti for milestones if available
        if (isMilestone && typeof window.triggerConfetti === 'function') {
          try {
            window.triggerConfetti();
            console.log('✓ Confetti triggered for milestone');
          } catch (error) {
            console.warn('Error triggering confetti:', error);
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error calling showAchievementToast:', error);
        // Fall through to fallback behavior
      }
    }
    
    // Fallback behavior: Console log notification
    console.warn('⚠ showAchievementToast function not available, using console fallback');
    console.log(`📢 CHECK-IN NOTIFICATION: ${message}`);
    
    // Store notification for potential later display
    if (!window.pendingCheckInNotifications) {
      window.pendingCheckInNotifications = [];
    }
    window.pendingCheckInNotifications.push({
      message: message,
      type: notificationType,
      timestamp: new Date().toISOString(),
      xpEarned: xpEarned,
      streak: newStreak,
      isMilestone: isMilestone
    });
    
    return false;
  },
  
  /**
   * Show freeze used notification
   * Requirements: 5.3, 8.3
   */
  showFreezeUsedNotification: function() {
    if (typeof window.showAchievementToast === 'function') {
      window.showAchievementToast('❄️ Streak Freeze used! Your streak is protected.', 'warning');
    } else {
      console.log('Streak Freeze used to protect streak');
    }
  },
  
  /**
   * Show already checked in message
   * Requirements: 1.1
   */
  showAlreadyCheckedInMessage: function() {
    if (typeof window.showAchievementToast === 'function') {
      window.showAchievementToast('You\'ve already checked in today! Come back tomorrow.', 'info');
    } else {
      console.log('Already checked in today');
    }
  },
  
  /**
   * Process pending integrations when external functions become available
   * This function can be called after external systems are loaded to process
   * any pending XP awards, achievements, or notifications
   * 
   * @returns {object} Summary of processed pending items
   * Requirements: 11.1, 11.2, 11.3
   */
  processPendingIntegrations: function() {
    const summary = {
      xpAwarded: 0,
      achievementsUnlocked: 0,
      notificationsShown: 0
    };
    
    // Process pending XP
    if (window.pendingCheckInXP && window.pendingCheckInXP > 0) {
      if (typeof window.addScore === 'function') {
        try {
          window.addScore(window.pendingCheckInXP);
          console.log(`✓ Processed pending XP: ${window.pendingCheckInXP}`);
          summary.xpAwarded = window.pendingCheckInXP;
          window.pendingCheckInXP = 0;
        } catch (error) {
          console.error('Error processing pending XP:', error);
        }
      }
    }
    
    // Process pending achievements
    if (window.pendingCheckInAchievements && window.pendingCheckInAchievements.length > 0) {
      if (typeof window.unlockAchievement === 'function') {
        const achievements = [...window.pendingCheckInAchievements];
        window.pendingCheckInAchievements = [];
        
        achievements.forEach(achievement => {
          try {
            window.unlockAchievement(achievement);
            console.log(`✓ Processed pending achievement: ${achievement.name}`);
            summary.achievementsUnlocked++;
          } catch (error) {
            console.error('Error processing pending achievement:', error);
            // Re-add to pending if failed
            window.pendingCheckInAchievements.push(achievement);
          }
        });
      }
    }
    
    // Process pending notifications
    if (window.pendingCheckInNotifications && window.pendingCheckInNotifications.length > 0) {
      if (typeof window.showAchievementToast === 'function') {
        const notifications = [...window.pendingCheckInNotifications];
        window.pendingCheckInNotifications = [];
        
        notifications.forEach(notification => {
          try {
            window.showAchievementToast(notification.message, notification.type);
            console.log(`✓ Processed pending notification: ${notification.message}`);
            summary.notificationsShown++;
          } catch (error) {
            console.error('Error processing pending notification:', error);
          }
        });
      }
    }
    
    // Log summary if anything was processed
    if (summary.xpAwarded > 0 || summary.achievementsUnlocked > 0 || summary.notificationsShown > 0) {
      console.log('Pending integrations processed:', summary);
    }
    
    return summary;
  }
};

// ============================================================================
// GLOBAL API EXPOSURE
// ============================================================================

/**
 * Expose necessary functions to window object for cross-module access
 * Requirements: 11.6
 */
window.CheckInManager = CheckInManager;
window.StreakCalculator = StreakCalculator;
window.RewardCalculator = RewardCalculator;
window.FreezeManager = FreezeManager;
window.CalendarRenderer = CalendarRenderer;
window.UIController = UIController;
window.ReminderSystem = ReminderSystem;
window.MILESTONE_ACHIEVEMENTS = MILESTONE_ACHIEVEMENTS;
window.getDefaultCheckInState = getDefaultCheckInState;

// Expose data persistence functions
window.saveCheckInState = saveCheckInState;
window.loadCheckInState = loadCheckInState;

// Expose validation helper functions
window.validateDateString = validateDateString;
window.validateCheckInHistory = validateCheckInHistory;
window.validateMilestones = validateMilestones;

// Expose date utility functions
window.getTodayString = getTodayString;
window.parseDate = parseDate;
window.isSameDay = isSameDay;
window.getDaysBetween = getDaysBetween;
window.isNextDay = isNextDay;

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

/**
 * Auto-initialize when DOM is ready (browser environment only)
 */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      CheckInManager.init();
    });
  } else {
    // DOM already loaded
    CheckInManager.init();
  }
} else {
  // Node.js environment - initialize without DOM
  CheckInManager.init();
}
