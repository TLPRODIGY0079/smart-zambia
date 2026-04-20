/**
 * Unit Tests for ReminderSystem
 * Tests reminder display logic, countdown calculations, and UI updates
 */

// Mock DOM environment
global.document = {
  getElementById: function(id) {
    return null; // Return null for now, will be mocked in tests
  },
  readyState: 'complete',
  addEventListener: function() {}
};

global.window = global;

// Load the check-in system
require('../../public/js/check-in.js');

// Test Suite
describe('ReminderSystem', () => {
  
  beforeEach(() => {
    // Reset state before each test
    window.state = {
      checkIn: window.getDefaultCheckInState()
    };
  });
  
  describe('shouldShowReminder', () => {
    test('should return true when user has not checked in today', () => {
      // Setup: No check-ins today
      const today = window.getTodayString();
      window.state.checkIn.checkInHistory = [];
      
      // Execute
      const result = window.ReminderSystem.shouldShowReminder();
      
      // Verify
      expect(result).toBe(true);
    });
    
    test('should return false when user has checked in today', () => {
      // Setup: Already checked in today
      const today = window.getTodayString();
      window.state.checkIn.checkInHistory = [today];
      
      // Execute
      const result = window.ReminderSystem.shouldShowReminder();
      
      // Verify
      expect(result).toBe(false);
    });
    
    test('should return true when user checked in yesterday but not today', () => {
      // Setup: Checked in yesterday only
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      window.state.checkIn.checkInHistory = [yesterdayStr];
      window.state.checkIn.lastCheckInDate = yesterdayStr;
      window.state.checkIn.currentStreak = 1;
      
      // Execute
      const result = window.ReminderSystem.shouldShowReminder();
      
      // Verify
      expect(result).toBe(true);
    });
  });
  
  describe('calculateTimeRemaining', () => {
    test('should calculate time remaining until midnight', () => {
      // Execute
      const result = window.ReminderSystem.calculateTimeRemaining();
      
      // Verify structure
      expect(result).toHaveProperty('hours');
      expect(result).toHaveProperty('minutes');
      expect(result).toHaveProperty('seconds');
      expect(result).toHaveProperty('formatted');
      expect(result).toHaveProperty('totalMilliseconds');
      
      // Verify types
      expect(typeof result.hours).toBe('number');
      expect(typeof result.minutes).toBe('number');
      expect(typeof result.seconds).toBe('number');
      expect(typeof result.formatted).toBe('string');
      expect(typeof result.totalMilliseconds).toBe('number');
      
      // Verify ranges
      expect(result.hours).toBeGreaterThanOrEqual(0);
      expect(result.hours).toBeLessThan(24);
      expect(result.minutes).toBeGreaterThanOrEqual(0);
      expect(result.minutes).toBeLessThan(60);
      expect(result.seconds).toBeGreaterThanOrEqual(0);
      expect(result.seconds).toBeLessThan(60);
      
      // Verify formatted string pattern
      expect(result.formatted).toMatch(/^\d+h \d+m \d+s$/);
    });
    
    test('should return positive time remaining', () => {
      // Execute
      const result = window.ReminderSystem.calculateTimeRemaining();
      
      // Verify
      expect(result.totalMilliseconds).toBeGreaterThan(0);
    });
    
    test('should calculate consistent time across multiple calls', () => {
      // Execute
      const result1 = window.ReminderSystem.calculateTimeRemaining();
      
      // Wait a tiny bit
      const start = Date.now();
      while (Date.now() - start < 10) {} // 10ms delay
      
      const result2 = window.ReminderSystem.calculateTimeRemaining();
      
      // Verify - should be very close (within 1 second difference)
      const diff = Math.abs(result1.totalMilliseconds - result2.totalMilliseconds);
      expect(diff).toBeLessThan(1000);
    });
  });
  
  describe('updateReminderIndicator', () => {
    test('should return false when indicator element not found', () => {
      // Setup: Mock getElementById to return null
      document.getElementById = jest.fn(() => null);
      
      // Execute
      const result = window.ReminderSystem.updateReminderIndicator();
      
      // Verify
      expect(result).toBe(false);
    });
    
    test('should show indicator when reminder should be shown', () => {
      // Setup: Mock element and state
      const mockElement = {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        setAttribute: jest.fn()
      };
      
      document.getElementById = jest.fn(() => mockElement);
      
      window.state.checkIn.checkInHistory = []; // No check-in today
      window.state.checkIn.currentStreak = 0;
      
      // Execute
      const result = window.ReminderSystem.updateReminderIndicator();
      
      // Verify
      expect(result).toBe(true);
      expect(mockElement.classList.remove).toHaveBeenCalledWith('hidden');
    });
    
    test('should hide indicator when already checked in', () => {
      // Setup: Mock element and state
      const mockElement = {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        setAttribute: jest.fn()
      };
      
      document.getElementById = jest.fn(() => mockElement);
      
      const today = window.getTodayString();
      window.state.checkIn.checkInHistory = [today]; // Already checked in
      
      // Execute
      const result = window.ReminderSystem.updateReminderIndicator();
      
      // Verify
      expect(result).toBe(true);
      expect(mockElement.classList.add).toHaveBeenCalledWith('hidden');
    });
    
    test('should use warning style when streak is at risk', () => {
      // Setup: Mock element and state
      const mockElement = {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        setAttribute: jest.fn()
      };
      
      document.getElementById = jest.fn(() => mockElement);
      
      window.state.checkIn.checkInHistory = []; // No check-in today
      window.state.checkIn.currentStreak = 5; // Active streak at risk
      
      // Execute
      const result = window.ReminderSystem.updateReminderIndicator();
      
      // Verify
      expect(result).toBe(true);
      expect(mockElement.classList.add).toHaveBeenCalledWith('animate-pulse', 'bg-red-500');
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'title',
        expect.stringContaining('5 day streak')
      );
    });
  });
  
  describe('updateCountdown', () => {
    test('should return false when countdown element not found', () => {
      // Setup: Mock getElementById to return null
      document.getElementById = jest.fn(() => null);
      
      // Execute
      const result = window.ReminderSystem.updateCountdown();
      
      // Verify
      expect(result).toBe(false);
    });
    
    test('should show countdown when reminder should be shown', () => {
      // Setup: Mock element and state
      const mockElement = {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        textContent: ''
      };
      
      document.getElementById = jest.fn(() => mockElement);
      
      window.state.checkIn.checkInHistory = []; // No check-in today
      
      // Execute
      const result = window.ReminderSystem.updateCountdown();
      
      // Verify
      expect(result).toBe(true);
      expect(mockElement.classList.remove).toHaveBeenCalledWith('hidden');
      expect(mockElement.textContent).toMatch(/^\d+h \d+m \d+s$/);
    });
    
    test('should hide countdown when already checked in', () => {
      // Setup: Mock element and state
      const mockElement = {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        textContent: ''
      };
      
      document.getElementById = jest.fn(() => mockElement);
      
      const today = window.getTodayString();
      window.state.checkIn.checkInHistory = [today]; // Already checked in
      
      // Execute
      const result = window.ReminderSystem.updateCountdown();
      
      // Verify
      expect(result).toBe(true);
      expect(mockElement.classList.add).toHaveBeenCalledWith('hidden');
    });
    
    test('should add urgency styling when less than 1 hour remaining', () => {
      // Setup: Mock element and state
      const mockElement = {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        textContent: ''
      };
      
      document.getElementById = jest.fn(() => mockElement);
      
      window.state.checkIn.checkInHistory = []; // No check-in today
      
      // Mock calculateTimeRemaining to return less than 1 hour
      const originalCalculate = window.ReminderSystem.calculateTimeRemaining;
      window.ReminderSystem.calculateTimeRemaining = jest.fn(() => ({
        hours: 0,
        minutes: 45,
        seconds: 30,
        formatted: '0h 45m 30s',
        totalMilliseconds: 2730000
      }));
      
      // Execute
      const result = window.ReminderSystem.updateCountdown();
      
      // Verify
      expect(result).toBe(true);
      expect(mockElement.classList.add).toHaveBeenCalledWith('text-red-500', 'font-bold');
      
      // Restore original function
      window.ReminderSystem.calculateTimeRemaining = originalCalculate;
    });
  });
  
  describe('refresh', () => {
    test('should update both indicator and countdown', () => {
      // Setup: Mock both functions
      const originalUpdateIndicator = window.ReminderSystem.updateReminderIndicator;
      const originalUpdateCountdown = window.ReminderSystem.updateCountdown;
      
      window.ReminderSystem.updateReminderIndicator = jest.fn(() => true);
      window.ReminderSystem.updateCountdown = jest.fn(() => true);
      
      // Execute
      const result = window.ReminderSystem.refresh();
      
      // Verify
      expect(result).toBe(true);
      expect(window.ReminderSystem.updateReminderIndicator).toHaveBeenCalled();
      expect(window.ReminderSystem.updateCountdown).toHaveBeenCalled();
      
      // Restore original functions
      window.ReminderSystem.updateReminderIndicator = originalUpdateIndicator;
      window.ReminderSystem.updateCountdown = originalUpdateCountdown;
    });
  });
  
  describe('Integration with CheckInManager', () => {
    test('should refresh reminders after successful check-in', () => {
      // Setup: Mock ReminderSystem.refresh
      const originalRefresh = window.ReminderSystem.refresh;
      window.ReminderSystem.refresh = jest.fn(() => true);
      
      // Setup: Mock addScore to avoid errors
      window.addScore = jest.fn();
      
      // Setup: State for check-in
      window.state.checkIn.checkInHistory = [];
      window.state.checkIn.currentStreak = 0;
      window.state.checkIn.lastCheckInDate = null;
      
      // Execute
      window.CheckInManager.processCheckIn();
      
      // Verify
      expect(window.ReminderSystem.refresh).toHaveBeenCalled();
      
      // Restore original function
      window.ReminderSystem.refresh = originalRefresh;
    });
  });
});

console.log('✓ ReminderSystem tests defined');
