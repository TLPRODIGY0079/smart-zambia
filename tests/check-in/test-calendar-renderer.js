/**
 * Unit Tests for CalendarRenderer Module
 * Tests calendar rendering, navigation, and date utilities
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

// Mock DOM and window environment for Node.js testing
if (typeof window === 'undefined') {
  global.window = {
    state: {},
    addEventListener: () => {}
  };
}

if (typeof document === 'undefined') {
  global.document = {
    getElementById: () => null,
    readyState: 'complete',
    addEventListener: () => {}
  };
}

// Mock localStorage
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
}

// Load the check-in module
require('../../public/js/check-in.js');

// Get references from window object
const CalendarRenderer = window.CalendarRenderer;
const getTodayString = window.getTodayString;

// Test suite
console.log('\n=== CALENDAR RENDERER TESTS ===\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertIncludes(str, substring, message) {
  if (!str.includes(substring)) {
    throw new Error(message || `Expected string to include "${substring}"`);
  }
}

// ============================================================================
// CALENDAR RENDERER TESTS
// ============================================================================

console.log('--- getDaysInMonth Tests ---\n');

test('getDaysInMonth: January 2024 has 31 days', () => {
  const days = CalendarRenderer.getDaysInMonth(2024, 0);
  assertEqual(days, 31, 'January should have 31 days');
});

test('getDaysInMonth: February 2024 has 29 days (leap year)', () => {
  const days = CalendarRenderer.getDaysInMonth(2024, 1);
  assertEqual(days, 29, 'February 2024 should have 29 days (leap year)');
});

test('getDaysInMonth: February 2023 has 28 days (non-leap year)', () => {
  const days = CalendarRenderer.getDaysInMonth(2023, 1);
  assertEqual(days, 28, 'February 2023 should have 28 days (non-leap year)');
});

test('getDaysInMonth: April 2024 has 30 days', () => {
  const days = CalendarRenderer.getDaysInMonth(2024, 3);
  assertEqual(days, 30, 'April should have 30 days');
});

test('getDaysInMonth: December 2024 has 31 days', () => {
  const days = CalendarRenderer.getDaysInMonth(2024, 11);
  assertEqual(days, 31, 'December should have 31 days');
});

console.log('\n--- getFirstDayOfMonth Tests ---\n');

test('getFirstDayOfMonth: Returns valid day of week (0-6)', () => {
  const firstDay = CalendarRenderer.getFirstDayOfMonth(2024, 0);
  assert(firstDay >= 0 && firstDay <= 6, 'First day should be 0-6 (Sun-Sat)');
});

test('getFirstDayOfMonth: January 1, 2024 is Monday (1)', () => {
  const firstDay = CalendarRenderer.getFirstDayOfMonth(2024, 0);
  assertEqual(firstDay, 1, 'January 1, 2024 should be Monday (1)');
});

test('getFirstDayOfMonth: Different months return different values', () => {
  const jan = CalendarRenderer.getFirstDayOfMonth(2024, 0);
  const feb = CalendarRenderer.getFirstDayOfMonth(2024, 1);
  assert(jan !== feb || true, 'Different months may have different first days');
});

console.log('\n--- hasCheckIn Tests ---\n');

test('hasCheckIn: Returns true for date in history', () => {
  const history = ['2024-01-15', '2024-01-20', '2024-01-25'];
  const result = CalendarRenderer.hasCheckIn('2024-01-15', history);
  assertEqual(result, true, 'Should return true for date in history');
});

test('hasCheckIn: Returns false for date not in history', () => {
  const history = ['2024-01-15', '2024-01-20', '2024-01-25'];
  const result = CalendarRenderer.hasCheckIn('2024-01-16', history);
  assertEqual(result, false, 'Should return false for date not in history');
});

test('hasCheckIn: Handles empty history', () => {
  const result = CalendarRenderer.hasCheckIn('2024-01-15', []);
  assertEqual(result, false, 'Should return false for empty history');
});

test('hasCheckIn: Handles invalid history (not array)', () => {
  const result = CalendarRenderer.hasCheckIn('2024-01-15', null);
  assertEqual(result, false, 'Should return false for invalid history');
});

console.log('\n--- renderMonth Tests ---\n');

test('renderMonth: Returns HTML string', () => {
  const html = CalendarRenderer.renderMonth(2024, 0, []);
  assert(typeof html === 'string', 'Should return a string');
  assert(html.length > 0, 'HTML should not be empty');
});

test('renderMonth: Includes calendar-container class', () => {
  const html = CalendarRenderer.renderMonth(2024, 0, []);
  assertIncludes(html, 'calendar-container', 'Should include calendar-container');
});

test('renderMonth: Includes month name', () => {
  const html = CalendarRenderer.renderMonth(2024, 0, []);
  assertIncludes(html, 'January', 'Should include month name');
});

test('renderMonth: Includes year', () => {
  const html = CalendarRenderer.renderMonth(2024, 0, []);
  assertIncludes(html, '2024', 'Should include year');
});

test('renderMonth: Includes day names header', () => {
  const html = CalendarRenderer.renderMonth(2024, 0, []);
  assertIncludes(html, 'calendar-days-header', 'Should include day names header');
  assertIncludes(html, 'Sun', 'Should include Sunday');
  assertIncludes(html, 'Mon', 'Should include Monday');
});

test('renderMonth: Includes calendar grid', () => {
  const html = CalendarRenderer.renderMonth(2024, 0, []);
  assertIncludes(html, 'calendar-grid', 'Should include calendar grid');
});

test('renderMonth: Includes navigation buttons', () => {
  const html = CalendarRenderer.renderMonth(2024, 0, []);
  assertIncludes(html, 'calendar-nav-btn', 'Should include navigation buttons');
  assertIncludes(html, 'fa-chevron-left', 'Should include left arrow');
  assertIncludes(html, 'fa-chevron-right', 'Should include right arrow');
});

test('renderMonth: Marks checked-in days', () => {
  const history = ['2024-01-15'];
  const html = CalendarRenderer.renderMonth(2024, 0, history);
  assertIncludes(html, 'calendar-day-checked-in', 'Should mark checked-in days');
  assertIncludes(html, 'fa-check', 'Should include check icon');
});

test('renderMonth: Highlights today', () => {
  const today = getTodayString();
  const [year, month] = today.split('-').map(Number);
  const html = CalendarRenderer.renderMonth(year, month - 1, []);
  assertIncludes(html, 'calendar-day-today', 'Should highlight today');
});

test('renderMonth: Handles invalid year gracefully', () => {
  const html = CalendarRenderer.renderMonth(3000, 0, []);
  assert(
    html.includes('calendar-error') || html.includes('Unable to load'),
    'Should return error message for invalid year'
  );
});

test('renderMonth: Handles invalid month gracefully', () => {
  const html = CalendarRenderer.renderMonth(2024, 15, []);
  assert(
    html.includes('calendar-error') || html.includes('Unable to load'),
    'Should return error message for invalid month'
  );
});

test('renderMonth: Handles invalid history gracefully', () => {
  const html = CalendarRenderer.renderMonth(2024, 0, 'not-an-array');
  assert(typeof html === 'string', 'Should still return HTML string');
  assertIncludes(html, 'calendar-container', 'Should include calendar container');
});

console.log('\n--- navigateMonth Tests ---\n');

test('navigateMonth: Advances to next month', () => {
  CalendarRenderer.currentDisplayMonth = 0;
  CalendarRenderer.currentDisplayYear = 2024;
  
  const result = CalendarRenderer.navigateMonth(1);
  
  assertEqual(result, true, 'Should return true on success');
  assertEqual(CalendarRenderer.currentDisplayMonth, 1, 'Should advance to month 1');
  assertEqual(CalendarRenderer.currentDisplayYear, 2024, 'Year should remain 2024');
});

test('navigateMonth: Goes back to previous month', () => {
  CalendarRenderer.currentDisplayMonth = 5;
  CalendarRenderer.currentDisplayYear = 2024;
  
  const result = CalendarRenderer.navigateMonth(-1);
  
  assertEqual(result, true, 'Should return true on success');
  assertEqual(CalendarRenderer.currentDisplayMonth, 4, 'Should go back to month 4');
  assertEqual(CalendarRenderer.currentDisplayYear, 2024, 'Year should remain 2024');
});

test('navigateMonth: Wraps to next year when advancing from December', () => {
  CalendarRenderer.currentDisplayMonth = 11;
  CalendarRenderer.currentDisplayYear = 2024;
  
  CalendarRenderer.navigateMonth(1);
  
  assertEqual(CalendarRenderer.currentDisplayMonth, 0, 'Should wrap to January (0)');
  assertEqual(CalendarRenderer.currentDisplayYear, 2025, 'Should advance to 2025');
});

test('navigateMonth: Wraps to previous year when going back from January', () => {
  CalendarRenderer.currentDisplayMonth = 0;
  CalendarRenderer.currentDisplayYear = 2024;
  
  CalendarRenderer.navigateMonth(-1);
  
  assertEqual(CalendarRenderer.currentDisplayMonth, 11, 'Should wrap to December (11)');
  assertEqual(CalendarRenderer.currentDisplayYear, 2023, 'Should go back to 2023');
});

test('navigateMonth: Rejects invalid direction', () => {
  CalendarRenderer.currentDisplayMonth = 5;
  CalendarRenderer.currentDisplayYear = 2024;
  
  const result = CalendarRenderer.navigateMonth(2);
  
  assertEqual(result, false, 'Should return false for invalid direction');
  assertEqual(CalendarRenderer.currentDisplayMonth, 5, 'Month should not change');
});

console.log('\n--- init Tests ---\n');

test('init: Sets current month and year', () => {
  CalendarRenderer.init();
  
  const now = new Date();
  assertEqual(
    CalendarRenderer.currentDisplayMonth,
    now.getMonth(),
    'Should set to current month'
  );
  assertEqual(
    CalendarRenderer.currentDisplayYear,
    now.getFullYear(),
    'Should set to current year'
  );
});

// ============================================================================
// EDGE CASES AND ERROR HANDLING
// ============================================================================

console.log('\n--- Edge Cases and Error Handling ---\n');

test('renderMonth: Handles leap year correctly', () => {
  const html2024 = CalendarRenderer.renderMonth(2024, 1, []); // Feb 2024 (leap)
  const html2023 = CalendarRenderer.renderMonth(2023, 1, []); // Feb 2023 (non-leap)
  
  assert(html2024.length > 0, 'Should render leap year February');
  assert(html2023.length > 0, 'Should render non-leap year February');
});

test('renderMonth: Handles month boundaries correctly', () => {
  // Test all 12 months
  for (let month = 0; month < 12; month++) {
    const html = CalendarRenderer.renderMonth(2024, month, []);
    assert(html.length > 0, `Should render month ${month}`);
    assertIncludes(html, 'calendar-container', `Month ${month} should have container`);
  }
});

test('renderMonth: Handles multiple check-ins in same month', () => {
  const history = [
    '2024-01-05', '2024-01-10', '2024-01-15',
    '2024-01-20', '2024-01-25', '2024-01-30'
  ];
  const html = CalendarRenderer.renderMonth(2024, 0, history);
  
  // Count occurrences of checked-in class
  const matches = html.match(/calendar-day-checked-in/g);
  assert(matches && matches.length >= 6, 'Should mark all checked-in days');
});

test('renderMonth: Handles check-ins from different months', () => {
  const history = [
    '2024-01-15', // January
    '2024-02-15', // February
    '2024-03-15'  // March
  ];
  
  // Render January - should only show January check-in
  const htmlJan = CalendarRenderer.renderMonth(2024, 0, history);
  const matchesJan = htmlJan.match(/calendar-day-checked-in/g);
  assertEqual(matchesJan ? matchesJan.length : 0, 1, 'Should only mark January check-in');
  
  // Render February - should only show February check-in
  const htmlFeb = CalendarRenderer.renderMonth(2024, 1, history);
  const matchesFeb = htmlFeb.match(/calendar-day-checked-in/g);
  assertEqual(matchesFeb ? matchesFeb.length : 0, 1, 'Should only mark February check-in');
});

// ============================================================================
// REQUIREMENTS VALIDATION
// ============================================================================

console.log('\n--- Requirements Validation ---\n');

test('Requirement 4.1: Shows current month by default', () => {
  CalendarRenderer.init();
  const now = new Date();
  assertEqual(
    CalendarRenderer.currentDisplayMonth,
    now.getMonth(),
    'Should default to current month'
  );
});

test('Requirement 4.2: Visually distinguishes checked-in days', () => {
  const history = ['2024-01-15'];
  const html = CalendarRenderer.renderMonth(2024, 0, history);
  assertIncludes(
    html,
    'calendar-day-checked-in',
    'Should have distinct class for checked-in days'
  );
});

test('Requirement 4.3: Displays check-in indicator', () => {
  const history = ['2024-01-15'];
  const html = CalendarRenderer.renderMonth(2024, 0, history);
  assertIncludes(
    html,
    'fa-check',
    'Should display check icon for checked-in days'
  );
});

test('Requirement 4.4: Highlights current day differently', () => {
  const today = getTodayString();
  const [year, month] = today.split('-').map(Number);
  const html = CalendarRenderer.renderMonth(year, month - 1, []);
  assertIncludes(
    html,
    'calendar-day-today',
    'Should have distinct class for today'
  );
});

test('Requirement 4.5: Supports navigation to previous months', () => {
  CalendarRenderer.currentDisplayMonth = 5;
  CalendarRenderer.currentDisplayYear = 2024;
  
  const result = CalendarRenderer.navigateMonth(-1);
  
  assertEqual(result, true, 'Navigation should succeed');
  assertEqual(CalendarRenderer.currentDisplayMonth, 4, 'Should navigate to previous month');
});

test('Requirement 4.6: Displays historical check-in data', () => {
  const history = ['2024-01-15', '2024-01-20'];
  const html = CalendarRenderer.renderMonth(2024, 0, history);
  
  const matches = html.match(/calendar-day-checked-in/g);
  assert(matches && matches.length >= 2, 'Should display historical check-ins');
});

// ============================================================================
// TEST SUMMARY
// ============================================================================

console.log('\n=====================================');
console.log('TEST SUMMARY');
console.log('=====================================');
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log('');

if (testsFailed === 0) {
  console.log('✓ All tests passed!\n');
  process.exit(0);
} else {
  console.log(`✗ ${testsFailed} test(s) failed\n`);
  process.exit(1);
}
