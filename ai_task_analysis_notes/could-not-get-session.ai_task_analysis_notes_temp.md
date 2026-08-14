## Metadata

`````
khi truy cạp vào một folder và upload từ thì không thể học : Could not get session
`````

``````markdown
## Bug Description

After importing vocabulary into a folder, creating a study session succeeds, but loading the session returns HTTP 500 with `Could not get session.`

## Source Code Structure

`ai-prompt-context.md` is not present. Verified project sources are a React/Vite frontend, an Express backend, and SQLite document storage. The relevant flow is FolderDetail -> POST /sessions -> GET /sessions/:id -> question generation.
``````

## Progress

- Phase: 4
- Items Processed: 11
- Total Items: 11
- Current Operation: validation complete
- Current Focus: The confirmed session-loading and table-markup defects are fixed; the requested first-learning mode remains pending clarification.

## Errors

- Reproduced for session `6c440dab-c15d-47e8-bf37-48d364145dc2`: `Fill Blank sentence must contain a broad range`.
- Reproduced for session `639b7e61-a0b9-4eed-b4a0-71d635e7e1f9`: `Fill Blank sentence must contain warranty coverage`.
- The controller catches this generator error and returns `Could not get session.`.

## Assumption Validations

- Verified that import preserves `folderId` and creates complete records.
- Verified that session creation succeeds and persisted sessions contain valid word IDs.
- Verified that imported Fill Blank sentences contain the exact target phrases and pass import validation.
- Verified that the runtime failure occurs only during question generation when an exact multi-word phrase is not recognized.

## Performance Metrics

- Database examined: 1 folder, 84 imported words, 4 failed-to-load sessions.
- All 4 persisted sessions reproduced the same class of generator failure.

## Memory Management

- No large in-memory state or memory-related failure was observed.

## Processed Files

1. `README.md`
2. `docs/structure.md`
3. `docs/PROJECT_OVERVIEW.md`
4. `docs/format_xlsx.md`
5. `frontend/src/pages/Session.tsx`
6. `frontend/src/pages/FolderDetail.tsx`
7. `frontend/src/hooks/useFolderDetail.ts`
8. `backend/src/controllers/sessionController.js`
9. `backend/src/utils/questionGenerator.js`
10. `backend/src/utils/wordContent.js`
11. `backend/src/utils/importParsers.js`

## File List

1. `frontend/src/pages/Session.tsx`
2. `frontend/src/pages/FolderDetail.tsx`
3. `frontend/src/hooks/useFolderDetail.ts`
4. `backend/src/routes/sessionRoute.js`
5. `backend/src/controllers/sessionController.js`
6. `backend/src/model/Session.js`
7. `backend/src/model/Word.js`
8. `backend/src/model/sqliteModel.js`
9. `backend/src/utils/questionGenerator.js`
10. `backend/src/utils/wordContent.js`
11. `backend/src/utils/importParsers.js`

## Knowledge Graph

### 1. `frontend/src/pages/Session.tsx`

- type: React page; evidenceLevel: verified; relevanceScore: 8
- content: Fetches `/sessions/:id` and displays the backend error.
- errorPropagation: Uses `response.data.error`, which surfaces `Could not get session.`.

### 2. `frontend/src/pages/FolderDetail.tsx`

- type: React page; evidenceLevel: verified; relevanceScore: 5
- content: Hosts import and start-learning controls through `useFolderDetail`.

### 3. `frontend/src/hooks/useFolderDetail.ts`

- type: React hook/API orchestration; evidenceLevel: verified; relevanceScore: 8
- content: Creates a session, then navigates to `/sessions/:id`.
- errorPropagation: Session creation and session retrieval are separate requests.

### 4. `backend/src/routes/sessionRoute.js`

- type: Express router; evidenceLevel: verified; relevanceScore: 7
- content: Maps POST and GET session endpoints to the controller.

### 5. `backend/src/controllers/sessionController.js`

- type: Express controller; evidenceLevel: verified; relevanceScore: 10
- content: Creates sessions, populates words, and lazily generates questions on GET.
- errorPropagation: Generator exceptions become HTTP 500 `Could not get session.` with a detail field.

### 6. `backend/src/model/Session.js`

