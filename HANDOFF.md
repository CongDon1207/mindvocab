# Handoff - 2026-01-11

## Local Development - 2026-08-12

- Run `pnpm dev` from the repository root to start the backend API and Vite frontend together.
- Validation: the command started both nodemon and Vite; Vite served `http://localhost:5173` successfully.

## Database Migration - 2026-08-11

- Backend persistence now uses Node's built-in SQLite support through a shared document model adapter.
- The default database path is `backend/data/mindvocab.sqlite`; configure `SQLITE_DB_PATH` to override it.
- A new empty database is expected. MongoDB Atlas data is not imported.
- Runtime requirement is Node.js 22.5 or newer.
- Validation status: SQLite adapter, health endpoint, folder/word API, notebook validation, session question generation and persistence smoke tests passed. Frontend `vite build` passed; the root build command timed out during frontend `npm ci` in this environment.

## SRS Stabilization - 2026-08-12

- Sessions now distinguish SRS, sequential, and retry modes. Only SRS writes word scheduling fields.
- Completion is SQLite-transactional and idempotent; repeated completion returns the saved result without changing stages again.
- SRS selection uses overdue, due-today, then new words (up to ten), and returns `NOTHING_DUE` when the daily queue is empty.
- Validation: `npm.cmd test` in `backend` and `npm.cmd run build` in `frontend` passed.

## Session Loading Fix - 2026-08-13

- Fill Blank generation now recognizes exact multi-word vocabulary such as `a broad range`, so imported phrase sessions no longer fail with `Could not get session.`.
- The word table no longer renders a `div` directly inside a table row.
- Validation: all 84 current words generated Fill Blank questions, SRS and sequential session APIs returned ten questions per exercise, all 6 backend tests passed, and the frontend production build passed.

## Fill Blank Source and UI Fix - 2026-08-13

- Fill Blank now prefers a natural `fill_en` sentence and falls back to `ex2_en` when `fill_en` is empty or uses the legacy boilerplate template.
- Import preview and reports display non-blocking warnings for missing, boilerplate, or heavily repeated Fill Blank templates.
- Untouched, unfinished sessions refresh only legacy Fill Blank prompts; sessions with submitted Fill Blank attempts remain unchanged.
- Validation: backend tests cover source priority, import warnings, and cache refresh. Session `50aa41a8-0cc7-4cca-9e15-0c58ad784067` now has ten distinct Fill Blank prompts with no legacy boilerplate.
- Frontend build requires restoring the local frontend dependencies: `npm ci` was interrupted because `lightningcss.win32-x64-msvc.node` was locked, leaving `frontend/node_modules/.bin/vite.cmd` unavailable.

## Sequential Session Skip Fix - 2026-08-14

- The session-level skip action is available only in sequential mode.
- Skipping an unfinished sequential session now creates the next batch from the current batch offset instead of reopening the same session.
- Validation: all 10 backend tests passed, including the new next-batch regression test, and the frontend production build passed.

## Current Status
- **Content schema v2**: Vocabulary requires two flashcard examples and one dedicated Fill Blank sentence. The first startup of v2 creates a SQLite backup before clearing legacy application data once.
- **Import**: Markdown tables from ChatGPT and `.xlsx` files use the same ten-column validation and duplicate policy preview. No Gemini API configuration or enrichment endpoint remains.
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
