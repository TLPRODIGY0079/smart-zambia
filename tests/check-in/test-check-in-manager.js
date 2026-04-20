/**
 * CheckInManager Tests
 * Tests for Task 8.1: Create CheckInManager module
 */

// Mock localStorage for Node.js environment
global.localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  clear: function() {
    this.data = {};
  }
};

// Mock window object
global.window = {
  state: {},
  addScore: null,
  unlockAchievement: null,
  showAchievementToast: null,
  triggerConfetti: null
};

// Load the check-in module
require('../../public/js/check-in.js');

// Get references from window object
const CheckInManager = global.window.CheckInManager;
const getDefaultCheckInState = global.window.getDefaultCheckInState;
const getTodayString = global.window.getTodayString;
const loadCheckInState = global.window.loadCheckInState;

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.log(`✗ ${message}`);
    testsFailed++;
  }
}

function assertEquals(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}: Expected ${expected}, got ${actual}`);
    testsPassed++;
  } else {
    console.log(`✗ ${message}: Expected ${expected}, got ${actual}`);
    testsFailed++;
  }
}

console.log('='.repeat(70));
console.log('CHECKINMANAGER TESTS');
console.log('='.repeat(70));
console.log();

// Test 1: Initialization
console.log('--- INITIALIZATION TESTS ---');
console.log();

// Reset state
global.localStorage.clear();
global.window.state = {};

// Initialize
CheckInManager.init();

assert(global.window.state.checkIn !== undefined, 'CheckInManager.init() creates state.checkIn');
assertEquals(global.window.state.checkIn.currentStreak, 0, 'Initial streak is 0');
assertEquals(global.window.state.checkIn.totalCheckIns, 0, 'Initial totalCheckIns is 0');
assert(global.window.state.checkIn.freezeAvailable === true, 'Initial freeze is available');
assert(Array.isArray(global.window.state.checkIn.checkInHistory), 'checkInHistory is an array');

console.log();

// Test 2: canCheckInToday
console.log('--- canCheckInToday TESTS ---');
console.log();

// Reset state
global.window.state.checkIn = getDefaultCheckInState();

// Should be able to check in (no check-in today)
assert(CheckInManager.canCheckInToday() === true, 'canCheckInToday returns true when no check-in today');

// Add today to history
const today = getTodayString();
global.window.state.checkIn.checkInHistory.push(today);

// Should not be able to check in (already checked in today)
assert(CheckInManager.canCheckInToday() === false, 'canCheckInToday returns false when already checked in today');

console.log();

// Test 3: getCheckInStatus
console.log('--- getCheckInStatus TESTS ---');
console.log();

// Reset state
global.window.state.checkIn = {
  ...getDefaultCheckInState(),
  currentStreak: 5,
  totalCheckIns: 10,
  longestStreak: 8,
  freezeAvailable: false
};

const status = CheckInManager.getCheckInStatus();
assertEquals(status.streak, 5, 'getCheckInStatus returns correct streak');
assertEquals(status.totalCheckIns, 10, 'getCheckInStatus returns correct totalCheckIns');
assertEquals(status.longestStreak, 8, 'getCheckInStatus returns correct longestStreak');
assert(status.freezeAvailable === false, 'getCheckInStatus returns correct freezeAvailable');

console.log();

// Test 4: processCheckIn - First Check-In
console.log('--- processCheckIn TESTS - First Check-In ---');
console.log();

// Reset state
global.localStorage.clear();
global.window.state.checkIn = getDefaultCheckInState();

// Mock integration functions
let xpAwarded = 0;
global.window.addScore = function(amount) {
  xpAwarded = amount;
};

// Process first check-in
const result1 = CheckInManager.processCheckIn();

assert(result1 === true, 'processCheckIn returns true on success');
assertEquals(global.window.state.checkIn.currentStreak, 1, 'First check-in sets streak to 1');
assertEquals(global.window.state.checkIn.totalCheckIns, 1, 'First check-in sets totalCheckIns to 1');
assert(global.window.state.checkIn.checkInHistory.includes(today), 'First check-in adds today to history');
assert(xpAwarded > 0, 'First check-in awards XP');

console.log();

// Test 5: processCheckIn - Duplicate Check-In
console.log('--- processCheckIn TESTS - Duplicate Check-In ---');
console.log();

// Try to check in again today
const result2 = CheckInManager.processCheckIn();

assert(result2 === false, 'processCheckIn returns false for duplicate check-in');
assertEquals(global.window.state.checkIn.currentStreak, 1, 'Duplicate check-in does not change streak');
assertEquals(global.window.state.checkIn.totalCheckIns, 1, 'Duplicate check-in does not increment totalCheckIns');

console.log();

// Test 6: processCheckIn - Consecutive Day
console.log('--- processCheckIn TESTS - Consecutive Day ---');
console.log();

// Set up state with yesterday's check-in
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

global.window.state.checkIn = {
  ...getDefaultCheckInState(),
  currentStreak: 5,
  lastCheckInDate: yesterdayStr,
  checkInHistory: [yesterdayStr],
  totalCheckIns: 5
};

xpAwarded = 0;
const result3 = CheckInManager.processCheckIn();

assert(result3 === true, 'processCheckIn succeeds for consecutive day');
assertEquals(global.window.state.checkIn.currentStreak, 6, 'Consecutive day increments streak');
assertEquals(global.window.state.checkIn.totalCheckIns, 6, 'Consecutive day increments totalCheckIns');
assert(xpAwarded > 0, 'Consecutive day awards XP');

console.log();

// Test 7: processCheckIn - Missed Day with Freeze
console.log('--- processCheckIn TESTS - Missed Day with Freeze ---');
console.log();

// Set up state with check-in 2 days ago
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

global.window.state.checkIn = {
  ...getDefaultCheckInState(),
  currentStreak: 5,
  lastCheckInDate: twoDaysAgoStr,
  checkInHistory: [twoDaysAgoStr],
  freezeAvailable: true,
  totalCheckIns: 5
};

xpAwarded = 0;
const result4 = CheckInManager.processCheckIn();

assert(result4 === true, 'processCheckIn succeeds with freeze');
assertEquals(global.window.state.checkIn.currentStreak, 6, 'Freeze protects streak');
assert(global.window.state.checkIn.freezeAvailable === false, 'Freeze is consumed');
assert(xpAwarded > 0, 'Freeze check-in awards XP');

console.log();

// Test 8: processCheckIn - Streak Break (2+ days)
console.log('--- processCheckIn TESTS - Streak Break ---');
console.log();

// Set up state with check-in 3 days ago
const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

global.window.state.checkIn = {
  ...getDefaultCheckInState(),
  currentStreak: 5,
  longestStreak: 5,
  lastCheckInDate: threeDaysAgoStr,
  checkInHistory: [threeDaysAgoStr],
  freezeAvailable: true,
  totalCheckIns: 5
};

xpAwarded = 0;
const result5 = CheckInManager.processCheckIn();

assert(result5 === true, 'processCheckIn succeeds after streak break');
assertEquals(global.window.state.checkIn.currentStreak, 1, 'Streak resets to 1 after 2+ day gap');
assertEquals(global.window.state.checkIn.longestStreak, 5, 'longestStreak is preserved');
assert(xpAwarded > 0, 'New streak awards XP');

console.log();

// Test 9: processCheckIn - Milestone Achievement
console.log('--- processCheckIn TESTS - Milestone Achievement ---');
console.log();

// Set up state for 7-day milestone
global.window.state.checkIn = {
  ...getDefaultCheckInState(),
  currentStreak: 6,
  lastCheckInDate: yesterdayStr,
  checkInHistory: [yesterdayStr],
  totalCheckIns: 6
};

let achievementUnlocked = null;
global.window.unlockAchievement = function(achievement) {
  achievementUnlocked = achievement;
};

xpAwarded = 0;
const result6 = CheckInManager.processCheckIn();

assert(result6 === true, 'processCheckIn succeeds for milestone');
assertEquals(global.window.state.checkIn.currentStreak, 7, 'Milestone check-in increments streak to 7');
assert(global.window.state.checkIn.milestonesAchieved.includes(7), 'Milestone 7 is added to milestonesAchieved');
assert(achievementUnlocked !== null, 'Milestone achievement is unlocked');
assert(xpAwarded > 0, 'Milestone awards XP');

console.log();

// Test 10: Integration with XP System
console.log('--- INTEGRATION TESTS ---');
console.log();

xpAwarded = 0;
global.window.addScore = function(amount) {
  xpAwarded = amount;
};

CheckInManager.awardXP(100);
assertEquals(xpAwarded, 100, 'awardXP calls addScore with correct amount');

// Test with missing addScore function
global.window.addScore = null;
CheckInManager.awardXP(50);
assert(global.window.pendingCheckInXP === 50, 'awardXP stores pending XP when addScore unavailable');

console.log();

// Test 11: Data Persistence
console.log('--- DATA PERSISTENCE TESTS ---');
console.log();

// Set up state
global.window.state.checkIn = {
  ...getDefaultCheckInState(),
  currentStreak: 10,
  totalCheckIns: 15,
  longestStreak: 12
};

// Save state
const saveResult = CheckInManager.saveState();
assert(saveResult === true, 'saveState returns true on success');

// Load state
const loadedState = loadCheckInState();
assertEquals(loadedState.currentStreak, 10, 'Loaded state has correct currentStreak');
assertEquals(loadedState.totalCheckIns, 15, 'Loaded state has correct totalCheckIns');
assertEquals(loadedState.longestStreak, 12, 'Loaded state has correct longestStreak');

console.log();

// Test Summary
console.log('='.repeat(70));
console.log('TEST SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log();

if (testsFailed === 0) {
  console.log('✓ All tests passed!');
  process.exit(0);
} else {
  console.log('✗ Some tests failed!');
  process.exit(1);
}
