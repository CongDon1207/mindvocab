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

## Deploy (Render)
- Vite cần devDependencies trong bước build. Trên Render, nếu `npm install` bỏ qua dev deps (do `NPM_CONFIG_PRODUCTION=true`), build sẽ lỗi kiểu "Cannot find package '@vitejs/plugin-react'" khi load `vite.config.ts`.
- Cách khắc phục tối thiểu (chọn 1):
  - Đặt biến môi trường của service: `NPM_CONFIG_PRODUCTION=false` (hoặc nếu dùng Yarn: `YARN_PRODUCTION=false`) để cài devDependencies trong bước build.
  - Hoặc đặt Build Command chỉ cho frontend kèm cờ include dev:
    - npm: `cd frontend && npm ci --include=dev && npm run build`
    - yarn: `cd frontend && yarn install --frozen-lockfile --production=false && yarn build`
    - pnpm: `cd frontend && pnpm install --prod=false && pnpm build`
- Không khuyến nghị chuyển `@vitejs/plugin-react` sang `dependencies` trừ khi không thể chỉnh môi trường build.
- Repo hiện đã cập nhật script `npm run build` ở thư mục gốc để luôn thực hiện `npm ci --include=dev` trong `frontend`, nên Render chỉ cần chạy script mặc định là đủ.

## Recent Updates
- ✅ Sửa reset trạng thái session: khi chuyển sang session mới, tất cả bước được đưa về trạng thái mặc định để tránh giữ cờ hoàn thành từ phiên trước
- ✅ Migrated from JavaScript to TypeScript
- ✅ Configured Tailwind CSS v4 with Vite
- ✅ Installed shadcn/ui with TypeScript support
- ✅ Path aliases configured (@/* imports)
- ✅ SessionPage refactored into 6 reusable components (209 LOC main file)
- ✅ SummaryStep hỗ trợ tạo session 10 từ kế tiếp cho đến khi học hết folder
- ✅ Thêm nút quay lại: Session → FolderDetail, FolderDetail → Danh sách folder

## Import words (TXT/XLSX)
- API mới: `POST /api/import-jobs` nhận multipart (`folderId`, `file`, `allowUpdate?`). Trạng thái job theo chu kỳ `PENDING → PARSING → ENRICHING → SAVING → DONE/FAILED`.
- Theo dõi job: `GET /api/import-jobs/:id`, báo cáo: `GET /api/import-jobs/:id/report`.
- ENV backend: `IMPORT_MAX_SIZE_MB` (mặc định 5), `IMPORT_ENRICH_BATCH` (mặc định 20), `AI_PROVIDER` (default gemini), `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_TIMEOUT_MS`, `AI_FALLBACKS`.
- UI: `FolderDetail` có dialog upload + drawer tiến độ, liên kết mẫu tại `frontend/public/import-samples` (`sample.xlsx` hiện chỉ là placeholder, cần thay bằng file Excel thực tế trước khi release).
