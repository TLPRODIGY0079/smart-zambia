# Design Document: Daily Challenges System

## Overview

The Daily Challenges System is a gamification feature that provides users with engaging, time-limited tasks that encourage platform exploration and interaction. The system offers rotating daily challenges across five categories (Exploration, Social, Learning, Civic, Creative), tracks completion progress, awards XP and bonuses, and integrates with existing platform systems.

### Key Design Goals

1. **Engagement**: Daily fresh content that encourages return visits
2. **Variety**: Diverse challenge types across multiple categories
3. **Progression**: Difficulty scaling based on user level
4. **Rewards**: Meaningful XP and bonus rewards for completion
5. **Streaks**: Additional motivation through consecutive completion bonuses
6. **Integration**: Seamless integration with existing systems (XP, achievements, leaderboard)

### Technical Approach

The system will be implemented as a modular JavaScript file (`daily-challenges.js`) that follows existing codebase patterns:
- Global state management via `window.state`
- localStorage for client-side persistence
- Backend API for data synchronization
- Integration with existing `addScore()` and notification systems
- Responsive design using Tailwind CSS
- Smooth animations using CSS transitions

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Challenge   │  │   Progress   │  │   Timer      │      │
│  │   Card       │  │   Tracker    │  │   Display    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Challenge Manager                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • assignDailyChallenge()                            │   │
│  │  • trackProgress()                                   │   │
│  │  • completeChallenge()                               │   │
│  │  • calculateRewards()                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Challenge   │  │  Progress    │  │  Streak      │      │
│  │  Pool        │  │  Tracker     │  │  Manager     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Integration Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  XP System   │  │ Leaderboard  │  │  Storage     │      │
│  │  (addScore)  │  │  System      │  │ (localStorage)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Challenge Assignment**: System checks if new challenge needed (daily reset)
2. **Challenge Selection**: Algorithm selects appropriate challenge from pool
3. **Progress Tracking**: System monitors user actions and updates progress
4. **Completion Check**: System validates completion criteria
5. **Reward Calculation**: System calculates XP with streak bonuses
6. **State Update**: System updates window.state and localStorage
7. **Backend Sync**: System syncs data to backend database
8. **Integration**: System calls addScore() and updates leaderboard
9. **UI Update**: System updates UI elements and shows notifications
10. **Animation**: System triggers celebration effects

## Components and Interfaces

### 1. ChallengeManager

The main controller for challenge operations.

```javascript
const ChallengeManager = {
  // Initialize the challenge system
  init: function() {
    // Load challenge data from storage
    // Check if new challenge needed
    // Set up event listeners
    // Start timer updates
  },
  
  // Assign a new daily challenge
  assignDailyChallenge: function() {
    // Check user level
    // Select appropriate challenge from pool
    // Assign to user
    // Update state and storage
    // Show notification
  },
  
  // Track progress on current challenge
  trackProgress: function(action, data) {
    // Validate action matches challenge type
    // Update progress percentage
    // Check if completed
    // Update UI
  },
  
  // Complete a challenge
  completeChallenge: function() {
    // Validate completion
    // Calculate rewards with bonuses
    // Award XP
    // Update streak
    // Unlock bonus challenge
    // Show celebration
  },
  
  // Get current challenge status
  getChallengeStatus: function() {
    // Returns object with challenge data
  }
}
```

### 2. ChallengePool

Manages the collection of available challenges.

```javascript
const ChallengePool = {
  // Get all challenges
  getAllChallenges: function() {
    // Returns array of challenge objects
  },
  
  // Get challenges by category
  getChallengesByCategory: function(category) {
    // Returns filtered array
  },
  
  // Get challenges by difficulty
  getChallengesByDifficulty: function(difficulty) {
    // Returns filtered array
  },
  
  // Select random challenge
  selectChallenge: function(userLevel, recentChallenges) {
    // Filter by level appropriateness
    // Exclude recent challenges
    // Rotate categories
    // Return selected challenge
  },
  
  // Add new challenge (admin)
  addChallenge: function(challengeData) {
    // Validate data
    // Add to pool
    // Save to backend
  }
}
```

### 3. ProgressTracker

Tracks user progress on challenges.

```javascript
const ProgressTracker = {
  // Update progress
  updateProgress: function(challengeId, progress) {
    // Validate progress value (0-100)
    // Update state
    // Save to storage
    // Trigger UI update
  },
  
  // Get current progress
  getProgress: function(challengeId) {
    // Returns progress percentage
  },
  
  // Check if challenge completed
  isCompleted: function(challengeId) {
    // Returns boolean
  },
  
  // Reset progress
  resetProgress: function(challengeId) {
    // Clear progress data
  },
  
  // Track specific action
  trackAction: function(actionType, actionData) {
    // Match action to active challenge
    // Update progress accordingly
  }
}
```

