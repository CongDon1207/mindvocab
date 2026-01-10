# Handoff - 2026-01-11

## Current Status
- **Manual Review Scheduling**: Users can now manually schedule review reminders for any folder using a dropdown menu (1 day, 3 days, 1 week, 2 weeks, 1 month, or custom days). Countdown badge shows remaining days on each folder card.
- **Custom Day Input**: Users can input any positive integer for flexible scheduling (e.g., 5, 12, 45 days).
- **Reset Progress**: Users can reset learning progress for 100% mastered folders. All words return to unlearned state (stage 0, no lastSeenAt). Reset button appears on hover in Review Dashboard.
- **Enhanced Review Dashboard**: Now displays both 100% mastered folders (auto-scheduled) AND manually scheduled folders. Visual distinction between manual ("Đặt lịch thủ công") and auto items.
- **Root Review Dashboard**: "Lịch ôn tập" tab on the Home page. Provides a premium overview of all review tasks across every folder, categorized by urgency.
- **SRS Statistics & Forecast**: "Thống kê & Lịch ôn" tab in Folder Detail. View mastery distribution and forecast of review load for the next 30 days.
- **Frontend Refactoring**: Refactored `FolderDetail.tsx` (reduced from 400 to 135 LOC) by extracting `useFolderDetail` hook, `FolderStatsView`, and `FolderModals` components.
- **SRS Implementation**: Complete. Words are now scheduled based on performance.

## Next Steps
- [ ] Implement a "Smart Review" mode on the Home page.
- [ ] Add more micro-animations to word transitions in sessions.
- [ ] Implement User Authentication.
- [ ] Add pronunciation to Quiz and Spelling steps.

## Verification
- Manual Review Scheduling verified: Dropdown menu works, countdown badge displays correctly, dashboard includes manually scheduled items.
- Custom day input verified: Dialog accepts any positive integer, validates input correctly.
- Reset progress verified: Reset button appears on hover for 100% mastered folders, confirmation dialog works, all word meta fields reset to initial state.
- SRS Statistics verified: Stage distribution and Review forecast correctly pull from the backend.
- Progress Sync verified: Home page and Folder Detail show real-time mastered word counts.
- Quiz Logic verified.
- Session Creation verified.
- Dual Audio verified.
