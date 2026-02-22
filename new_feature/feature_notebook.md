# Feature: Notebook Entries, Exercises, and SRS Reviews

## Overview
This document logs the implementation details for the "Notebook" feature, which allows users to create free-form notes, attach exercises via an Excel (`.xlsx`) file upload, and review those exercises continuously using a Spaced Repetition System (SRS).

## Key Capabilities Implemented
1. **CRUD for Notebook Entries**: Users can create, read, update, and delete notebook notes.
2. **Bulk Exercise Import**: Uploading an Excel file to either `append` or `replace` exercises mapped to a notebook entry. Supports both Multiple Choice Questions (`mcq`) and Fill-in-the-blank (`fill`).
3. **Spaced Repetition Review (SRS)**: Running an automated review session that calculates the score based on successful answers. If the score is >= `80%`, the SRS stage increases; otherwise, it decreases, and the `nextReviewDate` is calculated accordingly.
4. **Dashboard & UI Widgets**: Display list of notebook entries, show a queue of notebooks due for review, and a dedicated interactive quiz UI.
5. **Manual Review Scheduling**: Users can manually schedule review dates (1, 3, 7, 14, 30 days or custom) via dropdown menu - similar to folder review scheduling.
6. **Exercise List Preview**: NotebookDetail page now shows all exercises with their prompts, options, and answers - allowing users to review content before starting the quiz.

---

## Files Created & Modified

### Backend Changes (`/backend`)

#### 1. Models
- **[NEW] `src/model/NotebookEntry.js`**
  - Defines the Mongoose schema `NotebookEntry` and subdocument `ExerciseItem`.
  - Maintained fields: `title`, `content`, `exercises` (caps at 300 items), and the SRS object `meta` containing `stage`, `nextReviewDate`, `lastReviewedAt`, and `lastScore`.

#### 2. Controllers
- **[NEW/MODIFIED] `src/controllers/notebookEntryController.js`**
  - `getNotebookEntries`: Returns notebook entries, optionally filtering by `due=true`.
  - `createNotebookEntry`, `getNotebookEntryById`, `updateNotebookEntry`, `deleteNotebookEntry`.
  - `importExercises`: Parses incoming `.xlsx` files using the `xlsx` module, sanitizes formatting, detects errors down to row numbers, and appends/replaces the exercises array inside the notebook document.
  - `submitReview`: Calculates the user's score based on the current answers. It integrates predefined SRS intervals `[0, 3, 7, 14, 30, 90]` and updates `stage` respectively.
  - **[NEW]** `scheduleReview`: Manually set `meta.nextReviewDate` to X days from now, or clear it to make the notebook immediately available for review.

#### 3. Routes
- **[MODIFIED] `src/routes/notebookEntryRoute.js`**
  - Added `POST /:id/schedule` route for manual review scheduling.
  
#### 4. Server Configurations
- **[MODIFIED] `src/server.js`**
  - Registered the `/api/notebook-entries` route before the SPA root catch-all.


---

### Frontend Changes (`/frontend`)

#### 1. Type Definitions & Resources
- **[NEW] `src/types/notebook.ts`**
  - Declares the standard Interfaces (`NotebookEntry`, `ExerciseItem`) for strong typings in TypeScript.
- **[NEW] `public/import-samples/notebook-exercises.xlsx`**
  - Blank template automatically downloadable by the user for filling their own quizzes.

#### 2. Components
- **[NEW] `src/components/notebook/NotebookCard.tsx`**
  - Reusable card component for displaying notebook entries.
  - Features: Title, content preview, exercise count, SRS stage badge, review status badge.
  - Actions: Dropdown menu with schedule options (1, 3, 7, 14, 30 days + custom), delete, start review.
  - Similar design to FolderCard for UI consistency.
- **[NEW] `src/components/notebook/index.ts`**
  - Barrel export for NotebookCard.

#### 3. Layout & Global Styling
- **[MODIFIED] `src/components/layout/AppLayout.tsx`**
  - Added new links to the centralized navigation drawer/header linking to `/notebook` and `/notebook-reviews`.
- **[MODIFIED] `src/App.tsx`**
  - Registered 4 new separate React-Router links (`/notebook`, `/notebook/:id`, `/notebook/:id/review`, `/notebook-reviews`).

#### 4. Pages & UI Flow
- **[MODIFIED] `src/pages/NotebookList.tsx`**
  - Now uses NotebookCard component instead of inline cards.
  - Added `handleDelete` and `handleScheduleReview` handlers.
  - Schedule dropdown allows users to set review reminders for any notebook.
- **[MODIFIED] `src/pages/NotebookDetail.tsx`**
  - **[NEW]** Exercise List Preview section:
    - Displays all exercises with collapsible details.
    - MCQ: Shows prompt + 4 options (A-D) with correct answer highlighted.
    - Fill: Shows prompt + expected answer(s).
    - Explanation shown if available.
    - "Show all" / "Collapse" toggle for lists > 5 items.
  - Users can review all questions before starting the quiz session.
- **[MODIFIED] `src/pages/NotebookReviewsList.tsx`**
  - Now uses NotebookCard component.
  - Added `handleDelete` and `handleScheduleReview` handlers.
  - Users can reschedule due notebooks directly from the review queue (e.g., postpone to tomorrow).
- **[NEW] `src/pages/NotebookReview.tsx`**
  - The core Game Engine / Practice UI view `/notebook/:id/review`. Sequentially iterates over embedded exercises, capturing selections or inputs. Triggers the `api/../review` endpoint upon completion and drops a `canvas-confetti` effect on success.

## Environment & Dependencies
- Added `xlsx` as a dependency primarily on the Backend.
- Added `canvas-confetti` and its `@types` onto the Frontend project for gamification.
- Executed cleanup routines clearing CLI/temp files originally utilized for testing scenarios.
