# ReminderSystem Guide

## Overview

The ReminderSystem module provides reminder display logic for the Daily Check-In System. It shows visual indicators and countdown timers to encourage users to check in daily.

## Features

1. **Visual Reminder Indicator** - Shows in navigation when check-in is pending
2. **Countdown Timer** - Displays time remaining until day ends
3. **Streak Protection Alerts** - More prominent reminders when streak is at risk
4. **Auto-refresh** - Updates every minute automatically
5. **Non-intrusive** - Subtle reminders that don't disrupt user experience

## Requirements Validated

- **Requirement 12.1**: Visual indicator in navigation when not checked in
- **Requirement 12.2**: Subtle reminder display
- **Requirement 12.3**: Countdown timer showing time until day ends
- **Requirement 12.4**: More prominent reminder when streak is at risk

## API Reference

### `shouldShowReminder()`

Checks if reminder should be displayed based on check-in status.

**Returns:** `boolean` - True if reminder should be shown, false otherwise

**Example:**
```javascript
if (window.ReminderSystem.shouldShowReminder()) {
  console.log('User needs to check in today');
}
```

### `updateReminderIndicator()`

Updates the visual reminder indicator in the navigation.

**Returns:** `boolean` - True if update successful, false otherwise

**Behavior:**
- Shows indicator when check-in is pending
- Uses blue color for subtle reminder (no active streak)
- Uses red color with pulse animation when streak is at risk
- Hides indicator when already checked in

**Example:**
```javascript
window.ReminderSystem.updateReminderIndicator();
```

### `calculateTimeRemaining()`

Calculates time remaining until the day ends (midnight).

**Returns:** `object` with properties:
- `hours` (number) - Hours remaining (0-23)
- `minutes` (number) - Minutes remaining (0-59)
- `seconds` (number) - Seconds remaining (0-59)
- `formatted` (string) - Formatted string (e.g., "5h 30m 15s")
- `totalMilliseconds` (number) - Total milliseconds remaining

**Example:**
```javascript
const timeLeft = window.ReminderSystem.calculateTimeRemaining();
console.log(`Time remaining: ${timeLeft.formatted}`);
console.log(`Hours: ${timeLeft.hours}, Minutes: ${timeLeft.minutes}`);
```

### `updateCountdown()`

Updates the countdown display showing time until day ends.

**Returns:** `boolean` - True if update successful, false otherwise

**Behavior:**
- Shows countdown when check-in is pending
- Hides countdown when already checked in
- Adds urgency styling (red, bold) when less than 1 hour remaining

**Example:**
```javascript
window.ReminderSystem.updateCountdown();
```

### `startCountdownTimer()`

Starts the countdown timer that updates every minute.

**Returns:** `boolean` - True if timer started successfully, false otherwise

**Example:**
```javascript
window.ReminderSystem.startCountdownTimer();
```

### `stopCountdownTimer()`

Stops the countdown timer and cleans up the interval.

**Returns:** `boolean` - True if timer stopped successfully, false otherwise

**Example:**
```javascript
window.ReminderSystem.stopCountdownTimer();
```

### `init()`

Initializes the reminder system. Called automatically by CheckInManager.

**Returns:** `boolean` - True if initialization successful, false otherwise

**Example:**
```javascript
window.ReminderSystem.init();
```

### `refresh()`

Refreshes all reminder displays (indicator and countdown).

**Returns:** `boolean` - True if refresh successful, false otherwise

**Example:**
```javascript
// Call after check-in to hide reminders
window.ReminderSystem.refresh();
```

## HTML Elements Required

The ReminderSystem expects these HTML elements to exist:

### Reminder Indicator
```html
<div id="check-in-reminder-indicator" class="w-4 h-4 rounded-full hidden"></div>
```

**Location:** Navigation bar or header

**Styling:**
- Hidden by default
- Shows as blue dot for subtle reminder
- Shows as red pulsing dot when streak is at risk

### Countdown Display
```html
<span id="check-in-countdown" class="text-purple-600">--</span>
```

**Location:** Check-in interface or dashboard

**Styling:**
- Hidden when already checked in
- Shows time in format "Xh Ym Zs"
- Turns red and bold when less than 1 hour remaining

## Integration with CheckInManager

The ReminderSystem automatically integrates with CheckInManager:

