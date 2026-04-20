/**
 * Unit Tests for UIController Module
 * Tests UI update functions, animations, and notification handling
 * Requirements: 5.3, 6.5, 7.1, 7.2, 7.3, 8.2, 8.3, 8.5
 */

// Mock DOM environment for testing
function setupMockDOM() {
  // Create mock elements
  const mockButton = {
    disabled: false,
    textContent: '',
    classList: {
      classes: new Set(),
      add: function(...classes) {
        classes.forEach(c => this.classes.add(c));
      },
      remove: function(...classes) {
        classes.forEach(c => this.classes.delete(c));
      },
      contains: function(className) {
        return this.classes.has(className);
      }
    },
    setAttribute: function(name, value) {
      this[name] = value;
    }
  };
  
  const mockStreakCounter = {
    textContent: '0',
    classList: {
      classes: new Set(),
      add: function(...classes) {
        classes.forEach(c => this.classes.add(c));
      },
      remove: function(...classes) {
        classes.forEach(c => this.classes.delete(c));
      },
      contains: function(className) {
        return this.classes.has(className);
      }
    }
  };
  
  // Mock document.getElementById
  global.document = {
    getElementById: function(id) {
      if (id === 'check-in-button') return mockButton;
      if (id === 'streak-counter') return mockStreakCounter;
      return null;
    }
  };
  
  // Mock HTMLElement for instanceof checks
  global.HTMLElement = function() {};
  mockButton.__proto__ = HTMLElement.prototype;
  mockStreakCounter.__proto__ = HTMLElement.prototype;
  
  // Mock performance.now for animations
  global.performance = {
    now: () => Date.now()
  };
  
  // Mock requestAnimationFrame
  global.requestAnimationFrame = (callback) => {
    setTimeout(() => callback(performance.now()), 16);
  };
  
  return { mockButton, mockStreakCounter };
}

// Load the check-in module
const fs = require('fs');
const path = require('path');
const checkInCode = fs.readFileSync(
  path.join(__dirname, '../../public/js/check-in.js'),
  'utf8'
);

// Initialize global window object and localStorage before executing code
global.window = {
  state: {}
};

// Mock localStorage
global.localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  },
  clear: function() {
    this.data = {};
  }
};

// Execute in a controlled environment
eval(checkInCode);

// Get UIController from window
const UIController = window.UIController;

// ============================================================================
// TEST SUITE: updateCheckInButton
// ============================================================================

console.log('\n=== Testing UIController.updateCheckInButton ===\n');

// Test 1: Enable check-in button
console.log('Test 1: Enable check-in button');
const { mockButton: button1 } = setupMockDOM();
const result1 = UIController.updateCheckInButton(true);
console.log('Result:', result1 ? 'PASS' : 'FAIL');
console.log('Button disabled:', button1.disabled);
console.log('Button text:', button1.textContent);
console.log('Has hover class:', button1.classList.contains('hover:scale-105'));
console.assert(result1 === true, 'Should return true');
console.assert(button1.disabled === false, 'Button should be enabled');
console.assert(button1.textContent === '✓ Check In', 'Button text should be "✓ Check In"');
console.assert(button1.classList.contains('hover:scale-105'), 'Should have hover class');

// Test 2: Disable check-in button (already checked in)
console.log('\nTest 2: Disable check-in button');
const { mockButton: button2 } = setupMockDOM();
const result2 = UIController.updateCheckInButton(false);
console.log('Result:', result2 ? 'PASS' : 'FAIL');
console.log('Button disabled:', button2.disabled);
console.log('Button text:', button2.textContent);
console.log('Has opacity class:', button2.classList.contains('opacity-50'));
console.assert(result2 === true, 'Should return true');
console.assert(button2.disabled === true, 'Button should be disabled');
console.assert(button2.textContent === '✓ Checked In', 'Button text should be "✓ Checked In"');
console.assert(button2.classList.contains('opacity-50'), 'Should have opacity class');

// Test 3: Handle missing button element
console.log('\nTest 3: Handle missing button element');
global.document.getElementById = () => null;
const result3 = UIController.updateCheckInButton(true);
console.log('Result:', result3 ? 'FAIL' : 'PASS');
console.assert(result3 === false, 'Should return false when element not found');

// ============================================================================
// TEST SUITE: updateStreakDisplay
// ============================================================================

console.log('\n=== Testing UIController.updateStreakDisplay ===\n');

// Test 4: Update streak display with valid value
console.log('Test 4: Update streak display with valid value');
const { mockStreakCounter: counter1 } = setupMockDOM();
counter1.textContent = '5';
const result4 = UIController.updateStreakDisplay(10);
console.log('Result:', result4 ? 'PASS' : 'FAIL');
console.assert(result4 === true, 'Should return true');

