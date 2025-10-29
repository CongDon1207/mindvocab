# mindvocab

## Tech Stack
### Frontend
- **Framework:** React 19.1.1
- **Language:** TypeScript 5.7+
- **Build Tool:** Vite 7.1.7
- **Styling:** Tailwind CSS v4.1.12
- **UI Components:** shadcn/ui (New York style)
- **Routing:** React Router 7.8.1
- **State & Forms:** React Hook Form
- **Notifications:** Sonner
- **HTTP Client:** Axios 1.11.0

### Backend
- Node.js + Express
- MongoDB

## Architecture
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/            # shadcn/ui base components (TypeScript)
│   │   ├── folder/        # Folder management components
│   │   ├── word/          # Word management components
│   │   └── session/       # Session learning components (6 components)
│   ├── pages/             # Page components
│   ├── lib/               # Utilities (cn helper, axios)
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
└── components.json        # shadcn/ui config
```

## Development
```bash
# Frontend
cd frontend
npm install
npm run dev      # Dev server on http://localhost:5173
npm run build    # Production build
npm run lint     # ESLint check

# TypeScript
npx tsc --noEmit # Type checking

# Add shadcn/ui components
npx shadcn@latest add <component-name>
```

## Recent Updates
- ✅ Migrated from JavaScript to TypeScript
- ✅ Configured Tailwind CSS v4 with Vite
- ✅ Installed shadcn/ui with TypeScript support
- ✅ Path aliases configured (@/* imports)
- ✅ SessionPage refactored into 6 reusable components (209 LOC main file)

## Import words (TXT/XLSX)
- API mới: `POST /api/import-jobs` nhận multipart (`folderId`, `file`, `allowUpdate?`). Trạng thái job theo chu kỳ `PENDING → PARSING → ENRICHING → SAVING → DONE/FAILED`.
- Theo dõi job: `GET /api/import-jobs/:id`, báo cáo: `GET /api/import-jobs/:id/report`.
- ENV backend: `IMPORT_MAX_SIZE_MB` (mặc định 5), `IMPORT_ENRICH_BATCH` (mặc định 20), `AI_PROVIDER` (default gemini), `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_TIMEOUT_MS`, `AI_FALLBACKS`.
- UI: `FolderDetail` có dialog upload + drawer tiến độ, liên kết mẫu tại `frontend/public/import-samples` (`sample.xlsx` hiện chỉ là placeholder, cần thay bằng file Excel thực tế trước khi release).
