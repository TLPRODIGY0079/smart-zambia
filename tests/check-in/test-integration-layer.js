/**
 * Integration Layer Tests
 * Tests for Task 10.1: Create integration layer functions
 * 
 * Tests the enhanced integration layer with:
 * - Existence checks for external functions
 * - Fallback behavior for missing functions
 * - Input validation
 * - Error handling
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

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}: Expected ${expected}, got ${actual}`);
    testsPassed++;
  } else {
    console.log(`✗ ${message}: Expected ${expected}, got ${actual}`);
    testsFailed++;
  }
}

console.log('================================================================');
console.log('INTEGRATION LAYER TESTS');
console.log('================================================================\n');

// Ini