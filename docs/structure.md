# Project: AI-Optimized Architecture

## Overview
This document describes the current architecture of **MindVocab** and provides an AI-friendly index of where to work for common tasks.
It is documentation-only (no code refactor implied).

## Tech Stack
**Frontend**
- React 19 + TypeScript
- Vite (build/dev)
- Tailwind CSS v4 + shadcn/ui (Radix UI)
- React Router
- Axios, React Hook Form, Sonner

**Backend**
- Node.js (ESM) + Express
- MongoDB (Mongoose)
- File upload: Multer
- Import parsing: `xlsx` + TXT parser
- AI enrichment: Google Gemini (provider chain)

## Proposed Directory Structure
The following tree reflects the **current, real** structure (recommended to keep as-is unless you plan a refactor):

```
mindvocab/
  README.md
  HANDOFF.md
  CHANGELOG.md
  AGENTS.md
  package.json

  backend/
    src/
      server.js
      config/
        db.js
      controllers/
        folderController.js
        wordController.js
        sessionController.js
        importJobController.js
      routes/
        folderRoute.js
        wordRoute.js
        sessionRoute.js
        importJobRoute.js
      model/
        Folder.js
        Word.js
        Session.js
        Attempt.js
        ImportJob.js
      services/
        aiProviders.js
        importJobService.js
        importPipeline.js
        importEnrich.js
        importSave.js
        providers/
          geminiProvider.js
      utils/
        fileUtils.js
        importParsers.js
        questionGenerator.js
        regex.js
    storage/
      imports/

  frontend/
    public/
      import-samples/
    src/
      App.tsx
      main.tsx
      pages/
        Folder.tsx
        FolderDetail.tsx
        Session.tsx
      components/
        folder/
        import/
        layout/
        session/
        ui/
        word/
      hooks/
        useFolderDetail.ts
      lib/
        axios.ts
        string-utils.ts
        utils.ts
      types/
        folder.ts
        word.ts
        session.ts
        import.ts

  docs/
    PROJECT_OVERVIEW.md
    format_txt.md
    format_xlsx.md
    structure.md
    structure.json

  template/
    sample.xlsx
```

## Top-Level Directory Roles
| Directory | Role | Notes |
|---|---|---|
| `backend/` | API + SRS engine | Express server, MongoDB models, import pipeline, AI enrichment |
| `frontend/` | Web UI | React pages, UI components, typed API contracts |
| `docs/` | Documentation hub | Project overview, import formats, architecture index |
| `template/` | Import templates | Sample `.xlsx` for bulk import |
| `.claude/`, `.codex/` | AI agent tooling | Skills/workflows (not app runtime) |

## Domain Concept Mapping
| Concept | Backend | Frontend | Notes |
|---|---|---|---|
| Folder | `backend/src/model/Folder.js` + `backend/src/controllers/folderController.js` | `frontend/src/types/folder.ts`, `frontend/src/pages/Folder.tsx`, `frontend/src/pages/FolderDetail.tsx` | Folder list + detail + review dashboard |
| Word | `backend/src/model/Word.js` + `backend/src/controllers/wordController.js` | `frontend/src/types/word.ts`, `frontend/src/components/word/` | CRUD + AI enrich per word |
| Session | `backend/src/model/Session.js` + `backend/src/controllers/sessionController.js` | `frontend/src/types/session.ts`, `frontend/src/pages/Session.tsx`, `frontend/src/components/session/` | 6-step learning flow |
| Attempt | `backend/src/model/Attempt.js` + `backend/src/controllers/sessionController.js` | (read-only via session UI) | Per-step answers; tied to `Session` |
| SRS / Mastery | `backend/src/controllers/sessionController.js` (SRS intervals, `nextReviewDate`, `stage`) | `frontend/src/types/folder.ts` (stats), Folder stats tab | Review forecast + stages |
| Import Job | `backend/src/model/ImportJob.js` + `backend/src/controllers/importJobController.js` | `frontend/src/types/import.ts`, `frontend/src/components/import/` | Upload, background pipeline, status/report |
| Import Pipeline | `backend/src/services/importPipeline.js` | (triggered via import UI) | Parse -> enrich -> save |
| AI Providers | `backend/src/services/aiProviders.js`, `backend/src/services/providers/geminiProvider.js` | N/A | Controlled via env (`AI_PROVIDER`, `GEMINI_API_KEY`) |

## AI Usage Guidelines
### Context Loading Priority
1. `README.md` + `docs/PROJECT_OVERVIEW.md`
2. `HANDOFF.md` (current product state)
3. `docs/structure.md` + `docs/structure.json`
4. Then jump to targeted files using the routing rules below.

### Feature Development Workflow (no refactor implied)
- Confirm domain first (Folder/Word/Session/Import/SRS).
- Update backend model/controller/route in sync.
- Update frontend `types/*` + page/component that consumes the API.
- Keep API base URL consistent (`frontend/src/lib/axios.ts` vs `backend/src/server.js`).

## File Naming Conventions
| Area | Convention | Examples |
|---|---|---|
| Backend model | `{Entity}.js` | `Word.js`, `Folder.js` |
| Backend controller | `{entity}Controller.js` | `wordController.js` |
| Backend route | `{entity}Route.js` | `sessionRoute.js` |
| Backend service | `{feature}.js` | `importPipeline.js`, `aiProviders.js` |
| Frontend page | `{Page}.tsx` | `FolderDetail.tsx`, `Session.tsx` |
| Frontend type | `{entity}.ts` | `word.ts`, `session.ts` |
| Frontend component | `{Component}.tsx` | `WordsTable.tsx`, `SessionHeader.tsx` |

## Critical Paths
### Import: file -> words saved
1. Upload via `backend/src/routes/importJobRoute.js`
2. Create job: `backend/src/services/importJobService.js`
3. Pipeline: `backend/src/services/importPipeline.js`
4. Parse: `backend/src/utils/importParsers.js`
5. Enrich: `backend/src/services/importEnrich.js` (Gemini via `backend/src/services/aiProviders.js`)
6. Save: `backend/src/services/importSave.js`

### Study session: create -> complete (SRS update)
1. Create session: `backend/src/controllers/sessionController.js` (`createSession`)
2. UI flow: `frontend/src/pages/Session.tsx` + `frontend/src/components/session/`
3. Persist step: `PUT /sessions/:id` (see `backend/src/routes/sessionRoute.js`)
4. Complete session: `POST /sessions/:id/complete` (SRS scheduling in `sessionController.js`)

## Maintenance Rules
- Update `docs/structure.json` when adding/removing routes, models, or major UI entry points.
- Keep these pairs in sync: `backend/src/model/*.js` <-> `frontend/src/types/*.ts`.
- Avoid long narrative text in JSON; keep explanations in Markdown.