// Test 5: Handle invalid streak value (negative)
console.log('\nTest 5: Handle invalid streak value (negative)');
setupMockDOM();
const result5 = UIController.updateStreakDisplay(-5);
console.log('Result:', result5 ? 'FAIL' : 'PASS');
console.assert(result5 === false, 'Should return false for negative value');

// Test 6: Handle invalid streak value (non-integer)
console.log('\nTest 6: Handle invalid streak value (non-integer)');
setupMockDOM();
const result6 = UIController.updateStreakDisplay(5.5);
console.log('Result:', result6 ? 'FAIL' : 'PASS');
console.assert(result6 === false, 'Should return false for non-integer value');

// Test 7: Handle missing streak counter element
console.log('\nTest 7: Handle missing streak counter element');
global.document.getElementById = () => null;
const result7 = UIController.updateStreakDisplay(10);
console.log('Result:', result7 ? 'FAIL' : 'PASS');
console.assert(result7 === false, 'Should return false when element not found');

// ============================================================================
// TEST SUITE: showCheckInSuccess
// ============================================================================

console.log('\n=== Testing UIController.showCheckInSuccess ===\n');

// Test 8: Show check-in success with toast function available
console.log('Test 8: Show check-in success with toast function');
setupMockDOM();
let toastCalled = false;
let toastMessage = '';
global.window = {
  showAchievementToast: (msg, type) => {
    toastCalled = true;
    toastMessage = msg;
  }
};
const result8 = UIController.showCheckInSuccess(50, 7);
console.log('Result:', result8 ? 'PASS' : 'FAIL');
console.log('Toast called:', toastCalled);
console.log('Toast message:', toastMessage);
console.assert(result8 === true, 'Should return true');
console.assert(toastCalled === true, 'Should call showAchievementToast');
console.assert(toastMessage.includes('50 XP'), 'Message should include XP amount');
console.assert(toastMessage.includes('7 day'), 'Message should include streak');

// Test 9: Handle missing toast function
console.log('\nTest 9: Handle missing toast function');
setupMockDOM();
global.window = {};
const result9 = UIController.showCheckInSuccess(50, 7);
console.log('Result:', result9 ? 'FAIL' : 'PASS');
console.assert(result9 === false, 'Should return false when toast function not available');

// Test 10: Handle invalid XP value
console.log('\nTest 10: Handle invalid XP value');
setupMockDOM();
const result10 = UIController.showCheckInSuccess(-10, 7);
console.log('Result:', result10 ? 'FAIL' : 'PASS');
console.assert(result10 === false, 'Should return false for negative XP');

// ============================================================================
// TEST SUITE: showMilestoneCelebration
// ============================================================================

console.log('\n=== Testing UIController.showMilestoneCelebration ===\n');

// Test 11: Show milestone celebration with confetti
console.log('Test 11: Show milestone celebration with confetti');
setupMockDOM();
let confettiCalled = false;
global.window = {
  showAchievementToast: (msg, type) => {},
  triggerConfetti: () => {
    confettiCalled = true;
  }
};
const achievement = {
  name: 'Week Warrior',
  description: 'Checked in for 7 consecutive days',
  xpBonus: 50
};
const result11 = UIController.showMilestoneCelebration(7, achievement);
console.log('Result:', result11 ? 'PASS' : 'FAIL');
console.log('Confetti called:', confettiCalled);
console.assert(result11 === true, 'Should return true');
console.assert(confettiCalled === true, 'Should trigger confetti');

// Test 12: Handle invalid milestone value
console.log('\nTest 12: Handle invalid milestone value');
setupMockDOM();
const result12 = UIController.showMilestoneCelebration(5, achievement);
console.log('Result:', result12 ? 'FAIL' : 'PASS');
console.assert(result12 === false, 'Should return false for invalid milestone');

// Test 13: Handle missing achievement object
console.log('\nTest 13: Handle missing achievement object');
setupMockDOM();
const result13 = UIController.showMilestoneCelebration(7, null);
console.log('Result:', result13 ? 'FAIL' : 'PASS');
console.assert(result13 === false, 'Should return false for null achievement');

// ============================================================================
// TEST SUITE: showFreezeNotification
// ============================================================================

console.log('\n=== Testing UIController.showFreezeNotification ===\n');

// Test 14: Show freeze used notification
console.log('Test 14: Show freeze used notification');
setupMockDOM();
let freezeMessage = '';
global.window = {
  showAchievementToast: (msg, type) => {
    freezeMessage = msg;
  }
};
const result14 = UIController.showFreezeNotification(true);
console.log('Result:', result14 ? 'PASS' : 'FAIL');
console.log('Message:', freezeMessage);
console.assert(result14 === true, 'Should return true');
console.assert(freezeMessage.includes('Freeze used'), 'Message should indicate freeze was used');

