/**
 * Node.js test runner for manual check-in tests
 * Executes the manual tests programmatically to verify functionality
 */

// Mock browser environment
global.window = global;
global.document = {
  readyState: 'complete',
  addEventListener: () => {}
};
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

// Load the check-in module
require('../../public/js/check-in.js');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

function assert(condition, message) {
  if (condition) {
    return { pass: true, message };
  } else {
    return { pass: false, message };
  }
}

function runTest(testName, testFn) {
  try {
    const result = testFn();
    if (result.pass) {
      console.log(`✓ ${testName}: ${result.message}`);
      testsPassed++;
    } else {
      console.log(`✗ ${testName}: ${result.message}`);
      testsFailed++;
      failedTests.push(testName);
    }
  } catch (error) {
    console.log(`✗ ${testName}: Error - ${error.message}`);
    testsFailed++;
    failedTests.push(testName);
  }
}

console.log('='.repeat(70));
console.log('RUNNING MANUAL TESTS FOR DAILY CHECK-IN SYSTEM');
console.log('='.repeat(70));
console.log('');

// ============================================================================
// DATE UTILITIES TESTS
// ============================================================================

console.log('--- DATE UTILITIES TESTS ---');
console.log('');

runTest('getTodayString returns YYYY-MM-DD format', () => {
  const today = getTodayString();
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  return assert(pattern.test(today), `Got: ${today}`);
});

runTest('parseDate handles valid date', () => {
  const date = parseDate('2024-01-15');
  return assert(date instanceof Date && !isNaN(date.getTime()), 
    `Parsed: ${date}`);
});

runTest('parseDate handles invalid date', () => {
  const date = parseDate('invalid');
  return assert(date instanceof Date, 
    `Returned fallback date: ${date}`);
});

runTest('isSameDay returns true for same dates', () => {
  const date1 = new Date('2024-01-15T10:00:00');
  const date2 = new Date('2024-01-15T20:00:00');
  return assert(isSameDay(date1, date2), 'Same day detected');
});

runTest('isSameDay returns false for different dates', () => {
  const date1 = new Date('2024-01-15');
  const date2 = new Date('2024-01-16');
  return assert(!isSameDay(date1, date2), 'Different days detected');
});

runTest('getDaysBetween calculates correctly', () => {
  const date1 = new Date('2024-01-15');
  const date2 = new Date('2024-01-20');
  const days = getDaysBetween(date1, date2);
  return assert(days === 5, `Expected 5, got ${days}`);
});

runTest('isNextDay returns true for consecutive days', () => {
  const date1 = new Date('2024-01-15');
  const date2 = new Date('2024-01-16');
  return assert(isNextDay(date1, date2), 'Consecutive days detected');
});

runTest('isNextDay returns false for non-consecutive days', () => {
  const date1 = new Date('2024-01-15');
  const date2 = new Date('2024-01-17');
  return assert(!isNextDay(date1, date2), 'Non-consecutive days detected');
});

console.log('');

// ============================================================================
// PERSISTENCE TESTS
// ============================================================================

console.log('--- PERSISTENCE TESTS ---');
console.log('');

runTest('Save and load valid state', () => {
  const testState = {
    currentStreak: 5,
    longestStreak: 10,
    lastCheckInDate: '2024-01-15',
    checkInHistory: ['2024-01-11', '2024-01-12', '2024-01-13', '2024-01-14', '2024-01-15'],
    freezeAvailable: true,
    totalCheckIns: 25,
    milestonesAchieved: [7],
    totalCheckInXP: 500
  };
  
  saveCheckInState(testState);
  const loaded = loadCheckInState();
  const match = JSON.stringify(testState) === JSON.stringify(loaded);
  
  return assert(match, match ? 'States match' : 'States do not match');
});

runTest('Handle corrupted data', () => {
  const corrupted = {
    currentStreak: 'not a number',
    longestStreak: -5,
    lastCheckInDate: 'invalid-date',
    checkInHistory: ['2024-01-15', 123, null],
    freezeAvailable: 'yes',
    totalCheckIns: 'many'
  };
  
  localStorage.setItem('checkInState', JSON.stringify(corrupted));
  const loaded = loadCheckInState();
  
  const hasDefaults = 
    loaded.currentStreak === 0 &&
    loaded.longestStreak === 0 &&
    loaded.lastCheckInDate === null &&
    Array.isArray(loaded.checkInHistory);
  
  return assert(hasDefaults, hasDefaults ? 'Defaults applied' : 'Defaults not applied');
});

runTest('validateDateString accepts valid dates', () => {
  const result = validateDateString('2024-01-15');
  return assert(result === '2024-01-15', `Expected '2024-01-15', got ${result}`);
});

