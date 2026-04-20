# Design Document: Daily Check-In System

## Overview

The Daily Check-In System is a gamification feature that encourages daily user engagement through streak tracking, progressive rewards, and visual feedback. The system integrates seamlessly with Smart Zambia's existing XP/level system, localStorage persistence, and achievement framework.

### Key Design Goals

1. **Simplicity**: One-click check-in with immediate feedback
2. **Motivation**: Progressive rewards that increase with streak length
3. **Forgiveness**: Streak freeze mechanic to prevent frustration from single missed days
4. **Visual Appeal**: Calendar visualization and celebration animations
5. **Integration**: Seamless integration with existing systems (XP, achievements, storage)
6. **Performance**: Lightweight calculations with minimal DOM manipulation

### Technical Approach

The system will be implemented as a modular JavaScript file (`check-in.js`) that follows the existing codebase patterns:
- Global state management via `window.state`
- localStorage for persistence
- Integration with existing `addScore()` and `showAchievementToast()` functions
- Responsive design using Tailwind CSS
- Smooth animations using CSS transitions

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Check-In    │  │   Calendar   │  │  Streak      │      │
│  │   Button     │  │   Display    │  │  Display     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Check-In Manager                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • validateCheckIn()                                  │   │
│  │  • processCheckIn()                                   │   │
│  │  • calculateStreak()                                  │   │
│  │  │  calculateReward()                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Streak      │  │  Check-In    │  │  Freeze      │      │
│  │  Calculator  │  │  History     │  │  Manager     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Integration Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  XP System   │  │ Achievement  │  │  Storage     │      │
│  │  (addScore)  │  │  System      │  │ (localStorage)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Check-In Request**: User clicks check-in button
2. **Validation**: System validates if check-in is allowed (not already done today)
3. **Streak Calculation**: System calculates new streak based on last check-in date
4. **Freeze Check**: System checks if streak freeze should be applied/consumed
5. **Reward Calculation**: System calculates XP reward based on streak length
6. **State Update**: System updates window.state with new data
7. **Persistence**: System saves to localStorage
8. **Integration**: System calls addScore() and achievement functions
9. **UI Update**: System updates UI elements and shows notifications
10. **Animation**: System triggers celebration effects for milestones

## Components and Interfaces

### 1. CheckInManager

The main controller for check-in operations.

```javascript
const CheckInManager = {
  // Initialize the check-in system
  init: function() {
    // Load check-in data from storage
    // Set up UI event listeners
    // Check if check-in is available today
    // Update UI state
  },
  
  // Process a check-in request
  processCheckIn: function() {
    // Validate check-in is allowed
    // Calculate new streak
    // Handle streak freeze if needed
    // Calculate and award rewards
    // Update state and storage
    // Trigger UI updates and notifications
    // Check for milestone achievements
  },
  
  // Validate if check-in is allowed
  canCheckInToday: function() {
    // Returns boolean: true if no check-in today, false otherwise
  },
  
  // Get check-in status for today
  getCheckInStatus: function() {
    // Returns object: { checkedIn: boolean, streak: number, freezeAvailable: boolean }
  }
}
```

### 2. StreakCalculator

Handles streak calculation logic.

```javascript
const StreakCalculator = {
  // Calculate current streak based on check-in history
  calculateStreak: function(checkInHistory, lastCheckInDate) {
    // Parse dates
    // Compare last check-in with today
    // Determine if streak continues, breaks, or needs freeze
    // Return new streak value
  },
  
  // Check if dates are consecutive days
  areConsecutiveDays: function(date1, date2) {
    // Returns boolean
  },
  
  // Get days between two dates
  getDaysBetween: function(date1, date2) {
    // Returns integer
  },
  
  // Check if a date is today
  isToday: function(date) {
    // Returns boolean
  },
  
  // Check if a date is yesterday
  isYesterday: function(date) {
    // Returns boolean
  }
}
```

### 3. RewardCalculator

Calculates XP rewards based on streak length.

```javascript
const RewardCalculator = {
  // Calculate daily reward based on streak
  calculateDailyReward: function(streakDay) {
    // Base reward: 10 XP
    // Progressive formula: 10 + (streakDay * 2)
    // Milestone bonuses at days 7, 30, 100
    // Returns integer XP amount
  },
  
  // Get milestone bonus if applicable
  getMilestoneBonus: function(streakDay) {
    // Day 7: +50 XP
    // Day 30: +200 XP
    // Day 100: +1000 XP
    // Returns integer or 0
  },
  
  // Check if day is a milestone
  isMilestone: function(streakDay) {
    // Returns boolean
  },
  
  // Get milestone achievement data
  getMilestoneAchievement: function(streakDay) {
    // Returns achievement object or null
  }
}
```

