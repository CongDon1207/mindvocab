# CHANGELOG - mindvocab

## 2025-10-28

### Added
- ✅ Tạo component CreateFolderDialog với form validation (Zod + React Hook Form) tại frontend/src/components/
- ✅ Tạo component FolderList để hiển thị danh sách folders với grid layout tại frontend/src/components/
- ✅ Tạo component FolderCard để hiển thị thông tin từng folder tại frontend/src/components/
- ✅ Tạo component CreateFolderCard cho action tạo folder mới tại frontend/src/components/
- ✅ Cài đặt shadcn/ui components: textarea, select
- ✅ Thêm axios instance với baseURL config tại frontend/src/lib/axios.ts
- ✅ Thêm type definitions cho Vite env (ImportMetaEnv, ImportMeta) tại frontend/src/vite-env.d.ts
- ✅ Implement pagination cho FolderList (7 folders/page = 2 hàng x 4 cột - 1 slot cho create card)
- ✅ Integrate API calls (GET /api/folders, POST /api/folders) với backend
- ✅ Thêm mock data (10 folders) cho testing UI

### Changed
- ✅ Update Folder.tsx page - Chuyển từ mock data sang API calls thực tế
- ✅ Update FolderList component - Thêm props folders và onCreate handler
- ✅ Improve error handling với try-catch và user-friendly messages
- ✅ Thêm loading states và disabled states cho form submission
- ✅ Update pagination logic - Auto chuyển về page 1 sau khi tạo folder mới
- ✅ Improve CreateFolderDialog - Close dialog sau khi submit thành công

### Fixed
- ✅ Fix React Router import - Đổi từ "react-router-dom" sang "react-router" (v7 compatibility)
- ✅ Fix missing CreateFolderCard component - Tạo component với dashed border và plus icon
- ✅ Fix TypeScript error "Property 'env' does not exist on type 'ImportMeta'" - Thêm interface definitions
- ✅ Fix backend route mismatch - Sửa từ "/api/Folder" sang "/api/folders" tại backend/src/server.js
- ✅ Fix 404 error "Cannot GET /api/folders" - Đồng bộ route naming giữa frontend và backend
- ✅ Debug với Chrome DevTools - Phát hiện và fix connection refused & 404 errors

### Backend
- ✅ Fix route registration - Đổi app.use('/api/Folder') → app.use('/api/folders') để match với frontend

## 2025-10-27

### Added
- ✅ Cài đặt và cấu hình TypeScript cho frontend - Migration hoàn toàn từ JS sang TS
- ✅ Cài đặt shadcn/ui với TypeScript support tại frontend/src/components/ui/
- ✅ Cấu hình Tailwind CSS v4 với Vite plugin tại frontend/vite.config.ts
- ✅ Thêm path aliases (@/*) cho TypeScript tại frontend/tsconfig.json
- ✅ Thêm type definitions cho assets (CSS, SVG, images) tại frontend/src/vite-env.d.ts

### Changed
- ✅ Convert main.jsx → main.tsx tại frontend/src/
- ✅ Convert App.jsx → App.tsx tại frontend/src/
- ✅ Convert Folder.jsx → Folder.tsx tại frontend/src/pages/
- ✅ Convert utils.js → utils.ts với proper typing tại frontend/src/lib/
- ✅ Convert vite.config.js → vite.config.ts
- ✅ Regenerate tất cả shadcn/ui components với TypeScript (button, card, dialog, dropdown-menu, form, input, label)
- ✅ Update index.html để trỏ tới main.tsx thay vì main.jsx
- ✅ Update components.json để enable TypeScript mode (tsx: true)

### Removed
- ✅ Remove jsconfig.json (replaced by tsconfig.json)
- ✅ Remove các UI components cũ bằng JavaScript

### Fixed
- ✅ Fix Tailwind CSS không hoạt động - Thêm @tailwindcss/vite plugin vào vite.config
- ✅ Fix import alias errors - Cấu hình path mapping trong tsconfig.json
- ✅ Fix TypeScript errors trong UI components - Regenerate bằng shadcn CLI
