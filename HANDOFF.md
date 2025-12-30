# Handoff - 2025-12-30 (Update 2)

## Current Status
- **Root Review Dashboard**: Added "Lịch ôn tập" tab to the Home page. Provides a premium overview of all review tasks across every folder, categorized by urgency.
- **SRS Statistics & Forecast**: Added a "Thống kê & Lịch ôn" tab to Folder Detail. View mastery distribution and forecast of review load for the next 30 days.
- **Frontend Refactoring**: Refactored `FolderDetail.tsx` (reduced from 400 to 135 LOC) by extracting `useFolderDetail` hook, `FolderStatsView`, and `FolderModals` components.
- **Initial Progress Fix**: Newly imported words are now correctly initialized at 0% progress.
- **Progress Sync Fix**: Home and Folder pages now correctly display mastered word counts.
- **Quiz Generation Fix**: Implemented global fallback for distractors to support small folders.
- **Session Filling Fix**: Logic updated to always fill sessions to 10 words if available.
- **Batch Progress Logic**: UI now correctly shows progress in increments of 10.
- **Session Design**: Header redesigned with card-based layout for "Total" and "Learned" word counts.
- **Dual Audio**: Flashcards now include separate buttons for US (American) and UK (British) accents.
- **SRS Implementation**: Complete. Words are now scheduled based on performance.

## Next Steps
- [ ] Implement a "Smart Review" mode on the Home page.
- [ ] Add more micro-animations to word transitions in sessions.
- [ ] Implement User Authentication.
- [ ] Add pronunciation to Quiz and Spelling steps.

## Verification
- SRS Statistics verified: Stage distribution and Review forecast correctly pull from the backend.
- Refactoring verified: Folder Detail page functions correctly with the new modular structure.
- Initial State verified: New folders now start at 0/Total progress.
- Progress Sync verified: Home page and Folder Detail show real-time mastered word counts.
- Quiz Logic verified.
- Session Creation verified.
- Dual Audio verified.
