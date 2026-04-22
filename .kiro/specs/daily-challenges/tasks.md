# Implementation Plan: Daily Challenges System

## Overview

This implementation plan breaks down the Daily Challenges System into discrete, incremental coding tasks. The system will be built as a modular JavaScript file that integrates with Smart Zambia's existing XP system, leaderboard, and achievement framework. Each task builds on previous work, following the successful pattern from the daily check-in system.

## Tasks

- [x] 1. Set up challenge module structure and data models
  - [x] 1.1 Create `public/js/daily-challenges.js` file
    - Define ChallengeState data structure with default values
    - Define CHALLENGE_CATEGORIES constant object
    - Define CHALLENGE_POOL array with initial challenges
    - Set up module initialization function
    - _Requirements: 12.6_
  
  - [x] 1.2 Create challenge data models
    - Define Challenge object structure
    - Define ChallengeState structure
    - Define category configuration
    - Create default state factory function
    - _Requirements: 2.1, 3.1_

- [-] 2. Implement data persistence layer
  - [x] 2.1 Create localStorage save and load functions
    - Implement `saveChallengeState(state)` with error handling
    - Implement `loadChallengeState()` with validation
    - Implement `getDefaultChallengeState()` factory function
    - Handle corrupted data and quota errors
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [x] 2.2 Create backend API integration
    - Implement `syncChallengeToBackend(challengeData)` function
    - Implement `fetchChallengeFromBackend()` function
    - Handle offline mode gracefully
    - Add retry logic for failed syncs
    - _Requirements: 12.5, 18.4, 18.5_
  
  - [ ] 2.3 Write unit tests for persistence
    - Test save and load cycle
    - Test corrupted data handling
    - Test offline mode
    - _Requirements: 18.1, 18.2, 18.3_

- [-] 3. Implement challenge pool management
  - [x] 3.1 Create ChallengePool module
    - Implement `getAllChallenges()` getter
    - Implement `getChallengesByCategory(category)` filter
    - Implement `getChallengesByDifficulty(difficulty)` filter
    - Implement `addChallenge(challengeData)` for admin
    - _Requirements: 2.1, 2.4, 20.1, 20.2_
  
  - [x] 3.2 Implement challenge selection algorithm
    - Implement `selectChallenge(userLevel, recentChallenges)` function
    - Filter by level appropriateness
    - Exclude recent challenges (14-day window)
    - Rotate through categories
    - _Requirements: 1.3, 2.2, 2.5, 3.1, 3.2, 3.3, 3.4_
  
  - [x] 3.3 Create initial challenge pool
    - Add 10+ Exploration challenges
    - Add 10+ Social challenges
    - Add 10+ Learning challenges
    - Add 10+ Civic challenges
    - Add 10+ Creative challenges
    - _Requirements: 2.1, 2.4, 13.1-17.5_
  
  - [ ] 3.4 Write unit tests for challenge pool
    - Test challenge selection algorithm
    - Test level filtering
    - Test category rotation
    - Test recent challenge exclusion
    - _Requirements: 1.3, 2.2, 2.5_

- [ ] 4. Checkpoint - Ensure data layer tests pass
  - Verify all persistence and pool tests pass
  - Ask user if questions arise

- [-] 5. Implement challenge assignment system
  - [x] 5.1 Create ChallengeManager module
    - Implement `init()` to load state and check for new challenge
    - Implement `assignDailyChallenge()` main assignment logic
    - Implement `getChallengeStatus()` status getter
    - Implement `needsNewChallenge()` checker
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 5.2 Implement daily reset logic
    - Check if new day (after midnight)
    - Handle timezone differences
    - Reset expired challenges
    - Assign new challenge automatically
    - _Requirements: 1.1, 8.2, 8.5_
  
  - [ ] 5.3 Write unit tests for assignment
    - Test daily reset detection
    - Test challenge assignment
    - Test timezone handling
    - _Requirements: 1.1, 1.2, 8.5_

