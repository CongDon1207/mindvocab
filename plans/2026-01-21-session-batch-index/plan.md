---
title: "Show current batch index / total in sequential session"
description: "Add a visible batch progress indicator (current batch/total batches) for 10-words-per-batch sequential study sessions."
status: completed
priority: P2
effort: 2-4h
created: 2026-01-21
completed: 2026-01-21
---

# Show current batch index / total in sequential session

## Overview
In sequential (week) session mode, the UI currently does not show which batch the learner is on. Since the session uses 10 words per batch, add a simple progress indicator like `Batch 3/12` so users can quickly track where they are.

## Requirements
- Show `currentBatchIndex/totalBatches` in the sequential session UI.
- Batch size is 10 words per batch (existing behavior).
- Indicator is visible during the session flow (not only at the end).
- Must not change learning logic, scoring, or SRS updates.

## Technical Approach
- Identify where the sequential session UI state is stored/rendered (likely `frontend/src/pages/Session.tsx` + `frontend/src/components/session/*`).
- Derive:
  - `totalBatches` from total words in session and batch size (10).
  - `currentBatchIndex` from the current step's word index / current batch pointer.
- Render a small, consistent UI element (e.g., top-right or under session title) across steps.
- Keep calculations in a single helper to avoid drift and ensure consistent display.

## Phases

### Phase 1: Locate data + define calculation ✅
- [x] Find the sequential session mode code path and where batch/word index is tracked.
- [x] Confirm the true source of batch size (should be 10) and where it is enforced.
- [x] Implement a pure helper function to compute `{ currentBatchIndex, totalBatches }`.

### Phase 2: UI integration ✅
- [x] Add the indicator to the session layout so it appears across all steps.
- [x] Ensure it updates as the user progresses.
- [x] Add basic responsive styling so it looks good on mobile.

### Phase 3: Verification ✅
- [x] Manual test: start a sequential session with >10 words; verify batch count and updates.
- [x] Edge cases: exactly 10 words, <10 words, 11 words.

## Implementation Summary

**Backend changes:**
1. Added `batchStartIndex: Number` field to Session model (`backend/src/model/Session.js:32`)
2. Updated `createSession()` to set `batchStartIndex = startOffset` for sequential mode (`backend/src/controllers/sessionController.js:123`)
3. Updated `createNextSession()` to set `batchStartIndex = startIndex` (`backend/src/controllers/sessionController.js:214`)

**Frontend changes:**
1. Created `frontend/src/lib/batch-utils.ts` with `computeBatchProgress()` helper
2. Updated `Session` type to include `batchStartIndex?: number` (`frontend/src/types/session.ts:65`)
3. Enhanced `SessionHeader` component:
   - Added `batchInfo` prop with `{ currentBatchIndex, totalBatches }`
   - Renders emerald badge with "Lô X/Y" + Layers icon when in sequential mode
   - Badge appears next to step label in top-right corner
4. Updated `Session.tsx`:
   - Imported `computeBatchProgress` from batch-utils
   - Computes `batchInfo` from `session.mode`, `session.batchStartIndex`, and `folderStats.totalWords`
   - Passes `batchInfo` to SessionHeader

**UI Design:**
- Emerald badge (`bg-emerald-100/50`, `text-emerald-600`) for visual distinction from step badge (violet)
- Layers icon for batch concept
- Text format: "Lô 3/12" (Vietnamese, concise)
- Responsive: works on mobile via existing Tailwind responsive classes

**Edge Cases Handled:**
- Only displays for `mode: 'sequential'` sessions
- Safely handles missing `batchStartIndex` or `folderStats`
- Correctly calculates batches for:
  - <10 words: 1 batch
  - Exactly 10 words: 1 batch
  - 11 words: 2 batches (10+1)
  - 120 words: 12 batches
  - 25 words: 3 batches (10+10+5)

## Risks
- Different session modes may compute progress differently; ensure indicator only appears (or is correct) for sequential mode.
- Off-by-one errors (0-based vs 1-based) when displaying `currentBatchIndex`.

## Success Criteria
- In sequential mode, user sees a correct `Batch X/Y` indicator throughout the session.
- No change to existing learning flow or data persisted to backend.