### 4. FreezeManager

Manages streak freeze mechanics.

```javascript
const FreezeManager = {
  // Check if freeze is available
  isFreezeAvailable: function() {
    // Returns boolean
  },
  
  // Consume a freeze to protect streak
  consumeFreeze: function() {
    // Update state
    // Return success boolean
  },
  
  // Restore freeze after successful check-in
  restoreFreeze: function() {
    // Update state
  },
  
  // Check if freeze should be applied
  shouldApplyFreeze: function(daysSinceLastCheckIn) {
    // Returns boolean: true if 1 day missed and freeze available
  }
}
```

### 5. CalendarRenderer

Renders the check-in calendar UI.

```javascript
const CalendarRenderer = {
  // Render calendar for a specific month
  renderMonth: function(year, month, checkInHistory) {
    // Generate calendar grid
    // Mark checked-in days
    // Highlight current day
    // Return HTML string
  },
  
  // Get days in month
  getDaysInMonth: function(year, month) {
    // Returns integer
  },
  
  // Get first day of month (0-6, Sun-Sat)
  getFirstDayOfMonth: function(year, month) {
    // Returns integer
  },
  
  // Check if date has check-in
  hasCheckIn: function(date, checkInHistory) {
    // Returns boolean
  },
  
  // Navigate to previous/next month
  navigateMonth: function(direction) {
    // Update displayed month
    // Re-render calendar
  }
}
```

### 6. UIController

Manages UI updates and animations.

```javascript
const UIController = {
  // Update check-in button state
  updateCheckInButton: function(canCheckIn) {
    // Enable/disable button
    // Update button text and styling
  },
  
  // Update streak display
  updateStreakDisplay: function(streak) {
    // Update streak counter
    // Animate counter change
  },
  
  // Show check-in success notification
  showCheckInSuccess: function(xpEarned, newStreak) {
    // Display toast notification
    // Show XP earned
    // Update streak display
  },
  
  // Show milestone celebration
  showMilestoneCelebration: function(milestone, achievement) {
    // Trigger confetti animation
    // Display special achievement toast
    // Play celebration sound (optional)
  },
  
  // Show freeze notification
  showFreezeNotification: function(freezeUsed) {
    // Display freeze status message
  },
  
  // Update calendar display
  updateCalendar: function() {
    // Re-render calendar with latest data
  },
  
  // Animate counter
  animateCounter: function(element, targetValue, duration) {
    // Smooth number animation
  }
}
```

## Data Models

### CheckInState

Stored in `window.state.checkIn` and persisted to localStorage.

```javascript
{
  // Current streak count
  currentStreak: 0,              // Integer, 0 or positive
  
  // Longest streak achieved
  longestStreak: 0,              // Integer, 0 or positive
  
  // Last check-in date (ISO 8601 string)
  lastCheckInDate: null,         // String or null, format: "YYYY-MM-DD"
  
  // Complete check-in history (array of ISO 8601 date strings)
  checkInHistory: [],            // Array of strings, format: ["YYYY-MM-DD", ...]
  
  // Streak freeze status
  freezeAvailable: true,         // Boolean
  
  // Total check-ins count
  totalCheckIns: 0,              // Integer, 0 or positive
  
  // Milestones achieved
  milestonesAchieved: [],        // Array of integers, e.g., [7, 30]
  
  // Total XP earned from check-ins
  totalCheckInXP: 0              // Integer, 0 or positive
}
```

### Milestone Achievements

Predefined achievement data for streak milestones.

```javascript
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
}
```

### Reward Formula

Progressive reward calculation:

```javascript
// Base daily reward
const BASE_REWARD = 10;

// Progressive multiplier (increases with streak)
function calculateDailyReward(streakDay) {
  // Formula: 10 + (streakDay * 2)
  // Day 1: 10 + (1 * 2) = 12 XP
  // Day 7: 10 + (7 * 2) = 24 XP
  // Day 30: 10 + (30 * 2) = 70 XP
  // Day 100: 10 + (100 * 2) = 210 XP
  
  const dailyReward = BASE_REWARD + (streakDay * 2);
  
  // Add milestone bonus if applicable
  const milestoneBonus = getMilestoneBonus(streakDay);
  
  return dailyReward + milestoneBonus;
}

function getMilestoneBonus(streakDay) {
  if (streakDay === 7) return 50;
  if (streakDay === 30) return 200;
  if (streakDay === 100) return 1000;
  return 0;
}
```