- [ ] 6. Implement progress tracking system
  - [x] 6.1 Create ProgressTracker module
    - Implement `updateProgress(challengeId, progress)` updater
    - Implement `getProgress(challengeId)` getter
    - Implement `isCompleted(challengeId)` checker
    - Implement `trackAction(actionType, actionData)` tracker
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 6.2 Implement action tracking hooks
    - Hook into destination view events
    - Hook into review submission events
    - Hook into friend add events
    - Hook into civic report events
    - Hook into photo upload events
    - _Requirements: 13.4, 14.4, 15.4, 16.4, 17.5_
  
  - [ ] 6.3 Write unit tests for progress tracking
    - Test counter-type challenges
    - Test boolean-type challenges
    - Test collection-type challenges
    - Test progress persistence
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Implement reward calculation system
  - [x] 7.1 Create RewardCalculator module
    - Implement `calculateBaseReward(difficulty)` calculator
    - Implement `calculateTotalReward(baseXP, streak, bonuses)` calculator
    - Implement `getBonusChallengeReward(dailyReward)` calculator
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 7.3_
  
  - [ ] 7.2 Write unit tests for rewards
    - Test base reward by difficulty
    - Test streak bonus calculation
    - Test bonus challenge rewards
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [ ] 8. Implement streak management system
  - [x] 8.1 Create StreakManager module
    - Implement `getCurrentStreak()` getter
    - Implement `updateStreak()` updater
    - Implement `getStreakBonus(baseXP)` calculator
    - Implement `checkStreak()` validator
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 8.2 Write unit tests for streaks
    - Test streak increment on consecutive days
    - Test streak reset on missed days
    - Test streak bonus calculation (3, 7, 30 days)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. Checkpoint - Ensure core logic tests pass
  - Verify all assignment, progress, reward, and streak tests pass
  - Ask user if questions arise

- [ ] 10. Implement challenge completion system
  - [x] 10.1 Create completion handler
    - Implement `completeChallenge()` main completion logic
    - Validate completion criteria
    - Calculate rewards with bonuses
    - Award XP via addScore()
    - Update streak
    - Save to history
    - _Requirements: 5.1, 5.2, 5.7, 6.1, 6.2_
  
  - [x] 10.2 Implement bonus challenge unlock
    - Unlock bonus challenge on daily completion
    - Display bonus challenge with special styling
    - Handle bonus challenge completion
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 10.3 Write unit tests for completion
    - Test completion validation
    - Test reward calculation
    - Test XP awarding
    - Test bonus unlock
    - _Requirements: 5.1, 5.2, 7.1, 7.2_

- [ ] 11. Implement challenge timer system
  - [x] 11.1 Create ChallengeTimer module
    - Implement `getTimeRemaining()` calculator
    - Implement `formatTime(hours, minutes, seconds)` formatter
    - Implement `isExpired(assignedDate)` checker
    - Implement `startTimer(callback)` timer starter
    - Implement `isUrgent()` urgency checker
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 11.2 Implement timer UI updates
    - Update timer display every minute
    - Add urgent styling when < 2 hours
    - Show expiration notification
    - _Requirements: 8.1, 8.3, 8.4_
  
  - [ ] 11.3 Write unit tests for timer
    - Test time remaining calculation
    - Test expiration detection
    - Test urgency detection
    - _Requirements: 8.1, 8.2, 8.5_

- [x] 12. Implement challenge UI components
  - [x] 12.1 Create challenge card component
    - Design card layout with Tailwind CSS
    - Add category icon and color
    - Add progress bar
    - Add timer display
    - Add difficulty badge
    - Use purple/blue gradient theme
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 12.2 Create progress bar component
    - Implement animated progress bar
    - Add percentage display
    - Add smooth transitions
    - Color-code by progress level
    - _Requirements: 4.2, 9.5_
  
  - [x] 12.3 Create completion badge component
    - Design completion checkmark
    - Add celebration animation
    - Show XP earned
    - Display streak bonus
    - _Requirements: 9.3, 9.5_
  
  - [x] 12.4 Add responsive mobile styling
    - Stack cards vertically on mobile
    - Ensure touch-friendly buttons (44x44px)
    - Optimize layout for small screens
    - Test on mobile devices
    - _Requirements: 9.6, 19.1, 19.3, 19.4_

