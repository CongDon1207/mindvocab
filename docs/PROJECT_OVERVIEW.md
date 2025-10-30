# 1) Big picture: what does the user experience?

Create a folder (Folder) → 2) (optional) Upload a word list to import into Words → 3) Open the folder detail to view/browse words → 4) Start a Session for a batch of 10 words → 5) Learn via 4 steps: Flashcards → Quiz (P1 & P2) → Spelling → Fill-in-the-blank → 6) Summary & progress stats update.  
During practice, every answer is recorded in **attempts**; the data import (upload) process is tracked by **import_jobs**.

---

# 2) Site map & roles

- `/` (**FoldersPage**): Folder list page.  
- `/folders/:id` (**FolderDetailPage**): A folder’s detail, word management, start a study session.  
- `/sessions/:id` (**SessionPage**): 4-step study flow for a 10-word batch, with stepper and progress.  
- `/import-jobs/:jobId` (**ImportStatusDrawer/Modal**): Panel tracking import status (typically a drawer or modal launched from FolderDetail).  
- `/words/:id` (**WordQuickEdit Modal/Drawer**) **[Inference]**: Quick edit a word (if needed).

---

# 3) Page 1 — FoldersPage (Folder list)

**Goal:** let users view, quickly find, and create a new study folder.

**Main areas**

- **Header bar:** “Your folders”.  
- **Filter/Search** **[Inference]**: an input for name/description keywords (client- or server-side filtering).  
- **Folder grid/cards (FolderCard):**  
  - Display: name, short description, `stats.totalWords`, `stats.mastered`.  
  - **Primary action:** click a card → open that folder’s **FolderDetailPage**.  
- **“Create folder” button:**  
  - Opens a dialog to enter **name** (required), **description** (optional).  
  - Confirm → call API to create **folders**; on success, navigate to the new folder’s **FolderDetailPage**.

**States & constraints**

- **Empty state:** “No folders yet. Create your first folder.”  
- **Error:** if creation fails, show a brief message; keep the user’s input intact.

**Data effects**

- Creating a folder → writes a document to **folders**.  
- Listing folders → reads from **folders** (optionally with total words refreshed when entering detail).

---

# 4) Page 2 — FolderDetailPage (Folder detail)

**Goal:** view folder info, manage word list, start a study session.

**Main areas**

### Folder header
- Folder name, description.  
- **Stats:** `totalWords`, `mastered` (from `stats` or recomputed from words).  
- **Action buttons:**
  - **Upload words:** open a wizard/select CSV/XLSX/JSON → create **import_jobs**.  
  - **Add a single word:** open a modal to input (word, pos, meaning_vi, ipa?, note?, ex1, ex2, tags…) → save to **words**.  
  - **Start learning 10 words:** create a new **Session** for a 10-word batch (prioritize words not recently studied via `meta.lastSeenAt` **[Inference]**, or simply alphabetical if no history).

### Words table
- Suggested columns: English word, POS, Vietnamese meaning, tags, `lastSeenAt`, `difficulty`, example source (`ex1.source`/`ex2.source` shows a **[Inference]** badge if `inferred`).  
- **Pagination:** skip/limit; choose rows per page.  
- **Filter/sort** **[Inference]:** by pos/tags/difficulty.  
- **Row actions:**
  - **Edit** (open QuickEdit) → patch **words**.  
  - **Delete** → confirm → delete **words**; update `folders.stats.totalWords`.

### Import status panel (drawer/modal)
- Shows **import_jobs.status** in real time (`PENDING → PARSING → ENRICHING → SAVING → DONE/FAILED`).  
- Allows opening a short **report** after DONE: total valid rows, rows “auto-completed” (ipa/note/examples) by Gemini (tagged `source:'inferred'`).

**Buttons & detailed behaviors**

#### Upload words
- Choose file → confirm → create **import_jobs** (`PENDING`) → UI shows progress, auto-refreshes on a poly-interval **[Inference]**.  
- When DONE → toast “Imported X words”, words table auto-refreshes.

#### Add a single word
- Requires **word, pos, meaning_vi**.  
- If ipa/note/examples are provided → `source:'user'`.  
- Save → insert a document into **words**; increment `stats.totalWords`.

#### Start learning 10 words
- Create **sessions**: pick 10 `wordId`; set `step:'FLASHCARDS'`, generate Quiz P1/P2 (based on `seed`).  
- Navigate to `/sessions/:id`.

**Data effects**
- Read/write **folders**, **words**.  
- Create **import_jobs** + update status during import.  
- When deleting/editing a word: update `stats.totalWords` in **folders**.

---

# 5) Page 3 — SessionPage (10-word batch with a Stepper)

**Goal:** guide learners through 4 steps, log outcomes, guarantee reproducibility via `seed`.

**Frame**
- **Session header:** folder name, current step, progress (e.g., “Step 2/4”), **Exit** button (confirm if mid-work).  
- **Stepper:** `FLASHCARDS → QUIZ_PART1 → QUIZ_PART2 → SPELLING → FILL_BLANK → SUMMARY` (summary).  
- **Progress bar:** completion % or “x/y questions”.  
- **No skipping:** only **Continue** is enabled once the current step’s criteria are met.

