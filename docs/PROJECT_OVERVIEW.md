# MindVocab: Project Overview

MindVocab is a modern web application designed for efficient vocabulary learning. It leverages AI for content enrichment and implements Spaced Repetition (SRS) to ensure long-term retention.

---

## 🏗️ Core Architecture & User Flow

1.  **Collection Management**: Users create **Folders** to group related words.
2.  **Data Import**: Populating words via manual entry or bulk upload (CSV/XLSX/TXT). 
    - *AI Enrichment*: Missing IPA, meanings, notes, and examples are automatically generated using Gemini AI.
3.  **Spaced Repetition System (SRS)**: The system tracks learning performance to schedule review sessions based on scientific intervals (3 days, 1 week, 1 month).
4.  **Immersive Learning Sessions**: A 6-step study flow for 10-word batches:
    - **Flashcards**: Introduction with high-quality audio pronunciation.
    - **Quiz Part 1 (VN → EN)**: Semantic recognition.
    - **Quiz Part 2 (EN → VI)**: Definition recall.
    - **Spelling**: Accurate retrieval.
    - **Fill-in-the-blank**: Contextual usage.
    - **Summary**: Progress evaluation and SRS rescheduling.

---

## 📂 System Map & Modules

- **`/` (FoldersPage)**: Dashboard for managing vocabulary collections.
- **`/folders/:id` (FolderDetailPage)**: Word management, search/filter, and entry point for study sessions.
- **`/sessions/:id` (SessionPage)**: The core study engine where users interact with word batches.

---

## 🧠 Spaced Repetition & Progress Logic

Unlike simple flashcard apps, MindVocab manages word "Mastery" through a dynamic scheduling system:

### 1. SRS Stages
Each word progresses through stages based on session performance:
- **New (Stage 0)**: Freshly added words.
- **Stage 1**: Review in 3 days.
- **Stage 2**: Review in 1 week.
- **Stage 3**: Review in 2 weeks.
- **Stage 4**: Review in 1 month.
- **Mastered (Stage 5)**: High retention confidence.

*If a word is missed during a session, its stage is reset or penalized, prioritizing it for immediate review the next day.*

### 2. Session Continuity
- **10-Word Micro-batches**: Designed to maintain high focus.
- **State Persistence**: Current session progress (step and word index) is saved to the backend. You can exit midway and resume exactly where you left off.
- **Batch Selection**: When starting a study session, the system prioritizes:
  1. Words due for review (NextReviewDate <= today).
  2. "Wrong" words from previous failed attempts.
  3. New words from the folder.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Radix UI.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **AI Integration**: Google Gemini API for automated enrichment.
- **Audio**: Web Speech API for instant native-speaker pronunciation.

---

## 📈 Future Roadmap

- **Analytics Dashboard**: Detailed visualization of vocabulary growth and retention heatmaps.
- **Gamification**: Streaks, experience points (XP), and achievement badges to maintain motivation.
- **Mobile Optimization**: Progressive Web App (PWA) support for learning on the go.
