# MindVocab

MindVocab is a vocabulary-learning application that combines spaced repetition (SRS) with AI-assisted content enrichment.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS and shadcn/ui.
- Backend: Node.js, Express and SQLite.
- AI: Google Gemini for vocabulary enrichment.

The backend uses Node's built-in `node:sqlite` module and requires Node.js 22.5 or newer.

## Setup

Install Node.js and Git, then clone the repository:

```bash
git clone https://github.com/CongDon1207/mindvocab.git
cd mindvocab
```

Create the backend environment file:

```bash
cd backend
cp .env.example .env
```

SQLite is local and does not require a database server. By default, the database is created at `backend/data/mindvocab.sqlite`.
To use another location, set `SQLITE_DB_PATH` in `backend/.env`:

```env
SQLITE_DB_PATH=./data/mindvocab.sqlite
GEMINI_API_KEY=your_gemini_api_key
```

The database starts empty. Existing MongoDB Atlas data is not imported automatically.

## Install and run

From the repository root:

```bash
npm run build
npm start
```

The application is available at [http://localhost:5001](http://localhost:5001).
The backend health check is available at [http://localhost:5001/api/health](http://localhost:5001/api/health).

For development:

```bash
npm --prefix backend install
npm --prefix frontend install
pnpm install
pnpm dev
```

`pnpm dev` starts the backend API and the Vite frontend together.

## Import formats

- TXT: one vocabulary item per line. See [docs/format_txt.md](docs/format_txt.md).
- XLSX: use the `word` and `meaning_vi` columns, with optional `pos`, `ipa`, notes, examples and tags. See [docs/format_xlsx.md](docs/format_xlsx.md).

## Main features

- Folder and vocabulary management.
- AI-assisted IPA, meaning, note and example enrichment.
- Six-step study sessions with SRS scheduling.
- Notebook exercises and review scheduling.
- Review statistics and retention forecasts.
