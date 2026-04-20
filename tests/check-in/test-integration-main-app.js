/**
 * Integration Test: Check-In System with Main Application
 * 
 * Tests that the check-in system integrates properly with:
 * - Main application state (window.state)
 * - XP system (addScore function)
 * - Achievement system (showAchievementToast function)
 * - localStorage persistence
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.6
 */

// Mock browser environment
global.window = global;
global.document = {
  getElementById: () => null,
  addEventListener: () => {},
  readyState: 'complete'
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
global.localStorage = localStorageMock;

// Initialize state
global.state = {};

// Mock integration functions
let xpAwarded = 0;
let achievementsShown = [];

global.addScore = (amount) => {
  xpAwarded += amount;
  console.log(`✓ XP awarded: ${amount}`);
};

global.showAchievementToast = (message, type) => {
  achievementsShown.push({ message, type });
  console.log(`✓ Achievement toast shown: ${message}`);
};

// Load check-in system
require('../../public/js/check-in.js');

// ============================================================================
// TEST SUITE
// ============================================================================

console.log('\n=== Check-In System Integration Tests ===\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  Error: ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Reset state before each test
function resetState() {
  global.state = {};
  localStorage.clear();
  xpAwarded = 0;
  achievementsShown = [];
}

// ============================================================================
// Test 1: CheckInManager is exposed to window object
// ============================================================================
test('CheckInManager is exposed to window object', () => {
  assert(typeof window.CheckInManager === 'object', 'CheckInManager should be an object');
  assert(typeof window.CheckInManager.init === 'function', 'CheckInManager.init should be a function');
  assert(typeof window.CheckInManager.processCheckIn === 'function', 'CheckInManager.processCheckIn should be a function');
});

// ============================================================================
// Test 2: CheckInManager initializes state properly
// ============================================================================
test('CheckInManager initializes state properly', () => {
  resetState();
  window.CheckInManager.init();
  
  assert(window.state.checkIn !== undefined, 'window.state.checkIn should be initialized');
  assert(window.state.checkIn.currentStreak === 0, 'Initial streak should be 0');
  assert(window.state.checkIn.freezeAvailable === true, 'Freeze should be available initially');
  assert(Array.isArray(window.state.checkIn.checkInHistory), 'checkInHistory should be an array');
});

// ============================================================================
// Test 3: First check-in awards XP through addScore
// ============================================================================
test('First check-in awards XP through addScore', () => {
  resetState();
  window.CheckInManager.init();
  
  const result = window.CheckInManager.processCheckIn();
  
  assert(result === true, 'processCheckIn should return true');
  assert(xpAwarded > 0, 'XP should be awarded through addScore');
  assert(xpAwarded === 12, 'First check-in should award 12 XP (10 + 1*2)');
});

// ============================================================================
// Test 4: Check-in shows notification through showAchievementToast
// ============================================================================
test('Check-in shows notification through showAchievementToast', () => {
  resetState();
  window.CheckInManager.init();
  
  window.CheckInManager.processCheckIn();
  
  assert(achievementsShown.length > 0, 'Achievement toast should be shown');
  assert(achievementsShown[0].message.includes('12'), 'Toast should mention XP amount');
});

// ============================================================================
// Test 5: Check-in data persists to localStorage
// ============================================================================
test('Check-in data persists to localStorage', () => {
  resetState();
  window.CheckInManager.init();
  
  window.CheckInManager.processCheckIn();
  
  const stored = localStorage.getItem('checkInState');
  assert(stored !== null, 'Check-in state should be saved to localStorage');
  
  const parsed = JSON.parse(stored);
  assert(parsed.currentStreak === 1, 'Stored streak should be 1');
  assert(parsed.totalCheckIns === 1, 'Stored totalCheckIns should be 1');
});

// ============================================================================
// Test 6: State loads from localStorage on init
// ============================================================================
test('State loads from localStorage on init', () => {
  resetState();
  
  // Manually set localStorage
  const mockState = {
    currentStreak: 5,
    longestStreak: 5,
    lastCheckInDate: '2024-01-01',
    checkInHistory: ['2024-01-01'],
    freezeAvailable: true,
    totalCheckIns: 5,
    milestonesAchieved: [],
    totalCheckInXP: 100
  };
  localStorage.setItem('checkInState', JSON.stringify(mockState));
  
  // Initialize
  window.CheckInManager.init();
  
  assert(window.state.checkIn.currentStreak === 5, 'Streak should be loaded from localStorage');
  assert(window.state.checkIn.totalCheckIns === 5, 'Total check-ins should be loaded');
});

// ============================================================================
// Test 7: Milestone check-in triggers achievement
// ============================================================================
test('Milestone check-in triggers achievement notification', () => {
  resetState();
  window.CheckInManager.init();
  
  // Set up state for 7-day milestone (6 days already)
  const today = window.getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  window.state.checkIn.currentStreak = 6;
  window.state.checkIn.lastCheckInDate = yesterdayStr;
  window.state.checkIn.checkInHistory = [yesterdayStr];
  
  xpAwarded = 0;
  achievementsShown = [];
  
  window.CheckInManager.processCheckIn();
  
  assert(window.state.checkIn.currentStreak === 7, 'Streak should be 7');
  assert(xpAwarded === 74, '7-day check-in should award 74 XP (24 + 50 milestone bonus)');
  assert(achievementsShown.length >= 1, 'Should show milestone notification');
  assert(achievementsShown[0].message.includes('Week Warrior'), 'Should mention milestone achievement');
});

// ============================================================================
// Test 8: Cannot check in twice in same day
// ============================================================================
test('Cannot check in twice in same day', () => {
  resetState();
  window.CheckInManager.init();
  
  const firstResult = window.CheckInManager.processCheckIn();
  assert(firstResult === true, 'First check-in should succeed');
  
  xpAwarded = 0;
  achievementsShown = [];
  
  const secondResult = window.CheckInManager.processCheckIn();
  assert(secondResult === false, 'Second check-in should fail');
  assert(xpAwarded === 0, 'No XP should be awarded for duplicate check-in');
});

// ============================================================================
// Test 9: getCheckInStatus returns correct status
// ============================================================================
test('getCheckInStatus returns correct status', () => {
  resetState();
  window.CheckInManager.init();
  
  let status = window.CheckInManager.getCheckInStatus();
  assert(status.checkedIn === false, 'Should not be checked in initially');
  assert(status.streak === 0, 'Initial streak should be 0');
  
  window.CheckInManager.processCheckIn();
  
  status = window.CheckInManager.getCheckInStatus();
  assert(status.checkedIn === true, 'Should be checked in after check-in');
  assert(status.streak === 1, 'Streak should be 1 after first check-in');
});

// ============================================================================
// Test 10: All required functions are exposed
// ============================================================================
test('All required functions are exposed to window', () => {
  assert(typeof window.CheckInManager === 'object', 'CheckInManager should be exposed');
  assert(typeof window.StreakCalculator === 'object', 'StreakCalculator should be exposed');
  assert(typeof window.RewardCalculator === 'object', 'RewardCalculator should be exposed');
  assert(typeof window.FreezeManager === 'object', 'FreezeManager should be exposed');
  assert(typeof window.CalendarRenderer === 'object', 'CalendarRenderer should be exposed');
  assert(typeof window.UIController === 'object', 'UIController should be exposed');
  assert(typeof window.getTodayString === 'function', 'getTodayString should be exposed');
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n=== Test Summary ===');
console.log(`Total: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All integration tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}
