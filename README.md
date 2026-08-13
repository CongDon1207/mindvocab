# MindVocab

MindVocab is a local vocabulary-learning application with spaced repetition (SRS), list review, and a six-step practice session.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.
- Backend: Node.js, Express, and SQLite through `node:sqlite`.

Node.js 22.5 or newer is required. SQLite runs locally and does not require a database server.

## Run

```bash
pnpm install
pnpm dev
```

This starts the API and Vite development server. For production:

```bash
npm run build
npm start
```

The API health check is available at [http://localhost:5001/api/health](http://localhost:5001/api/health).

## Database upgrade

Set `SQLITE_DB_PATH` in `backend/.env` to change the default `backend/data/mindvocab.sqlite` path. On the first content-schema-v2 startup, existing application data is backed up to `backend/data/backups/` and then cleared once so all vocabulary follows the new required format.

## Vocabulary import

Import either an Excel `.xlsx` file or a Markdown table pasted from ChatGPT. The header must be exactly:

```text
word | meaning_vi | pos | ipa | note | ex1_en | ex1_vi | ex2_en | ex2_vi | fill_en
```

Only `ipa` and `note` are optional. The app provides a button that copies the compatible ChatGPT prompt and opens ChatGPT; it does not call an AI API. See [docs/format_xlsx.md](docs/format_xlsx.md).

`ex1` and `ex2` are shown on flashcards. `fill_en` is held back and used only during Fill Blank.
