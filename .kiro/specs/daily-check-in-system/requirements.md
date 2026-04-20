# Requirements Document

## Introduction

The Daily Check-in System is a gamification feature designed to encourage daily user engagement with the Smart Zambia tourism platform. The system tracks consecutive login days (streaks), rewards users with escalating XP and achievements, provides visual feedback through a calendar interface, and includes streak protection mechanics to maintain user motivation. This feature integrates seamlessly with the existing XP/level system and localStorage-based data persistence.

## Glossary

- **Check_In_System**: The daily check-in tracking and reward management component
- **Streak**: A consecutive sequence of days where the user has checked in
- **Streak_Counter**: The numeric display showing current consecutive check-in days
- **Check_In_Calendar**: Visual calendar interface displaying check-in history
- **Streak_Freeze**: A grace period mechanic that prevents streak loss for one missed day
- **Milestone_Achievement**: Special achievements unlocked at specific streak thresholds (7, 30, 100 days)
- **Daily_Reward**: XP points awarded for completing a daily check-in
- **Progressive_Rewards**: Escalating reward amounts based on streak length
- **User_State**: The global application state object (window.state) containing user data
- **Local_Storage**: Browser-based persistent storage mechanism for user data
- **XP_System**: The existing experience points and leveling system
- **Achievement_System**: The existing achievement tracking and notification system
- **Toast_Notification**: Temporary popup message displaying rewards or information

## Requirements

### Requirement 1: Daily Check-In Tracking

**User Story:** As a user, I want to check in daily on the platform, so that I can track my engagement and earn rewards.

#### Acceptance Criteria

1. WHEN a user logs into the platform, THE Check_In_System SHALL detect if a check-in has already occurred for the current day
2. WHEN a user has not checked in for the current day, THE Check_In_System SHALL display a prominent check-in button
3. WHEN a user clicks the check-in button, THE Check_In_System SHALL record the check-in timestamp for the current day
4. WHEN a check-in is recorded, THE Check_In_System SHALL update the Streak_Counter based on consecutive days
5. WHEN a check-in is completed, THE Check_In_System SHALL persist the check-in data to Local_Storage immediately

### Requirement 2: Streak Calculation and Management

**User Story:** As a user, I want to see my consecutive check-in streak, so that I can track my consistency and stay motivated.

#### Acceptance Criteria

1. WHEN a user checks in on consecutive days, THE Check_In_System SHALL increment the Streak_Counter by one
2. WHEN a user misses a day without Streak_Freeze active, THE Check_In_System SHALL reset the Streak_Counter to zero
3. WHEN calculating streak status, THE Check_In_System SHALL compare the last check-in date with the current date
4. WHEN a new streak begins, THE Check_In_System SHALL initialize the Streak_Counter to one
5. THE Check_In_System SHALL store the current streak value in User_State and Local_Storage

### Requirement 3: Progressive Reward Distribution

**User Story:** As a user, I want to receive increasing rewards for longer streaks, so that I am motivated to maintain my daily check-ins.

#### Acceptance Criteria

1. WHEN a user completes a check-in on day 1, THE Check_In_System SHALL award 10 XP
2. WHEN a user completes a check-in on day 7, THE Check_In_System SHALL award 100 XP
3. WHEN a user completes a check-in on day 30, THE Check_In_System SHALL award 500 XP
4. WHEN a user completes a check-in on day 100, THE Check_In_System SHALL award 2000 XP
5. WHEN rewards are distributed, THE Check_In_System SHALL integrate with the existing XP_System using the addScore function
6. WHEN a user reaches a milestone day (7, 30, 100), THE Check_In_System SHALL award bonus XP in addition to the daily reward
7. THE Check_In_System SHALL calculate daily rewards using a progressive formula that increases with streak length

### Requirement 4: Visual Calendar Display

**User Story:** As a user, I want to see a visual calendar of my check-in history, so that I can track my progress over time.

#### Acceptance Criteria

1. WHEN the Check_In_Calendar is displayed, THE Check_In_System SHALL show the current month by default
2. WHEN rendering calendar days, THE Check_In_System SHALL visually distinguish checked-in days from non-checked-in days
3. WHEN a day has a check-in recorded, THE Check_In_Calendar SHALL display that day with a distinct color or icon
4. WHEN the current day is displayed, THE Check_In_Calendar SHALL highlight it differently from other days
5. WHEN a user navigates to previous months, THE Check_In_Calendar SHALL display historical check-in data
6. THE Check_In_Calendar SHALL display at least the current month and previous month of check-in history

### Requirement 5: Streak Freeze Protection

**User Story:** As a user, I want a grace period if I miss a day, so that I don't lose my entire streak from one mistake.

#### Acceptance Criteria

1. WHEN a user has an active streak, THE Check_In_System SHALL provide one Streak_Freeze automatically
2. WHEN a user misses one day with an active Streak_Freeze, THE Check_In_System SHALL consume the Streak_Freeze and maintain the streak
3. WHEN a Streak_Freeze is consumed, THE Check_In_System SHALL notify the user that their streak was protected
4. WHEN a user checks in after using a Streak_Freeze, THE Check_In_System SHALL restore one Streak_Freeze
5. WHEN a user misses two consecutive days, THE Check_In_System SHALL reset the streak regardless of Streak_Freeze status
6. THE Check_In_System SHALL display the Streak_Freeze status to the user (available or used)