- type: SQLite document model; evidenceLevel: verified; relevanceScore: 6
- content: Defines defaults for question arrays and session state.

### 7. `backend/src/model/Word.js`

- type: SQLite document model; evidenceLevel: verified; relevanceScore: 6
- content: Stores examples and the dedicated Fill Blank sentence.

### 8. `backend/src/model/sqliteModel.js`

- type: persistence adapter; evidenceLevel: verified; relevanceScore: 5
- content: Implements query, populate, save, and reference normalization.
- dependencyErrors: No missing references were found in the affected sessions.

### 9. `backend/src/utils/questionGenerator.js`

- type: question-generation utility; evidenceLevel: verified; relevanceScore: 10
- content: Generates quizzes and replaces a word in `fillExample.en` with a blank.
- validationLogic: `findAndReplaceWordVariant` does not recognize an exact base-form multi-word phrase such as `a broad range`.
- errorPropagation: It throws, `generateAllQuestions` rethrows, and `getSession` returns HTTP 500.

### 10. `backend/src/utils/wordContent.js`

- type: input validation utility; evidenceLevel: verified; relevanceScore: 9
- content: Correctly accepts exact multi-word phrases using an escaped case-insensitive regex.
- uncertainty: Validation and generation currently use inconsistent matching logic.

### 11. `backend/src/utils/importParsers.js`

- type: import parser; evidenceLevel: verified; relevanceScore: 7
- content: Maps rows to complete Word records with `folderId` and delegates content validation.

## Error Boundaries

`generateFillBlank` throws -> `generateAllQuestions` logs and rethrows -> `getSession` catches -> HTTP 500 `{ error: "Could not get session.", detail: ... }` -> frontend displays the generic error.

## Interaction Map

Import -> validated Word records -> POST session -> persisted Session -> GET session -> populated words -> lazy question generation -> Fill Blank phrase matcher -> failure.

## Platform Error Patterns

The project uses ordinary Express status responses and JavaScript errors; no CQRS, message bus, or platform exception abstraction exists.

## Overall Analysis

Import and persistence are working. The mismatch is between import validation, which accepts exact multi-word vocabulary, and Fill Blank generation, whose matcher handles a single token or selected inflected phrasal verbs but omits an exact base-form phrase. The first failing phrase aborts all question generation, so the session remains persisted with empty question arrays and every subsequent GET fails again.

## Root Cause Analysis

### Ranked potential root causes

1. Technical/business-logic root cause (confirmed): inconsistent phrase matching between validation and Fill Blank generation.
2. Process root cause (confirmed): no generator test covers exact multi-word vocabulary.
3. Data/environment/integration causes (rejected): imported records, references, database, and routes are valid.

## Fix Strategy

- suggestedFix: Make `findAndReplaceWordVariant` try an escaped, case-insensitive exact phrase match before token-based inflection handling.
- riskAssessment: Low; it aligns generation with the already-enforced import contract and preserves existing single-word/inflection behavior.
- regressionMitigation: Add focused tests for an exact multi-word phrase and an existing single-word case.
- testingStrategy: Run backend tests, reproduce generation for the affected persisted sessions, and run the frontend build because the API response contract is unchanged.
- rollbackPlan: Revert the matcher and its focused tests; no schema or data migration is involved.

## Debugging Validation

- Bug reproduction before the fix: `GET /api/sessions/50aa41a8-0cc7-4cca-9e15-0c58ad784067` returned HTTP 500 with detail `Fill Blank sentence must contain a broad range`.
- Fix verification after the fix: the same endpoint returned HTTP 200 with ten words, ten Quiz Part 1 questions, ten Quiz Part 2 questions, and ten Fill Blank questions.
- Mode verification: existing SRS session `639b7e61-a0b9-4eed-b4a0-71d635e7e1f9` and sequential sessions returned complete question sets.
- Data coverage: Fill Blank generation succeeded for all 84 current imported words.
- Automated regression tests: 6 of 6 backend tests passed, including new exact-phrase and single-word coverage.
- Frontend validation: the production build passed; the invalid `div` child was moved inside a table cell.
- Browser automation limitation: Playwright and Puppeteer are unavailable in the configured skill runtimes, and no new dependency was installed.