### 4. StreakManager

Manages challenge completion streaks.

```javascript
const StreakManager = {
  // Get current streak
  getCurrentStreak: function() {
    // Returns streak count
  },
  
  // Update streak on completion
  updateStreak: function() {
    // Check if consecutive day
    // Increment or reset streak
    // Update state
  },
  
  // Calculate streak bonus
  getStreakBonus: function(baseXP) {
    // 3 days: +10%
    // 7 days: +25%
    // 30 days: +50%
    // Returns bonus XP amount
  },
  
  // Check streak status
  checkStreak: function() {
    // Verify last completion date
    // Reset if broken
  }
}
```

### 5. RewardCalculator

Calculates XP rewards for challenges.

```javascript
const RewardCalculator = {
  // Calculate base reward by difficulty
  calculateBaseReward: function(difficulty) {
    // Easy: 50-100 XP
    // Medium: 100-200 XP
    // Hard: 200-400 XP
    // Expert: 400-800 XP
  },
  
  // Calculate total reward with bonuses
  calculateTotalReward: function(baseXP, streak, bonusMultiplier) {
    // Apply streak bonus
    // Apply any special multipliers
    // Return total XP
  },
  
  // Get bonus challenge reward
  getBonusChallengeReward: function(dailyReward) {
    // Returns 50% of daily challenge XP
  }
}
```

### 6. ChallengeTimer

Manages challenge expiration timing.

```javascript
const ChallengeTimer = {
  // Get time remaining until midnight
  getTimeRemaining: function() {
    // Calculate hours, minutes, seconds
    // Returns object with time components
  },
  
  // Format time for display
  formatTime: function(hours, minutes, seconds) {
    // Returns formatted string "HH:MM:SS"
  },
  
  // Check if challenge expired
  isExpired: function(assignedDate) {
    // Compare with current date
    // Returns boolean
  },
  
  // Start timer updates
  startTimer: function(callback) {
    // Update every minute
    // Call callback with remaining time
  },
  
  // Check if urgent (< 2 hours)
  isUrgent: function() {
    // Returns boolean
  }
}
```

### 7. UIController

Manages UI updates and animations.

```javascript
const UIController = {
  // Display challenge card
  displayChallenge: function(challenge) {
    // Render challenge card
    // Show category icon and color
    // Display progress bar
    // Show timer
  },
  
  // Update progress bar
  updateProgressBar: function(progress) {
    // Animate progress bar
    // Update percentage text
  },
  
  // Show completion celebration
  showCompletionCelebration: function(xpEarned, streak) {
    // Trigger confetti
    // Show reward notification
    // Display streak bonus
  },
  
  // Update timer display
  updateTimerDisplay: function(timeRemaining) {
    // Update countdown
    // Add urgent styling if needed
  },
  
  // Show challenge history
  showHistory: function(completedChallenges) {
    // Render history list
    // Show statistics
  },
  
  // Display bonus challenge
  displayBonusChallenge: function(challenge) {
    // Show with special styling
    // Add "BONUS" indicator
  }
}
```

## Data Models

### ChallengeState

Stored in `window.state.challenges` and persisted to localStorage.

```javascript
{
  // Current active challenge
  activeChallenge: {
    id: 'explore_3_destinations',
    category: 'exploration',
    difficulty: 'medium',
    title: 'Explore 3 New Destinations',
    description: 'Visit and view details of 3 destinations you haven\'t seen before',
    progress: 66,                    // 0-100
    target: 3,
    current: 2,
    xpReward: 150,
    assignedDate: '2024-12-20',
    expiresAt: '2024-12-21T00:00:00Z'
  },
  
  // Bonus challenge (if unlocked)
  bonusChallenge: null,              // Same structure as activeChallenge
  
  // Challenge streak
  challengeStreak: 5,                // Consecutive days
  longestStreak: 12,
  lastCompletionDate: '2024-12-19',
  
  // Completion history
  completedChallenges: [
    {
      id: 'write_2_reviews',
      category: 'social',
      completedDate: '2024-12-19',
      xpEarned: 120,
      streakBonus: 12
    }
  ],
  
  // Statistics
  totalCompleted: 45,
  totalXPEarned: 6750,
  completionByCategory: {
    exploration: 12,
    social: 8,
    learning: 10,
    civic: 7,
    creative: 8
  },
  
  // Recent challenge IDs (for rotation)
  recentChallenges: ['explore_3_destinations', 'write_2_reviews', 'complete_trivia']
}
```