1. **Initialization**: ReminderSystem.init() is called when CheckInManager initializes
2. **After Check-In**: ReminderSystem.refresh() is called after successful check-in
3. **Auto-Update**: Countdown updates every minute automatically

## Usage Example

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>Check-In System</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <!-- Navigation with reminder indicator -->
  <nav class="flex items-center space-x-4">
    <span>Check-In</span>
    <div id="check-in-reminder-indicator" class="w-4 h-4 rounded-full hidden"></div>
  </nav>
  
  <!-- Check-in interface with countdown -->
  <div class="check-in-section">
    <h2>Daily Check-In</h2>
    <p>Time remaining: <span id="check-in-countdown">--</span></p>
    <button id="check-in-button">Check In</button>
  </div>
  
  <!-- Load check-in system -->
  <script src="js/check-in.js"></script>
</body>
</html>
```

### Manual Control

```javascript
// Manually refresh reminders
window.ReminderSystem.refresh();

// Check if reminder should show
if (window.ReminderSystem.shouldShowReminder()) {
  console.log('Reminder is active');
}

// Get time remaining
const timeLeft = window.ReminderSystem.calculateTimeRemaining();
console.log(`${timeLeft.hours} hours left to check in`);

// Stop countdown timer (e.g., when user navigates away)
window.ReminderSystem.stopCountdownTimer();

// Restart countdown timer
window.ReminderSystem.startCountdownTimer();
```

## Testing

### Manual Testing

Open `tests/check-in/manual-test-reminder-system.html` in a browser to:

1. Run automated tests
2. View visual reminder indicator
3. See countdown display in action
4. Simulate check-ins
5. Test different states (no streak, active streak, checked in)

### Test Scenarios

1. **No Check-In Today (No Streak)**
   - Indicator: Blue, subtle
   - Countdown: Visible
   - Expected: Gentle reminder

2. **No Check-In Today (Active Streak)**
   - Indicator: Red, pulsing
   - Countdown: Visible
   - Expected: Urgent reminder

3. **Already Checked In**
   - Indicator: Hidden
   - Countdown: Hidden
   - Expected: No reminders

4. **Less Than 1 Hour Remaining**
   - Indicator: Red, pulsing (if streak at risk)
   - Countdown: Red, bold
   - Expected: Urgent styling

## Best Practices

1. **Non-Intrusive**: Reminders are subtle and don't block user actions
2. **Contextual**: More prominent when streak is at risk
3. **Automatic**: Updates every minute without manual intervention
4. **Responsive**: Hides immediately after check-in
5. **Accessible**: Uses ARIA labels and semantic HTML

## Troubleshooting

### Reminder Not Showing

**Problem:** Indicator or countdown not visible

**Solutions:**
1. Check HTML elements exist with correct IDs
2. Verify check-in state is initialized
3. Check console for errors
4. Ensure ReminderSystem.init() was called

### Countdown Not Updating

**Problem:** Countdown shows but doesn't update

**Solutions:**
1. Check if timer is running: `window.ReminderSystem.countdownInterval`
2. Restart timer: `window.ReminderSystem.startCountdownTimer()`
3. Check for JavaScript errors in console

### Indicator Wrong Color

**Problem:** Indicator shows wrong color or style

**Solutions:**
1. Check current streak value in state
2. Verify check-in history is correct
3. Call `window.ReminderSystem.refresh()` to update

## Performance

- **Update Frequency**: Every 60 seconds (1 minute)
- **DOM Updates**: Minimal - only when state changes
- **Memory**: Single interval timer, cleaned up on stop
- **CPU**: Negligible - simple calculations every minute

## Future Enhancements

Potential improvements for future versions:

1. **Customizable Update Frequency**: Allow configuring update interval
2. **Sound Notifications**: Optional audio alerts for urgent reminders
3. **Browser Notifications**: Push notifications when time is running out
4. **Reminder Preferences**: User settings for reminder style and frequency
5. **Multiple Time Zones**: Support for users in different time zones

## Related Modules

- **CheckInManager**: Main check-in controller
- **UIController**: UI updates and animations
- **StreakCalculator**: Streak calculation logic
- **FreezeManager**: Streak freeze mechanics

## Support

For issues or questions:
1. Check console logs for error messages
2. Review test file for examples
3. Verify HTML elements are present
4. Check state with `console.log(window.state.checkIn)`
