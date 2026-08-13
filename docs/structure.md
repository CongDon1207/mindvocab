# Project Structure Index

> Updated: 2026-08-12

## Modules

- `backend/`: Express API and local SQLite persistence.
- `frontend/`: React/Vite application.
- `docs/`: project overview and import format.

## Backend map

| Area | Location |
|:---|:---|
| SQLite startup and content-schema migration | `backend/src/config/db.js` |
| Document models | `backend/src/model/` |
| Vocabulary validation | `backend/src/utils/wordContent.js` |
| Markdown and XLSX parsers | `backend/src/utils/importParsers.js` |
| Import preview and save workflow | `backend/src/controllers/importJobController.js`, `backend/src/services/importJobService.js`, `backend/src/services/importSave.js` |
| SRS selection and scoring | `backend/src/services/srsService.js` |
| Session question generation | `backend/src/utils/questionGenerator.js` |

## Frontend map

| Area | Location |
|:---|:---|
| Folder state and API calls | `frontend/src/hooks/useFolderDetail.ts` |
| Import dialog and reports | `frontend/src/components/import/` |
| Word form and table | `frontend/src/components/word/` |
| Session steps | `frontend/src/components/session/` |

## Import contract

The vocabulary import contract is documented in `docs/format_xlsx.md`. It accepts an `.xlsx` first sheet or a pasted Markdown table with ten required headers. There is no server-side AI enrichment module.