### Challenge Object

Structure for individual challenges in the pool.

```javascript
{
  id: 'explore_3_destinations',
  category: 'exploration',           // exploration, social, learning, civic, creative
  difficulty: 'medium',              // easy, medium, hard, expert
  title: 'Explore 3 New Destinations',
  description: 'Visit and view details of 3 destinations you haven\'t seen before',
  icon: 'fa-map-marked-alt',
  color: '#10B981',                  // Category color
  
  // Completion criteria
  type: 'counter',                   // counter, boolean, collection
  target: 3,
  trackingKey: 'destinations_viewed',
  
  // Rewards
  xpReward: 150,
  bonusReward: null,                 // Optional special reward
  
  // Requirements
  minLevel: 1,
  maxLevel: null,
  prerequisites: [],                 // Other challenge IDs that must be completed first
  
  // Metadata
  createdBy: 'system',
  createdAt: '2024-01-01',
  isActive: true
}
```

### Challenge Categories

Predefined categories with styling.

```javascript
const CHALLENGE_CATEGORIES = {
  exploration: {
    name: 'Exploration',
    icon: 'fa-map-marked-alt',
    color: '#10B981',                // Green
    description: 'Discover new destinations and hidden gems'
  },
  social: {
    name: 'Social',
    icon: 'fa-users',
    color: '#3B82F6',                // Blue
    description: 'Connect with other travelers and share experiences'
  },
  learning: {
    name: 'Learning',
    icon: 'fa-graduation-cap',
    color: '#8B5CF6',                // Purple
    description: 'Learn about Zambian culture, history, and traditions'
  },
  civic: {
    name: 'Civic',
    icon: 'fa-hands-helping',
    color: '#F59E0B',                // Orange
    description: 'Contribute to your community and help improve the platform'
  },
  creative: {
    name: 'Creative',
    icon: 'fa-palette',
    color: '#EC4899',                // Pink
    description: 'Express yourself through photos, stories, and itineraries'
  }
}
```

### Challenge Pool Examples

Sample challenges for each category.

```javascript
const CHALLENGE_POOL = [
  // EXPLORATION CHALLENGES
  {
    id: 'explore_3_destinations',
    category: 'exploration',
    difficulty: 'easy',
    title: 'Explore 3 New Destinations',
    description: 'Visit and view details of 3 destinations you haven\'t seen before',
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
    type: 'boolean',
    trackingKey: 'waterfall_visited',
    xpReward: 150,
    minLevel: 3
  },
  {
    id: 'explore_all_regions',
    category: 'exploration',
    difficulty: 'hard',
    title: 'Regional Explorer',
    description: 'Visit at least one destination in 5 different regions',
    type: 'collection',
    target: 5,
    trackingKey: 'regions_explored',
    xpReward: 300,
    minLevel: 5
  },
  
  // SOCIAL CHALLENGES
  {
    id: 'write_2_reviews',
    category: 'social',
    difficulty: 'easy',
    title: 'Share Your Thoughts',
    description: 'Write reviews for 2 destinations',
    type: 'counter',
    target: 2,
    trackingKey: 'reviews_written',
    xpReward: 100,
    minLevel: 1
  },
  {
    id: 'add_3_friends',
    category: 'social',
    difficulty: 'medium',
    title: 'Make New Friends',
    description: 'Add 3 new friends to your network',
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
    type: 'counter',
    target: 5,
    trackingKey: 'destinations_shared',
    xpReward: 175,
    minLevel: 3
  },
  
  // LEARNING CHALLENGES
  {
    id: 'complete_trivia',
    category: 'learning',
    difficulty: 'easy',
    title: 'Trivia Master',
    description: 'Complete a Zambia trivia quiz with 80% or higher',
    type: 'boolean',
    trackingKey: 'trivia_completed',
    xpReward: 100,
    minLevel: 1
  },
  {
    id: 'read_5_guides',
    category: 'learning',
    difficulty: 'medium',
    title: 'Knowledge Seeker',
    description: 'Read destination guides for 5 different places',
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
    type: 'boolean',
    trackingKey: 'culture_modules_completed',
    xpReward: 350,
    minLevel: 5
  },
  
  // CIVIC CHALLENGES
  {
    id: 'submit_2_reports',
    category: 'civic',
    difficulty: 'easy',
    title: 'Community Helper',
    description: 'Submit 2 civic duty reports',
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
    type: 'boolean',
    trackingKey: 'feedback_submitted',
    xpReward: 150,
    minLevel: 2
  },
  
  // CREATIVE CHALLENGES
  {
    id: 'upload_3_photos',
    category: 'creative',
    difficulty: 'easy',
    title: 'Photographer',
    description: 'Upload 3 photos to destination galleries',
    type: 'counter',
    target: 3,
    trackingKey: 'photos_uploaded',
    xpReward: 100,
    minLevel: 1
  },
  {
    id: 'create_itinerary',
    category: 'creative',
    difficulty: 'medium',
    title: 'Trip Planner',
    description: 'Create a complete trip itinerary with at least 5 destinations',
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
    type: 'boolean',
    trackingKey: 'story_written',
    xpReward: 300,
    minLevel: 5
  }
]
```