### Date Utilities

Helper functions for date manipulation:

```javascript
// Get today's date as YYYY-MM-DD string
function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Parse date string to Date object
function parseDate(dateString) {
  return new Date(dateString + 'T00:00:00');
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
  return date1.toISOString().split('T')[0] === 
         date2.toISOString().split('T')[0];
}

// Get days between two dates
function getDaysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
}

// Check if date2 is the day after date1
function isNextDay(date1, date2) {
  return getDaysBetween(date1, date2) === 1 && date2 > date1;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Check-In Detection Accuracy
*For any* check-in history and current date, the system should correctly identify whether a check-in has already occurred today by checking if today's date exists in the check-in history array.
**Validates: Requirements 1.1**

### Property 2: Check-In Recording
*For any* valid check-in action, after recording the check-in, today's date should appear in the check-in history array.
**Validates: Requirements 1.3**

### Property 3: Data Persistence Round-Trip
*For any* valid check-in state, saving to localStorage then loading from localStorage should produce an equivalent state object with all fields preserved.
**Validates: Requirements 1.5, 9.1, 9.2**

### Property 4: Consecutive Day Streak Increment
*For any* check-in history with consecutive days ending yesterday, adding a check-in for today should increase the streak counter by exactly 1.
**Validates: Requirements 2.1, 2.3**

### Property 5: Streak Reset on Gap
*For any* check-in history where the last check-in is 2 or more days ago and no freeze is available, the streak counter should reset to 0.
**Validates: Requirements 2.2**

### Property 6: New Streak Initialization
*For any* state where the streak is 0 or undefined, the first check-in should set the streak counter to 1.
**Validates: Requirements 2.4**

### Property 7: Streak State Consistency
*For any* check-in state, the streak value in window.state.checkIn.currentStreak should match the streak value in localStorage.
**Validates: Requirements 2.5**

### Property 8: Progressive Reward Formula
*For any* two streak days where day2 > day1, the calculated reward for day2 should be greater than the reward for day1.
**Validates: Requirements 3.7**

### Property 9: Milestone Bonus Addition
*For any* milestone day (7, 30, or 100), the total XP awarded should equal the daily reward plus the milestone bonus.
**Validates: Requirements 3.6**

### Property 10: XP System Integration
*For any* check-in that awards XP, the addScore function should be called with the correct XP amount.
**Validates: Requirements 3.5, 11.1**

### Property 11: Calendar Day Rendering
*For any* date in the check-in history, the calendar should render that date with a distinct visual marker (CSS class or attribute) different from non-checked-in days.
**Validates: Requirements 4.2, 4.3**

### Property 12: Current Day Highlighting
*For any* calendar rendering, today's date should have a unique visual marker that distinguishes it from both checked-in and non-checked-in days.
**Validates: Requirements 4.4**

### Property 13: Historical Calendar Navigation
*For any* previous month with check-in data, navigating to that month should display all check-ins that occurred in that month.
**Validates: Requirements 4.5**

### Property 14: Freeze Availability with Active Streak
*For any* state where currentStreak > 0 and no freeze has been consumed, freezeAvailable should be true.
**Validates: Requirements 5.1**

### Property 15: Freeze Consumption and Streak Protection
*For any* check-in history where the last check-in was exactly 1 day ago and freezeAvailable is true, checking in today should maintain the streak and set freezeAvailable to false.
**Validates: Requirements 5.2**

### Property 16: Freeze Restoration
*For any* state where freezeAvailable is false and a successful check-in occurs, freezeAvailable should be restored to true.
**Validates: Requirements 5.4**

### Property 17: Freeze Limitation on Multi-Day Gaps
*For any* check-in history where the last check-in was 2 or more days ago, the streak should reset to 0 regardless of freezeAvailable status.
**Validates: Requirements 5.5**

### Property 18: Achievement System Integration
*For any* milestone reached (7, 30, or 100 days), the achievement system should be called with the corresponding achievement data.
**Validates: Requirements 6.4, 11.2**

### Property 19: Milestone Celebration Trigger
*For any* milestone day check-in, celebration animation functions should be triggered.
**Validates: Requirements 6.5, 8.5**

### Property 20: Notification System Integration
*For any* check-in completion, the showAchievementToast function should be called with the XP earned.
**Validates: Requirements 8.1, 8.4, 11.3**

### Property 21: Freeze Notification Display
*For any* check-in where a freeze is consumed, a notification should be displayed explaining the streak protection.
**Validates: Requirements 5.3, 8.3**

### Property 22: Data Structure Validation
*For any* data loaded from localStorage, if the data structure is invalid or corrupted, the system should use default values without crashing.
**Validates: Requirements 9.3**

### Property 23: ISO 8601 Date Format
*For any* date stored in check-in history or lastCheckInDate, the date string should match the ISO 8601 format pattern (YYYY-MM-DD).
**Validates: Requirements 9.4**

### Property 24: Check-In History Array Structure
*For any* check-in state, the checkInHistory field should be an array containing only string values.
**Validates: Requirements 9.5**

### Property 25: Touch-Friendly Button Sizing
*For any* interactive button in the check-in interface, the button dimensions should meet or exceed 44x44 pixels for touch accessibility.
**Validates: Requirements 10.4**

### Property 26: Global API Exposure
*For any* initialization of the check-in system, the necessary functions (processCheckIn, getCheckInStatus) should be accessible on the window object.
**Validates: Requirements 11.6**

### Property 27: Check-In Reminder Display
*For any* state where no check-in has occurred today, a visual reminder indicator should be displayed in the UI.
**Validates: Requirements 12.1, 12.2**

### Property 28: Countdown Timer Display
*For any* active check-in interface, a countdown showing time remaining until day end should be displayed and update correctly.
**Validates: Requirements 12.3**



## Error Handling

### Invalid Date Handling

**Scenario**: User's system clock is incorrect or dates are corrupted in storage
**Handling**:
- Validate all dates using `Date.parse()` before processing
- If invalid date detected, log warning and use current date as fallback
- Never crash the application due to date parsing errors

```javascript
function parseDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return new Date(); // Fallback to current date
    }
    return date;
  } catch (error) {
    console.error('Date parsing error:', error);
    return new Date();
  }
}
```

### Corrupted localStorage Data

**Scenario**: localStorage data is corrupted, missing fields, or has wrong types
**Handling**:
- Validate data structure on load
- Use default values for missing or invalid fields
- Preserve valid fields when possible
- Log corruption for debugging

```javascript
function loadCheckInState() {
  try {
    const stored = localStorage.getItem('checkInState');
    if (!stored) return getDefaultCheckInState();
    
    const parsed = JSON.parse(stored);
    
    // Validate and merge with defaults
    return {
      currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
      longestStreak: typeof parsed.longestStreak === 'number' ? parsed.longestStreak : 0,
      lastCheckInDate: typeof parsed.lastCheckInDate === 'string' ? parsed.lastCheckInDate : null,
      checkInHistory: Array.isArray(parsed.checkInHistory) ? parsed.checkInHistory : [],
      freezeAvailable: typeof parsed.freezeAvailable === 'boolean' ? parsed.freezeAvailable : true,
      totalCheckIns: typeof parsed.totalCheckIns === 'number' ? parsed.totalCheckIns : 0,
      milestonesAchieved: Array.isArray(parsed.milestonesAchieved) ? parsed.milestonesAchieved : [],
      totalCheckInXP: typeof parsed.totalCheckInXP === 'number' ? parsed.totalCheckInXP : 0
    };
  } catch (error) {
    console.error('Failed to load check-in state:', error);
    return getDefaultCheckInState();
  }
}
```

### Missing Integration Functions

**Scenario**: Required functions (addScore, showAchievementToast) are not available
**Handling**:
- Check for function existence before calling
- Provide fallback behavior or graceful degradation
- Log warnings for missing integrations

```javascript
function awardXP(amount) {
  if (typeof window.addScore === 'function') {
    window.addScore(amount);
  } else {
    console.warn('addScore function not available, XP not awarded:', amount);
    // Could store pending XP to award later
  }
}
```

### Duplicate Check-In Attempts

**Scenario**: User tries to check in multiple times in the same day
**Handling**:
- Validate check-in hasn't occurred today before processing
- Show friendly message if already checked in
- Don't modify state or award duplicate rewards

```javascript
function canCheckInToday() {
  const today = getTodayString();
  const state = window.state.checkIn;
  return !state.checkInHistory.includes(today);
}
```

### Calendar Rendering Errors

**Scenario**: Calendar fails to render due to invalid dates or DOM issues
**Handling**:
- Wrap rendering in try-catch
- Show error message instead of broken UI
- Allow rest of system to function normally

```javascript
function renderCalendar() {
  try {
    // Calendar rendering logic
  } catch (error) {
    console.error('Calendar rendering failed:', error);
    document.getElementById('calendar-container').innerHTML = 
      '<p class="text-red-500">Unable to load calendar. Please refresh.</p>';
  }
}
```

### Network/Storage Quota Errors

**Scenario**: localStorage quota exceeded or storage unavailable
**Handling**:
- Catch quota exceeded errors
- Attempt to clean old data if possible
- Inform user of storage issues
- Continue operation in memory-only mode

```javascript
function saveCheckInState(state) {
  try {
    localStorage.setItem('checkInState', JSON.stringify(state));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      // Attempt cleanup or notify user
      showNotification('Storage full. Check-in saved temporarily.', 'warning');
    } else {
      console.error('Failed to save check-in state:', error);
    }
  }
}
```

## Testing Strategy

### Overview

The Daily Check-In System requires comprehensive testing using both unit tests and property-based tests. Unit tests validate specific examples and edge cases, while property tests verify universal properties across all inputs.

### Testing Framework

**Unit Testing**: Jest (already used in the project)
**Property-Based Testing**: fast-check (JavaScript property testing library)

Installation:
```bash
npm install --save-dev fast-check
```

### Property-Based Testing Configuration

Each property test should:
- Run minimum 100 iterations to ensure comprehensive input coverage
- Reference the design document property number
- Include a descriptive tag comment

Tag format:
```javascript
// Feature: daily-check-in-system, Property 1: Check-In Detection Accuracy
```

### Test Organization

```
tests/
├── check-in/
│   ├── unit/
│   │   ├── streak-calculator.test.js
│   │   ├── reward-calculator.test.js
│   │   ├── freeze-manager.test.js
│   │   ├── calendar-renderer.test.js
│   │   └── date-utilities.test.js
│   └── property/
│       ├── streak-properties.test.js
│       ├── reward-properties.test.js
│       ├── persistence-properties.test.js
│       ├── freeze-properties.test.js
│       └── integration-properties.test.js
```

### Property Test Examples

#### Property 1: Check-In Detection Accuracy

```javascript
// Feature: daily-check-in-system, Property 1: Check-In Detection Accuracy
test('should correctly detect if check-in occurred today', () => {
  fc.assert(
    fc.property(
      fc.array(fc.date()), // Random array of dates
      fc.date(),           // Random current date
      (checkInDates, currentDate) => {
        const history = checkInDates.map(d => d.toISOString().split('T')[0]);
        const today = currentDate.toISOString().split('T')[0];
        
        const hasCheckedIn = history.includes(today);
        const detected = CheckInManager.hasCheckedInToday(history, today);
        
        return hasCheckedIn === detected;
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 3: Data Persistence Round-Trip

```javascript
// Feature: daily-check-in-system, Property 3: Data Persistence Round-Trip
test('should preserve state through save and load cycle', () => {
  fc.assert(
    fc.property(
      fc.record({
        currentStreak: fc.nat(365),
        longestStreak: fc.nat(365),
        lastCheckInDate: fc.option(fc.date().map(d => d.toISOString().split('T')[0])),
        checkInHistory: fc.array(fc.date().map(d => d.toISOString().split('T')[0])),
        freezeAvailable: fc.boolean(),
        totalCheckIns: fc.nat(1000),
        milestonesAchieved: fc.array(fc.constantFrom(7, 30, 100)),
        totalCheckInXP: fc.nat(100000)
      }),
      (originalState) => {
        // Save to localStorage
        saveCheckInState(originalState);
        
        // Load from localStorage
        const loadedState = loadCheckInState();
        
        // Verify equivalence
        return JSON.stringify(originalState) === JSON.stringify(loadedState);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 8: Progressive Reward Formula

```javascript
// Feature: daily-check-in-system, Property 8: Progressive Reward Formula
test('should award increasing rewards for longer streaks', () => {
  fc.assert(
    fc.property(
      fc.nat(365), // day1
      fc.nat(365), // day2
      (day1, day2) => {
        fc.pre(day2 > day1); // Precondition: day2 must be greater
        
        const reward1 = RewardCalculator.calculateDailyReward(day1);
        const reward2 = RewardCalculator.calculateDailyReward(day2);
        
        return reward2 > reward1;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Test Examples

#### Specific Reward Values (Requirements 3.1-3.4)

```javascript
describe('Reward Calculator - Specific Values', () => {
  test('should award 12 XP on day 1', () => {
    expect(RewardCalculator.calculateDailyReward(1)).toBe(12);
  });
  
  test('should award 74 XP on day 7 (24 daily + 50 milestone)', () => {
    expect(RewardCalculator.calculateDailyReward(7)).toBe(74);
  });
  
  test('should award 270 XP on day 30 (70 daily + 200 milestone)', () => {
    expect(RewardCalculator.calculateDailyReward(30)).toBe(270);
  });
  
  test('should award 1210 XP on day 100 (210 daily + 1000 milestone)', () => {
    expect(RewardCalculator.calculateDailyReward(100)).toBe(1210);
  });
});
```

#### Milestone Achievements (Requirements 6.1-6.3)

```javascript
describe('Milestone Achievements', () => {
  test('should unlock Week Warrior at 7 days', () => {
    const achievement = RewardCalculator.getMilestoneAchievement(7);
    expect(achievement.id).toBe('week_warrior');
    expect(achievement.name).toBe('Week Warrior');
  });
  
  test('should unlock Monthly Master at 30 days', () => {
    const achievement = RewardCalculator.getMilestoneAchievement(30);
    expect(achievement.id).toBe('monthly_master');
    expect(achievement.name).toBe('Monthly Master');
  });
  
  test('should unlock Century Champion at 100 days', () => {
    const achievement = RewardCalculator.getMilestoneAchievement(100);
    expect(achievement.id).toBe('century_champion');
    expect(achievement.name).toBe('Century Champion');
  });
});
```

#### Edge Cases

```javascript
describe('Edge Cases', () => {
  test('should handle empty check-in history', () => {
    const streak = StreakCalculator.calculateStreak([], null);
    expect(streak).toBe(0);
  });
  
  test('should handle corrupted date strings', () => {
    const state = loadCheckInState();
    state.lastCheckInDate = 'invalid-date';
    saveCheckInState(state);
    
    const loaded = loadCheckInState();
    expect(loaded.lastCheckInDate).toBe(null);
  });
  
  test('should handle missing localStorage', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = () => null;
    
    const state = loadCheckInState();
    expect(state.currentStreak).toBe(0);
    
    localStorage.getItem = originalGetItem;
  });
  
  test('should prevent duplicate check-ins on same day', () => {
    const today = getTodayString();
    const history = [today];
    
    expect(CheckInManager.canCheckInToday(history, today)).toBe(false);
  });
});
```

### Integration Tests

```javascript
describe('Integration Tests', () => {
  test('should integrate with XP system on check-in', () => {
    const mockAddScore = jest.fn();
    window.addScore = mockAddScore;
    
    CheckInManager.processCheckIn();
    
    expect(mockAddScore).toHaveBeenCalledWith(expect.any(Number));
  });
  
  test('should integrate with achievement system on milestone', () => {
    const mockUnlockAchievement = jest.fn();
    window.unlockAchievement = mockUnlockAchievement;
    
    // Set up state for 7-day milestone
    window.state.checkIn.currentStreak = 6;
    CheckInManager.processCheckIn();
    
    expect(mockUnlockAchievement).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'week_warrior' })
    );
  });
  
  test('should integrate with notification system', () => {
    const mockShowToast = jest.fn();
    window.showAchievementToast = mockShowToast;
    
    CheckInManager.processCheckIn();
    
    expect(mockShowToast).toHaveBeenCalled();
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 28 correctness properties implemented
- **Integration Test Coverage**: All external system integrations tested
- **Edge Case Coverage**: All error handling paths tested

### Continuous Testing

Tests should be run:
- Before every commit (pre-commit hook)
- On every pull request (CI/CD pipeline)
- Before deployment to production

### Manual Testing Checklist

While automated tests cover most functionality, manual testing should verify:
- Visual appearance and animations
- Mobile responsiveness on real devices
- Touch interactions on mobile
- Calendar navigation smoothness
- Notification timing and appearance
- Confetti and celebration effects
- Overall user experience flow
