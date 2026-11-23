# MindVocab

MindVocab is a local vocabulary-learning application with spaced repetition (SRS), list review, and a six-step practice session.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.
- Backend: Node.js, Express, and SQLite through `node:sqlite`.

## Quick start

Requires Node.js 22.5 or newer.

```bash
npm install
npm --prefix backend ci
npm --prefix frontend ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:5001](http://localhost:5001), with a health check at [http://localhost:5001/api/health](http://localhost:5001/api/health).

For production:

```bash
npm run build
npm start
```

## Database

SQLite requires no separate server. Data is stored at `backend/data/mindvocab.sqlite` by default; set `SQLITE_DB_PATH` in `backend/.env` to use another path.

## Vocabulary import

Import either an Excel `.xlsx` file or a Markdown table pasted from ChatGPT. The header must be exactly:

```text
word | meaning_vi | pos | ipa | note | ex1_en | ex1_vi | ex2_en | ex2_vi | fill_en
```

`ipa`, `note`, and `fill_en` are optional. English examples must contain the complete vocabulary item exactly once, including punctuation that is part of the item. The app provides a button that copies the compatible ChatGPT prompt and opens ChatGPT; it does not call an AI API. See [docs/format_xlsx.md](docs/format_xlsx.md).

`ex1` and `ex2` are shown on flashcards. Fill Blank uses `fill_en` when it is natural and available; otherwise it uses `ex2_en`.

## Flashcard speech

Each English example has a listen button. Click it again to stop, or switch cards to cancel playback. Word and example playback use English voices installed on your computer; the app selects only voices that the browser reports as local. If playback reports that no local English voice is available, install an English speech voice in your operating system, restart the browser, and try again. Speech quality and available US/UK accents depend on the installed voices and browser.