## Algorithms

### Challenge Selection Algorithm

```javascript
function selectDailyChallenge(userLevel, recentChallenges, completionByCategory) {
  // Step 1: Filter by level appropriateness
  let eligibleChallenges = CHALLENGE_POOL.filter(challenge => {
    if (challenge.minLevel > userLevel) return false;
    if (challenge.maxLevel && challenge.maxLevel < userLevel) return false;
    return true;
  });
  
  // Step 2: Exclude recent challenges (last 14 days)
  eligibleChallenges = eligibleChallenges.filter(challenge => {
    return !recentChallenges.includes(challenge.id);
  });
  
  // Step 3: Determine target category (rotate through categories)
  const categories = Object.keys(CHALLENGE_CATEGORIES);
  const leastCompletedCategory = categories.reduce((min, cat) => {
    return (completionByCategory[cat] || 0) < (completionByCategory[min] || 0) ? cat : min;
  });
  
  // Step 4: Prefer challenges from least completed category
  let categoryChallenge = eligibleChallenges.filter(c => c.category === leastCompletedCategory);
  if (categoryChallenge.length === 0) {
    categoryChallenge = eligibleChallenges;
  }
  
  // Step 5: Select random challenge from filtered list
  const selectedChallenge = categoryChallenge[Math.floor(Math.random() * categoryChallenge.length)];
  
  return selectedChallenge;
}
```

### Progress Tracking Algorithm

```javascript
function trackChallengeProgress(action, data) {
  const activeChallenge = window.state.challenges.activeChallenge;
  if (!activeChallenge) return;
  
  // Check if action matches challenge tracking key
  if (action !== activeChallenge.trackingKey) return;
  
  // Update progress based on challenge type
  switch (activeChallenge.type) {
    case 'counter':
      activeChallenge.current = Math.min(activeChallenge.current + 1, activeChallenge.target);
      activeChallenge.progress = (activeChallenge.current / activeChallenge.target) * 100;
      break;
      
    case 'boolean':
      activeChallenge.current = 1;
      activeChallenge.progress = 100;
      break;
      
    case 'collection':
      // data should be an array of unique items
      activeChallenge.current = data.length;
      activeChallenge.progress = (activeChallenge.current / activeChallenge.target) * 100;
      break;
  }
  
  // Check if completed
  if (activeChallenge.progress >= 100) {
    completeChallenge();
  } else {
    // Save progress
    saveChallengeState();
    updateUI();
  }
}
```

### Reward Calculation Algorithm

```javascript
function calculateChallengeReward(challenge, streak) {
  // Base reward from challenge
  let totalXP = challenge.xpReward;
  
  // Apply streak bonus
  let streakBonus = 0;
  if (streak >= 30) {
    streakBonus = Math.floor(totalXP * 0.5);  // 50% bonus
  } else if (streak >= 7) {
    streakBonus = Math.floor(totalXP * 0.25); // 25% bonus
  } else if (streak >= 3) {
    streakBonus = Math.floor(totalXP * 0.1);  // 10% bonus
  }
  
  totalXP += streakBonus;
  
  return {
    baseXP: challenge.xpReward,
    streakBonus: streakBonus,
    totalXP: totalXP
  };
}
```

## Integration Points

### XP System Integration

```javascript
function awardChallengeXP(xpAmount) {
  if (typeof window.addScore === 'function') {
    window.addScore(xpAmount);
  } else {
    console.warn('addScore function not available');
  }
}
```

### Leaderboard Integration

```javascript
function updateLeaderboard(challengeCompleted) {
  if (typeof window.updateLeaderboard === 'function') {
    window.updateLeaderboard({
      type: 'challenge_completed',
      challengeId: challengeCompleted.id,
      xpEarned: challengeCompleted.xpEarned
    });
  }
}
```