// Test 15: Show freeze available notification
console.log('\nTest 15: Show freeze available notification');
setupMockDOM();
freezeMessage = '';
global.window = {
  showAchievementToast: (msg, type) => {
    freezeMessage = msg;
  }
};
const result15 = UIController.showFreezeNotification(false);
console.log('Result:', result15 ? 'PASS' : 'FAIL');
console.log('Message:', freezeMessage);
console.assert(result15 === true, 'Should return true');
console.assert(freezeMessage.includes('available'), 'Message should indicate freeze is available');

// Test 16: Handle invalid input type
console.log('\nTest 16: Handle invalid input type');
setupMockDOM();
const result16 = UIController.showFreezeNotification('invalid');
console.log('Result:', result16 ? 'FAIL' : 'PASS');
console.assert(result16 === false, 'Should return false for invalid input type');

// ============================================================================
// TEST SUITE: updateCalendar
// ============================================================================

console.log('\n=== Testing UIController.updateCalendar ===\n');

// Test 17: Update calendar with CalendarRenderer available
console.log('Test 17: Update calendar with CalendarRenderer available');
setupMockDOM();
let calendarUpdated = false;
global.window = {
  CalendarRenderer: {
    updateCalendarDisplay: () => {
      calendarUpdated = true;
    }
  }
};
const result17 = UIController.updateCalendar();
console.log('Result:', result17 ? 'PASS' : 'FAIL');
console.log('Calendar updated:', calendarUpdated);
console.assert(result17 === true, 'Should return true');
console.assert(calendarUpdated === true, 'Should call updateCalendarDisplay');

// Test 18: Handle missing CalendarRenderer
console.log('\nTest 18: Handle missing CalendarRenderer');
setupMockDOM();
global.window = {};
const result18 = UIController.updateCalendar();
console.log('Result:', result18 ? 'FAIL' : 'PASS');
console.assert(result18 === false, 'Should return false when CalendarRenderer not available');

// ============================================================================
// TEST SUITE: animateCounter
// ============================================================================

console.log('\n=== Testing UIController.animateCounter ===\n');

// Test 19: Animate counter with valid inputs
console.log('Test 19: Animate counter with valid inputs');
const { mockStreakCounter: counter2 } = setupMockDOM();
counter2.textContent = '5';
const result19 = UIController.animateCounter(counter2, 10, 100);
console.log('Result:', result19 ? 'PASS' : 'FAIL');
console.assert(result19 === true, 'Should return true');

// Test 20: Handle same value (no animation needed)
console.log('\nTest 20: Handle same value (no animation needed)');
const { mockStreakCounter: counter3 } = setupMockDOM();
counter3.textContent = '10';
const result20 = UIController.animateCounter(counter3, 10, 100);
console.log('Result:', result20 ? 'PASS' : 'FAIL');
console.log('Counter value:', counter3.textContent);
console.assert(result20 === true, 'Should return true');
console.assert(counter3.textContent === '10', 'Value should remain 10');

// Test 21: Handle invalid element
console.log('\nTest 21: Handle invalid element');
const result21 = UIController.animateCounter(null, 10, 100);
console.log('Result:', result21 ? 'FAIL' : 'PASS');
console.assert(result21 === false, 'Should return false for null element');

// Test 22: Handle invalid target value (negative)
console.log('\nTest 22: Handle invalid target value (negative)');
const { mockStreakCounter: counter4 } = setupMockDOM();
const result22 = UIController.animateCounter(counter4, -5, 100);
console.log('Result:', result22 ? 'FAIL' : 'PASS');
console.assert(result22 === false, 'Should return false for negative target value');

// Test 23: Handle invalid duration
console.log('\nTest 23: Handle invalid duration');
const { mockStreakCounter: counter5 } = setupMockDOM();
const result23 = UIController.animateCounter(counter5, 10, -100);
console.log('Result:', result23 ? 'FAIL' : 'PASS');
console.assert(result23 === false, 'Should return false for negative duration');

// ============================================================================
// TEST SUMMARY
// ============================================================================

console.log('\n=== TEST SUMMARY ===\n');
console.log('All UIController tests completed!');
console.log('Check assertions above for any failures.');
console.log('\nUIController module provides:');
console.log('✓ updateCheckInButton - Enable/disable check-in button');
console.log('✓ updateStreakDisplay - Update streak counter with animation');
console.log('✓ showCheckInSuccess - Display success notification');
console.log('✓ showMilestoneCelebration - Show milestone celebration with confetti');
console.log('✓ showFreezeNotification - Display freeze protection message');
console.log('✓ updateCalendar - Refresh calendar display');
console.log('✓ animateCounter - Smooth number animation');
console.log('\nAll functions handle missing DOM elements gracefully.');
console.log('All functions validate inputs and provide error handling.');
