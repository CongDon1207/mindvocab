---
title: "Notebook entries + Excel exercises + SRS reviews"
description: "Add a notebook feature (free-form title/content) with uploadable Excel exercises (MCQ/Fill) and SRS-style review scheduling."
status: draft
priority: P2
effort: 1-2d
created: 2026-02-20
---

# Notebook entries + Excel exercises + SRS reviews

## Problem
Users want a personal handbook to store grammar notes and study them over time. Notes should stay free-form, but practice should be structured (exercises) and revisited via spaced repetition.

## Goals (MVP)
- Create notebook entries with `title` + `content` (both free-form).
- Attach exercises to an entry by uploading an `.xlsx` file.
- Support 2 exercise types:
  - `mcq`: multiple choice with 4 options (A–D)
  - `fill`: fill in one blank
- Provide a review queue based on SRS (`stage` + `nextReviewDate`) and update scheduling after a review.

## Non-goals (MVP)
- Rich text / Notion-like editor
- AI-generated exercises
- Importing note content from files (only exercises are imported)
- Sharing/exporting/collaboration
- A full session flow identical to vocab sessions (keep notebook review lightweight)

## User flows
1. Create a notebook entry.
2. Write/update content.
3. Upload an Excel file to create exercises (default: replace existing exercises).
4. Open “Notebook Reviews” and select a due entry.
5. Do exercises, submit, and the entry is rescheduled.

## Data model (Backend / MongoDB)
### Model: `NotebookEntry` (`backend/src/model/NotebookEntry.js`)
- `title: string` (required, trimmed)
- `content: string` (required)
- `exercises: ExerciseItem[]` (default `[]`)
- `meta.stage: number` (0..5, default `0`)
- `meta.nextReviewDate: Date` (default `Date.now`)
- `meta.lastReviewedAt?: Date`
- `meta.lastScore?: number` (0..1)
- `timestamps: true`

### Subdocument: `ExerciseItem`
- `type: 'mcq' | 'fill'`
- `prompt: string` (required)
- `options?: { A: string; B: string; C: string; D: string }` (required for `mcq`)
- `answer: string`
  - `mcq`: `A`/`B`/`C`/`D`
  - `fill`: free text; allow multiple acceptable answers separated by `|`
- `explanation?: string` (optional)

### Validation constraints (MVP defaults)
- `prompt` max length: 500 chars
- `explanation` max length: 800 chars
- Max exercises per entry: 300

## SRS rules (Notebook)
- Intervals in days (same as existing word SRS): `SRS_INTERVALS = [0, 3, 7, 14, 30, 90]` for stages 0..5.
- Review scoring:
  - `score = correctCount / totalCount`
  - pass if `score >= 0.8`
  - pass: `stage = min(5, stage + 1)`
  - fail: `stage = max(0, stage - 1)`
  - `nextReviewDate = now + SRS_INTERVALS[stage] days`

## API (Backend)
Base: `/api/notebook-entries`

### CRUD
- `GET /api/notebook-entries`
  - query: `due=true` returns only entries where `meta.nextReviewDate <= now`
- `POST /api/notebook-entries`
  - body: `{ title: string, content: string }`
- `GET /api/notebook-entries/:id`
- `PUT /api/notebook-entries/:id`
  - body: `{ title?: string, content?: string }`
- `DELETE /api/notebook-entries/:id`

### Import exercises (Excel)
- `POST /api/notebook-entries/:id/exercises/import` (multipart/form-data)
  - fields:
    - `file`: `.xlsx`
    - `mode`: `replace | append` (optional; default: `replace`)
  - response:
    - `{ totalRows, importedCount, skippedCount, errors: Array<{ row: number, message: string }> }`

### Review submit (SRS update)
- `POST /api/notebook-entries/:id/review`
  - body: `{ correctCount: number, totalCount: number }`
  - response: `{ stage, nextReviewDate, lastScore }`

## Excel format spec (Exercise upload)
File: `.xlsx`, use the **first sheet**, first row is the header row.

### Required headers (case-insensitive)
- `type` (`mcq` or `fill`)
- `prompt`
- `answer`

### Required for MCQ rows
- `option_a`
- `option_b`
- `option_c`
- `option_d`

### Optional headers
- `explanation`

### Row rules
- Empty rows are ignored.
- `type=mcq`:
  - `answer` must be `A|B|C|D`
  - `option_a..d` must be non-empty
- `type=fill`:
  - `answer` must be non-empty
  - multiple acceptable answers can be written as `a|b|c`

### Import behavior
- Import all valid rows; collect row-level errors for invalid rows.
- If **no valid rows** exist, return `400` with the error list.
- Trim all strings; coerce cell values to strings.

### Template file
- Add a downloadable template: `frontend/public/import-samples/notebook-exercises.xlsx`.

## Frontend (React)
### Routes (`frontend/src/App.tsx`)
- `/notebook` → list/create entries
- `/notebook/:id` → edit entry + manage exercises + start review
- `/notebook-reviews` → due queue

### Navigation (`frontend/src/components/layout/AppLayout.tsx`)
- Add simple links/buttons to:
  - Notebook
  - Reviews

### Screens
1) **Notebook List**
- Create button
- List items: title, stage, next review date

2) **Notebook Detail**
- Title input
- Content textarea (free-form)
- Exercises section:
  - Upload `.xlsx` dialog
    - Import mode selector: `Replace` (default) / `Append` (when needed)
    - Show current exercise count + last import errors (if any)
  - “Start review” button (enabled when due; or always available in MVP)

3) **Notebook Review**
- Render exercises sequentially
- MCQ: A–D selection
- Fill: text input; correctness check is case-insensitive, trims whitespace, matches any acceptable answer split by `|`
- Submit results → update SRS via API → show summary and next review date

### Types
- Add `frontend/src/types/notebook.ts`:
  - `NotebookEntry`, `ExerciseItem`

## Backend implementation plan
1) Add model: `backend/src/model/NotebookEntry.js`.
2) Add controller: `backend/src/controllers/notebookEntryController.js`:
   - CRUD endpoints
   - XLSX import endpoint:
     - multer upload (xlsx only) using `resolveTempDir()`
     - parse with `xlsx`
     - apply `mode=replace|append`
     - always cleanup temp file
   - review endpoint:
     - compute score + update stage + nextReviewDate
3) Add route: `backend/src/routes/notebookEntryRoute.js`.
4) Register route in `backend/src/server.js`:
   - `app.use('/api/notebook-entries', notebookEntryRoute)`
5) Add frontend pages and basic navigation.
6) Add Excel template file to `frontend/public/import-samples/`.

## Manual verification checklist
- Create/edit/delete an entry.
- Upload a valid MCQ-only file → imported count matches.
- Upload a mixed-validity file → valid rows imported, errors contain correct row numbers.
- Review flow:
  - `8/10` correct → stage increases; next review date moves forward correctly.
  - `2/10` correct → stage decreases; next review date recalculated.
- Due queue:
  - An entry with `nextReviewDate <= now` appears in `/notebook-reviews`.
- Import modes:
  - `replace` overwrites existing exercises.
  - `append` adds and skips duplicates (define duplicate as same `type + prompt`).

## Risks / mitigations
- XLSX header drift: normalize headers (lowercase, trim, spaces→underscores).
- Large files: enforce upload size limit + max row/exercise count.
- Content rendering safety: render note content as plain text (or sanitized markdown) in MVP.

## Defaults
- Import mode default: `replace`
- Pass threshold: `0.8`
- SRS intervals: `[0, 3, 7, 14, 30, 90]`