### Step I — Flashcards
**Goal:** familiarize with 10 words (EN, VI, short examples).  
**UI**
- A list of 10 cards (carousel or flippable grid).  
- Each card: **word + pos + ipa (if any)**, **meaning_vi**, **example ex1/en & vi**, **note** (show a **[Inference]** badge on fields with `source:'inferred'`).  
- **Buttons/Keys:**
  - **Flip card:** meaning ↔ word.  
  - **Prev / Next:** navigate cards.  
  - **Mark as hard** **[Inference]:** temporarily increase `meta.difficulty` in state; on step end, optionally persist to `words.meta.difficulty`.  
- **Continue criteria:** all 10 cards have been viewed (at least once).

**Data logging**
- No **attempts** here; optionally update `lastSeenAt` for the 10 words when moving to the next step **[Inference]**.

### Step II — Quiz Part 1 (VN → EN)
**Goal:** identify the English word from the Vietnamese meaning.  
**UI**
- Show 10 questions sequentially; each question:
  - **prompt = meaning_vi**, 4 options A–D (correct answer + 3 distractors), shuffled using `seed`.  
  - Buttons: **Choose answer**, **Skip** **[Inference]** (counted as incorrect).  
- Instant feedback (correct/incorrect).  
- **Scoring & WrongSet:**
  - On answer → write one record to **attempts** (`step:'QUIZ_PART1'`, `wordId`, `userAnswer`, `isCorrect`).  
  - If incorrect → add `wordId` to **sessions.wrongSet** (no duplicates).

**Continue criteria**
- Answer all 10 questions (no minimum passing score in P1).

### Step III — Quiz Part 2 (EN → VI)
**Goal:** reinforce meaning in the reverse direction.  
**UI & logging** like Part 1, except:
- **prompt = word**, the answer is **meaning_vi**.  
- Continue writing to **attempts** with `step:'QUIZ_PART2'`.  
- Update **quizP2.score**.

**Continue criteria**
- Answer all 10 questions. (Final pass/fail assessed at SUMMARY; e.g., ≥80% correct.)

### Step IV — Spelling
**Goal:** type the correct English spelling based on the meaning.  
**UI**
- Sequentially show **prompt = meaning_vi**; a text input field.  
- **Instant feedback:** correct/incorrect; minimal hints (e.g., number of characters in correct positions) **[Inference]**.  
- **WrongSet looping:**
  - Iterate over the words answered incorrectly (wrongSet) up to **3 rounds** (`spelling.maxRounds`).  
  - Each entry → write to **attempts** (`step:'SPELLING'`).

**Continue criteria**
- Either 3 rounds completed or wrongSet becomes empty.

### Step V — Fill-in-the-blank
**Goal:** use words in context.  
**UI**
- 10 new sentences (not reused from flashcards/quiz); each sentence with a **____** blank.  
- **Word bank = the session’s 10 words**.  
- Interaction: drag-and-drop or click-to-fill; allow edits before **Submit**.  
- On submit → grade, mark incorrect sentences (add a brief “why it’s wrong” note) **[Inference]**.  
- Write **attempts** (`step:'FILL'`), update **fillBlank.score**.

**Continue criteria**
- All 10 items submitted.

### Step VI — SUMMARY
**Content**
- Scoreboard: Quiz P1, Quiz P2, Spelling (accuracy), Fill (accuracy).  
- Remaining **WrongSet** and **reviewNotes** (phrases to remember).  
- **Review suggestions:** re-run flashcards for only wrong words; generate 2–3 extra mini-examples **[Inference]**.  
- **Update “mastery”:** if a word meets your standard (e.g., doesn’t keep appearing in wrongSet across rounds **[Inference]**) → increment `folders.stats.mastered`.  
- **Buttons:**
  - **Review wrong words:** start a new session with `wordId` in wrongSet **[Inference]**.  
  - **Finish:** navigate back to **FolderDetailPage**.

**SessionPage data effects**
- Read/write **sessions** (step, score, wrongSet, seed…).  
- Write **attempts** for each answer/input.  
- (Optional) update `words.meta.lastSeenAt/difficulty` when the session ends **[Inference]**.  
- (Optional) update `folders.stats.mastered` per your defined criteria **[Inference]**.

---

# 6) Import workflow (upload & auto-fill with Gemini)

**Goal:** quickly import data from a file, normalize it, and auto-fill missing fields.

**Flow**
1) User selects a file → create **import_jobs** with `status:'PENDING'`.  
2) Server parses the file → `status:'PARSING'`.  
3) For records missing `ipa/note/ex*`, the system calls Gemini to **ENRICH** → `status:'ENRICHING'` (auto-filled fields must be tagged `source:'inferred'`).  
4) Save each **Word** → `status:'SAVING'`.  
5) Complete → `status:'DONE'` (or `'FAILED'` if errors); **report** includes counts of valid rows, enriched rows, and errors.

**UI**
- In FolderDetail, a **drawer** shows the running job, with progress bar and error list (if any).  
- When DONE → show a notification and reload the words list.
