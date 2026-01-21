# Changelog

## [2026-01-21]
- **Add**: Batch progress indicator for sequential sessions - UI now displays "Lô X/Y" (e.g., "Lô 3/12") in session header for sequential mode, showing current batch and total batches (10 words per batch) at `frontend/src/components/session/SessionHeader.tsx:43-47`.
- **Add**: `batchStartIndex` field to Session model at `backend/src/model/Session.js:32` to track batch position in sequential mode.
- **Add**: `computeBatchProgress()` helper at `frontend/src/lib/batch-utils.ts` for calculating batch index from folder total words and batch start index.

## [2026-01-11]
- **Add**: Manual Review Scheduling (Forgetting Curve) - Users can now manually set review reminders for any folder (1 day, 3 days, 1 week, 2 weeks, 1 month) via dropdown menu on each folder card.
- **Add**: Custom Day Input - Users can input any number of days (e.g., 5, 12, 45) for flexible review scheduling.
- **Add**: Reset Progress Functionality - Users can reset learning progress for 100% mastered folders back to initial state. All words return to unlearned status.
- **Add**: `nextReviewDate` field to Folder model for manual scheduling support.
- **Add**: `POST /folders/:id/reset-progress` endpoint to reset all words' meta fields (lastSeenAt, stage, interval, nextReviewDate, correctCount, incorrectCount).
- **Improve**: Review Dashboard now displays both 100% mastered folders AND manually scheduled folders.
- **Add**: Countdown badge on FolderCard showing days until review (e.g., "Còn 3 ngày", "Cần ôn ngay!").
- **Add**: "Đặt lịch thủ công" indicator in Review Dashboard to distinguish manual vs auto-scheduled items.
- **Add**: Reset button (RotateCcw icon) on hover for 100% mastered folder cards in Review Dashboard.
- **UI**: Reset button positioned absolutely (top-right), only visible on hover, with confirmation dialog.

## [2026-01-07]
- **Add**: 2 chế độ học - **SRS** (ôn tập thông minh) và **Sequential** (tuần tự A-Z). Dropdown chọn mode ở nút "Bắt đầu học" trong FolderDetailHeader.
- **Fix**: Logic "bỏ qua session" (skip to next 10 words) - Đơn giản hóa: tìm minIndex của session trước + 10 = startIndex mới. Ví dụ: 1-10 → 11-20 → 21-30...

## [2025-12-30]
- **Improve**: Skill `structure-index` - Converted to English, added tech stack auto-detection (React, Vue, Node, Python, Go, etc.), custom config support (`.structure-index.json`), `validate_structure.py` for JSON schema validation, better domain detection patterns, and language statistics.

## [2025-12-30]
- **Add**: Skill `structure-index` at `.claude/skills/structure-index/` - AI architecture analyzer for generating architecture documentation (`docs/structure.md`, `docs/structure.json`). Includes `scan_context.py` script and `design_standards.md` reference.
- **Add**: AI-optimized architecture documentation at `docs/structure.md` and `docs/structure.json` - Machine-readable index with AI routing rules.

## [2025-12-30]
- **Add**: Bảng theo dõi Trí nhớ ("Lịch ôn tập") on Home page. Specifically tracks 100% mastered folders and groups them by SRS retention intervals (3 days, 7 days, 2 weeks, 1 month).
- **Add**: SRS Review Schedule & Statistics feature. Added a new tab in Folder Detail for "Thống kê & Lịch ôn" with SRS distribution and forecast charts.
- **Refactor**: Modularized `FolderDetail.tsx` (reduced from 400 to 135 LOC) by extracting `useFolderDetail` hook, `FolderStatsView`, and `FolderModals` components.
- **Fix**: Initial Progress bug for imported words. Newly imported words (with `lastSeenAt: null`) are no longer counted as mastered at the start.
- **Fix**: Progress Synchronization across Home and Folder pages. Replaced hardcoded zeros with real-time mastered word counts.
- **Fix**: Quiz Generation logic (`questionGenerator.js`). Implemented global fallback for distractors to support small folders.
- **Fix**: Session Creation logic. Now always fills up to 10 words (if available) by combining SRS-due, New, and Oldest words.
- **Add**: Batch Progress Logic. Progress (Mastered/Learned) is now only updated upon full session completion in increments of 10.
- **Add**: Card-style SessionHeader UI with dedicated counters for "Total Words" and "Learned Words".
- **Add**: Dual Audio (US/UK) support in `FlashcardStep.tsx`.
- **Add**: Spaced Repetition System (SRS) logic integration.
- **Security**: Added `.env` to `.gitignore`.