### Achievement Integration

```javascript
function checkChallengeAchievements(completionByCategory, totalCompleted) {
  // Well-Rounded Explorer: Complete challenges in all categories
  if (Object.values(completionByCategory).every(count => count > 0)) {
    unlockAchievement('well_rounded_explorer');
  }
  
  // Challenge Master: Complete 100 challenges
  if (totalCompleted >= 100) {
    unlockAchievement('challenge_master');
  }
  
  // Streak Legend: Maintain 30-day challenge streak
  if (window.state.challenges.challengeStreak >= 30) {
    unlockAchievement('streak_legend');
  }
}
```

## Error Handling

### Challenge Assignment Failure

```javascript
function handleAssignmentError(error) {
  console.error('Challenge assignment failed:', error);
  
  // Fallback: Assign a default easy challenge
  const fallbackChallenge = CHALLENGE_POOL.find(c => c.difficulty === 'easy');
  if (fallbackChallenge) {
    assignChallenge(fallbackChallenge);
  } else {
    // Show error to user
    showNotification('Unable to assign challenge. Please try again later.', 'error');
  }
}
```

### Progress Tracking Failure

```javascript
function handleProgressError(error) {
  console.error('Progress tracking failed:', error);
  
  // Save current state to prevent data loss
  try {
    saveChallengeState();
  } catch (saveError) {
    console.error('Failed to save challenge state:', saveError);
  }
  
  // Continue operation without blocking user
}
```

### Timer Synchronization

```javascript
function handleTimerSync() {
  // Check if challenge expired while offline
  const activeChallenge = window.state.challenges.activeChallenge;
  if (activeChallenge && ChallengeTimer.isExpired(activeChallenge.assignedDate)) {
    // Mark as failed
    failChallenge(activeChallenge);
    // Assign new challenge
    assignDailyChallenge();
  }
}
```

## Testing Strategy

### Unit Tests

```javascript
describe('ChallengeManager', () => {
  test('should assign appropriate challenge based on user level', () => {
    const challenge = ChallengeManager.assignDailyChallenge(userLevel: 3);
    expect(challenge.minLevel).toBeLessThanOrEqual(3);
  });
  
  test('should not assign recent challenges', () => {
    const recentChallenges = ['explore_3_destinations', 'write_2_reviews'];
    const challenge = ChallengeManager.assignDailyChallenge(userLevel: 5, recentChallenges);
    expect(recentChallenges).not.toContain(challenge.id);
  });
  
  test('should calculate correct streak bonus', () => {
    const reward = RewardCalculator.calculateTotalReward(100, 7);
    expect(reward.streakBonus).toBe(25); // 25% of 100
    expect(reward.totalXP).toBe(125);
  });
});
```

### Integration Tests

```javascript
describe('Challenge Integration', () => {
  test('should award XP on challenge completion', () => {
    const mockAddScore = jest.fn();
    window.addScore = mockAddScore;
    
    ChallengeManager.completeChallenge();
    
    expect(mockAddScore).toHaveBeenCalledWith(expect.any(Number));
  });
  
  test('should update leaderboard on completion', () => {
    const mockUpdateLeaderboard = jest.fn();
    window.updateLeaderboard = mockUpdateLeaderboard;
    
    ChallengeManager.completeChallenge();
    
    expect(mockUpdateLeaderboard).toHaveBeenCalled();
  });
});
```

## Performance Considerations

1. **Timer Updates**: Update timer display every minute (not every second) to reduce CPU usage
2. **Progress Tracking**: Debounce rapid progress updates to prevent excessive saves
3. **Challenge Pool**: Load challenge pool once on init, cache in memory
4. **Animations**: Use CSS transforms and opacity for smooth 60fps animations
5. **Storage**: Batch localStorage writes to minimize I/O operations

## Mobile Optimization

1. **Touch Targets**: All interactive elements minimum 44x44 pixels
2. **Responsive Layout**: Stack challenge cards vertically on mobile
3. **Reduced Animations**: Simplify animations on low-end devices
4. **Offline Support**: Cache challenge data for offline access
5. **Performance**: Optimize for 3G network speeds

## Future Enhancements

1. **Weekly Challenges**: Longer-term challenges with bigger rewards
2. **Team Challenges**: Collaborative challenges with friends
3. **Seasonal Events**: Special limited-time challenges
4. **Challenge Marketplace**: User-created challenges
5. **Challenge Chains**: Multi-step challenge sequences
6. **Live Challenges**: Real-time competitive challenges