- [ ] 13. Implement UIController module
  - [x] 13.1 Create UI update functions
    - Implement `displayChallenge(challenge)` renderer
    - Implement `updateProgressBar(progress)` updater
    - Implement `showCompletionCelebration(xpEarned, streak)` celebration
    - Implement `updateTimerDisplay(timeRemaining)` timer updater
    - Implement `displayBonusChallenge(challenge)` bonus renderer
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  
  - [x] 13.2 Create challenge history view
    - Implement `showHistory(completedChallenges)` renderer
    - Display completion statistics
    - Show category breakdown
    - Display longest streak
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 13.3 Write unit tests for UI
    - Test challenge card rendering
    - Test progress bar updates
    - Test timer display
    - _Requirements: 9.1, 9.2, 9.5_

- [ ] 14. Checkpoint - Ensure UI tests pass
  - Verify all UI component tests pass
  - Test responsive behavior
  - Ask user if questions arise

- [ ] 15. Implement notification system
  - [x] 15.1 Create notification handlers
    - Implement `showNewChallengeNotification(challenge)` notifier
    - Implement `showCompletionNotification(xpEarned, streak)` notifier
    - Implement `showExpirationWarning()` notifier
    - Integrate with existing toast notification system
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ] 15.2 Write unit tests for notifications
    - Test notification display
    - Test notification timing
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 16. Implement integration with existing systems
  - [x] 16.1 Create XP system integration
    - Implement `awardChallengeXP(xpAmount)` wrapper
    - Add existence check for addScore()
    - Add fallback behavior
    - _Requirements: 5.7, 12.1_
  
  - [x] 16.2 Create leaderboard integration
    - Implement `updateLeaderboard(challengeData)` wrapper
    - Add existence check for leaderboard functions
    - _Requirements: 12.4_
  
  - [x] 16.3 Create achievement integration
    - Implement `checkChallengeAchievements()` checker
    - Check for "Well-Rounded Explorer" achievement
    - Check for "Challenge Master" achievement
    - Check for "Streak Legend" achievement
    - _Requirements: 2.3, 12.2_
  
  - [ ] 16.4 Write integration tests
    - Test XP awarding
    - Test leaderboard updates
    - Test achievement unlocking
    - _Requirements: 12.1, 12.2, 12.4_

- [ ] 17. Wire challenge system to application
  - [x] 17.1 Integrate into main application
    - Add daily-challenges.js script tag to index.html
    - Initialize ChallengeManager on page load
    - Add challenge display to dashboard or dedicated tab
    - Expose necessary functions to window object
    - Connect to existing state management
    - _Requirements: 12.6_
  
  - [x] 17.2 Add challenge tab/section to UI
    - Create dedicated challenges section
    - Add navigation link
    - Display active challenge prominently
    - Show challenge history
    - Add bonus challenge section
    - _Requirements: 1.4, 9.1, 9.2_
  
  - [ ] 17.3 Write end-to-end integration tests
    - Test full challenge flow
    - Test daily reset
    - Test progress tracking
    - Test completion and rewards
    - Test data persistence across reloads
    - _Requirements: 1.1, 1.2, 4.1, 5.1_