### Requirement 6: Milestone Achievements

**User Story:** As a user, I want to unlock special achievements for reaching streak milestones, so that I feel recognized for my consistency.

#### Acceptance Criteria

1. WHEN a user reaches a 7-day streak, THE Check_In_System SHALL unlock a "Week Warrior" achievement
2. WHEN a user reaches a 30-day streak, THE Check_In_System SHALL unlock a "Monthly Master" achievement
3. WHEN a user reaches a 100-day streak, THE Check_In_System SHALL unlock a "Century Champion" achievement
4. WHEN a Milestone_Achievement is unlocked, THE Check_In_System SHALL integrate with the Achievement_System to record it
5. WHEN a Milestone_Achievement is unlocked, THE Check_In_System SHALL display a celebration animation
6. WHEN a Milestone_Achievement is unlocked, THE Check_In_System SHALL award bonus XP beyond the daily reward

### Requirement 7: Check-In User Interface

**User Story:** As a user, I want an intuitive and visually appealing check-in interface, so that the daily check-in experience is enjoyable.

#### Acceptance Criteria

1. WHEN the check-in interface is displayed, THE Check_In_System SHALL show the current Streak_Counter prominently
2. WHEN the check-in button is available, THE Check_In_System SHALL display it with clear call-to-action styling
3. WHEN a user has already checked in today, THE Check_In_System SHALL display a "checked-in" state with confirmation message
4. WHEN displaying the interface, THE Check_In_System SHALL show the next reward amount and days until next milestone
5. THE Check_In_System SHALL use the platform's purple/blue gradient theme for visual consistency
6. THE Check_In_System SHALL display smooth animations and transitions for all interactions

### Requirement 8: Reward Notifications

**User Story:** As a user, I want to see immediate feedback when I check in, so that I know my action was successful and see my rewards.

#### Acceptance Criteria

1. WHEN a check-in is completed, THE Check_In_System SHALL display a Toast_Notification showing the XP earned
2. WHEN a milestone is reached, THE Check_In_System SHALL display a special celebration notification
3. WHEN a Streak_Freeze is used, THE Check_In_System SHALL display a notification explaining the protection
4. WHEN displaying notifications, THE Check_In_System SHALL use the existing showAchievementToast function
5. WHEN a milestone is reached, THE Check_In_System SHALL trigger confetti or celebration visual effects

### Requirement 9: Data Persistence and Recovery

**User Story:** As a developer, I want check-in data to persist reliably, so that users don't lose their progress.

#### Acceptance Criteria

1. WHEN check-in data is updated, THE Check_In_System SHALL save to Local_Storage immediately
2. WHEN the application loads, THE Check_In_System SHALL restore check-in data from Local_Storage
3. WHEN restoring data, THE Check_In_System SHALL validate the data structure and handle missing or corrupted data
4. THE Check_In_System SHALL store check-in timestamps as ISO 8601 date strings
5. THE Check_In_System SHALL store the complete check-in history as an array of date strings
6. WHEN migrating to Supabase in the future, THE Check_In_System SHALL maintain compatibility with the current data structure

### Requirement 10: Mobile Responsiveness

**User Story:** As a mobile user, I want the check-in interface to work seamlessly on my device, so that I can check in from anywhere.

#### Acceptance Criteria

1. WHEN the check-in interface is displayed on mobile devices, THE Check_In_System SHALL adapt the layout for smaller screens
2. WHEN the Check_In_Calendar is displayed on mobile, THE Check_In_System SHALL ensure all days are tappable and readable
3. WHEN animations play on mobile, THE Check_In_System SHALL ensure they perform smoothly without lag
4. THE Check_In_System SHALL use touch-friendly button sizes (minimum 44x44 pixels)
5. THE Check_In_System SHALL ensure all text remains readable on small screens

### Requirement 11: Integration with Existing Systems

**User Story:** As a developer, I want the check-in system to integrate seamlessly with existing platform features, so that the codebase remains maintainable.

#### Acceptance Criteria

1. WHEN awarding XP, THE Check_In_System SHALL use the existing addScore function from the XP_System
2. WHEN unlocking achievements, THE Check_In_System SHALL use the existing Achievement_System functions
3. WHEN displaying notifications, THE Check_In_System SHALL use the existing Toast_Notification system
4. WHEN storing data, THE Check_In_System SHALL follow the existing User_State and Local_Storage patterns
5. THE Check_In_System SHALL be implemented as a modular JavaScript file in the public/js/ directory
6. THE Check_In_System SHALL expose necessary functions to the global window object for cross-module access

### Requirement 12: Check-In Reminder System

**User Story:** As a user, I want to be reminded to check in daily, so that I don't forget and lose my streak.

#### Acceptance Criteria

1. WHEN a user has not checked in for the current day, THE Check_In_System SHALL display a visual indicator in the navigation
2. WHEN the user opens the application, THE Check_In_System SHALL show a subtle reminder if no check-in has occurred today
3. THE Check_In_System SHALL display the time remaining until the day ends and check-in opportunity expires
4. WHEN a user is at risk of losing their streak, THE Check_In_System SHALL display a more prominent reminder
5. THE Check_In_System SHALL not display intrusive or annoying reminders that disrupt the user experience