runTest('validateDateString rejects invalid dates', () => {
  const result = validateDateString('invalid');
  return assert(result === null, `Expected null, got ${result}`);
});

runTest('validateCheckInHistory filters invalid entries', () => {
  const input = ['2024-01-15', 'invalid', 123, null, '2024-01-14'];
  const result = validateCheckInHistory(input);
  return assert(result.length === 2 && Array.isArray(result), 
    `Expected 2 valid entries, got ${result.length}`);
});

runTest('validateCheckInHistory removes duplicates', () => {
  const input = ['2024-01-15', '2024-01-15', '2024-01-14'];
  const result = validateCheckInHistory(input);
  return assert(result.length === 2, 
    `Expected 2 unique entries, got ${result.length}`);
});

console.log('');

// ============================================================================
// STREAK CALCULATOR TESTS
// ============================================================================

console.log('--- STREAK CALCULATOR TESTS ---');
console.log('');

runTest('Empty history returns 0', () => {
  const streak = StreakCalculator.calculateStreak([], null);
  return assert(streak === 0, `Expected 0, got ${streak}`);
});

runTest('Null lastCheckInDate returns 0', () => {
  const history = ['2024-01-01', '2024-01-02'];
  const streak = StreakCalculator.calculateStreak(history, null);
  return assert(streak === 0, `Expected 0, got ${streak}`);
});

runTest('Single check-in today', () => {
  const today = getTodayString();
  const history = [today];
  const streak = StreakCalculator.calculateStreak(history, today, today);
  return assert(streak === 1, `Expected 1, got ${streak}`);
});

runTest('Consecutive days (3 days)', () => {
  const history = ['2024-01-01', '2024-01-02', '2024-01-03'];
  const streak = StreakCalculator.calculateStreak(history, '2024-01-03', '2024-01-03');
  return assert(streak === 3, `Expected 3, got ${streak}`);
});

runTest('Gap in history breaks streak', () => {
  const history = ['2024-01-01', '2024-01-02', '2024-01-05'];
  const streak = StreakCalculator.calculateStreak(history, '2024-01-05', '2024-01-05');
  return assert(streak === 1, `Expected 1, got ${streak}`);
});

runTest('Last check-in was yesterday', () => {
  const history = ['2024-01-01', '2024-01-02', '2024-01-03'];
  const streak = StreakCalculator.calculateStreak(history, '2024-01-03', '2024-01-04');
  return assert(streak === 3, `Expected 3, got ${streak}`);
});

runTest('Last check-in was 2+ days ago', () => {
  const history = ['2024-01-01', '2024-01-02', '2024-01-03'];
  const streak = StreakCalculator.calculateStreak(history, '2024-01-03', '2024-01-06');
  return assert(streak === 0, `Expected 0, got ${streak}`);
});

runTest('areConsecutiveDays - true case', () => {
  const result = StreakCalculator.areConsecutiveDays('2024-01-01', '2024-01-02');
  return assert(result === true, `Expected true, got ${result}`);
});

runTest('areConsecutiveDays - false case', () => {
  const result = StreakCalculator.areConsecutiveDays('2024-01-01', '2024-01-03');
  return assert(result === false, `Expected false, got ${result}`);
});

runTest('isToday - true case', () => {
  const today = new Date();
  const result = StreakCalculator.isToday(today);
  return assert(result === true, `Expected true, got ${result}`);
});

runTest('isToday - false case', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const result = StreakCalculator.isToday(yesterday);
  return assert(result === false, `Expected false, got ${result}`);
});

runTest('isYesterday - true case', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const result = StreakCalculator.isYesterday(yesterday);
  return assert(result === true, `Expected true, got ${result}`);
});

runTest('isYesterday - false case', () => {
  const today = new Date();
  const result = StreakCalculator.isYesterday(today);
  return assert(result === false, `Expected false, got ${result}`);
});

runTest('Long streak (7 days)', () => {
  const history = [
    '2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04',
    '2024-01-05', '2024-01-06', '2024-01-07'
  ];
  const streak = StreakCalculator.calculateStreak(history, '2024-01-07', '2024-01-07');
  return assert(streak === 7, `Expected 7, got ${streak}`);
});

runTest('Unordered history', () => {
  const history = ['2024-01-03', '2024-01-01', '2024-01-02'];
  const streak = StreakCalculator.calculateStreak(history, '2024-01-03', '2024-01-03');
  return assert(streak === 3, `Expected 3, got ${streak}`);
});

console.log('');

// ============================================================================
// SUMMARY
// ============================================================================

console.log('='.repeat(70));
console.log('TEST SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed > 0) {
  console.log('');
  console.log('Failed Tests:');
  failedTests.forEach(test => console.log(`  - ${test}`));
  process.exit(1);
} else {
  console.log('');
  console.log('✓ All tests passed!');
  process.exit(0);
}