- [ ] 18. Implement admin challenge management
  - [ ] 18.1 Create admin interface
    - Add challenge management section to admin panel
    - Create challenge creation form
    - Create challenge editing interface
    - Add challenge enable/disable toggle
    - _Requirements: 20.1, 20.2, 20.3, 20.4_
  
  - [ ] 18.2 Implement admin functions
    - Implement `createChallenge(challengeData)` function
    - Implement `editChallenge(challengeId, updates)` function
    - Implement `deleteChallenge(challengeId)` function
    - Implement `getChallengeStats()` function
    - _Requirements: 20.1, 20.2, 20.3, 20.5_
  
  - [ ] 18.3 Add challenge statistics view
    - Display total challenges in pool
    - Show completion rates by challenge
    - Show most/least popular challenges
    - Display average completion time
    - _Requirements: 20.5_

- [ ] 19. Add celebration animations and effects
  - [ ] 19.1 Implement completion animations
    - Add confetti animation on completion
    - Add progress bar fill animation
    - Add XP counter animation
    - Add streak milestone celebrations
    - _Requirements: 5.2, 9.5_
  
  - [ ] 19.2 Optimize animations for mobile
    - Test animation performance on mobile
    - Reduce complexity on low-end devices
    - Ensure 60fps on all devices
    - _Requirements: 19.5_

- [ ] 20. Final testing and polish
  - [ ] 20.1 Run full test suite
    - Run all unit tests
    - Run all integration tests
    - Verify 80%+ code coverage
    - Fix any failing tests
    - _Requirements: All_
  
  - [ ] 20.2 Manual testing checklist
    - Test on desktop browsers (Chrome, Firefox, Safari)
    - Test on mobile devices (iOS, Android)
    - Test challenge assignment
    - Test progress tracking for all challenge types
    - Test completion and rewards
    - Test streak mechanics
    - Test bonus challenges
    - Test timer and expiration
    - Test data persistence across sessions
    - Test offline mode
    - _Requirements: All_
  
  - [ ] 20.3 Performance optimization
    - Minimize DOM manipulations
    - Optimize timer updates (every minute, not second)
    - Debounce progress updates
    - Test animation performance
    - Verify localStorage operations are efficient
    - _Requirements: 19.5_
  
  - [ ] 20.4 Create user documentation
    - Write challenge system user guide
    - Document challenge types
    - Explain streak bonuses
    - Create FAQ section
    - _Requirements: All_

- [ ] 21. Final checkpoint - Complete system verification
  - Ensure all tests pass
  - Verify all requirements met
  - Ask user if questions arise

## Notes

- Each task references specific requirements for traceability
- Tasks build incrementally on previous work
- Checkpoints ensure validation at key milestones
- The system integrates with existing Smart Zambia features (XP, achievements, leaderboard)
- Mobile responsiveness is built in from the start using Tailwind CSS
- Error handling is comprehensive to prevent data loss or crashes
- Admin functionality allows for easy content management
- Follow the successful pattern from daily check-in system implementation

## Estimated Timeline

- **Phase 1** (Tasks 1-4): Data layer and challenge pool - 4-6 hours
- **Phase 2** (Tasks 5-9): Core logic (assignment, progress, rewards, streaks) - 6-8 hours
- **Phase 3** (Tasks 10-14): Completion, timer, and UI - 6-8 hours
- **Phase 4** (Tasks 15-17): Notifications, integration, and wiring - 4-6 hours
- **Phase 5** (Tasks 18-21): Admin, animations, testing, and polish - 6-8 hours

**Total Estimated Time**: 26-36 hours (3-5 days of focused work)

## Dependencies

- Existing XP system (addScore function)
- Existing achievement system
- Existing notification system (toast)
- Existing leaderboard system (to be implemented)
- localStorage support
- Backend API (for data sync)

## Success Criteria

- [ ] Users receive a new challenge every day
- [ ] Progress tracking works for all challenge types
- [ ] Rewards are calculated correctly with streak bonuses
- [ ] UI is responsive and attractive
- [ ] Timer counts down accurately
- [ ] Data persists across sessions
- [ ] Integration with existing systems works seamlessly
- [ ] Admin can manage challenges easily
- [ ] 80%+ test coverage
- [ ] No critical bugs
