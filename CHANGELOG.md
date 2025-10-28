# CHANGELOG - mindvocab

## 2025-01-28

### Added - Backend Word Management
- ✅ Tạo Word model (ESM syntax) tại backend/src/model/Word.js với schema: word, pos, meaning_vi, ipa, note, ex1, ex2, meta (reviewCount, correctCount, easyFactor)
- ✅ Tạo wordController.js tại backend/src/controllers/ với 4 functions: getWordsInFolder, createWord, updateWord, deleteWord
- ✅ Implement getWordsInFolder với pagination (skip/limit), search (q), filter (pos)
- ✅ Implement createWord với validation (word, pos, meaning_vi required) và auto-increment totalWords trong Folder
- ✅ Implement updateWord với partial update support
- ✅ Implement deleteWord với cascade delete và auto-decrement totalWords
- ✅ Tạo wordRoute.js tại backend/src/routes/ với 3 routes: POST /words, PUT /words/:id, DELETE /words/:id
- ✅ Thêm route GET /folders/:id/words vào folderRoute.js
- ✅ Register wordRoute trong server.js tại /api/words
- ✅ Convert Word.js từ CommonJS sang ESM syntax (import/export)

### Changed - Backend Folder Enhancement
- ✅ Enhanced getFolderById trong folderController.js - Thêm stats.totalWords bằng Word.countDocuments
- ✅ Update folderController.js - Thêm updateFolder function (PUT /folders/:id)
- ✅ Update folderController.js - Thêm deleteFolder function (DELETE /folders/:id) với cascade delete cho words

### Added - Frontend Word Management UI
- ✅ Tạo type definitions tại frontend/src/types/word.ts: Word, WordFormValues, GetWordsResponse
- ✅ Tạo WordFormDialog component tại frontend/src/components/word/WordFormDialog.tsx
- ✅ Implement WordFormDialog với React Hook Form + Zod validation
- ✅ Thêm POS select dropdown với 8 loại từ (noun, verb, adj, adv, prep, conj, pron, interj)
- ✅ Thêm fields: word*, pos*, meaning_vi*, ipa, note (textarea)
- ✅ Reusable component với props: defaultValues, title, submitButtonText
- ✅ Tạo barrel export tại frontend/src/components/word/index.ts
- ✅ Tạo FolderDetail page tại frontend/src/pages/FolderDetail.tsx (270 lines)
- ✅ Implement FolderDetail với 18 state variables: folder, words, pagination, filters, loading, error, dialog states
- ✅ Implement fetchFolder và fetchWords với auto-refresh khi page/search/filter thay đổi
- ✅ Implement handleAddWord - Gọi POST /words, refresh danh sách, close dialog
- ✅ Implement handleUpdateWord - Gọi PUT /words/:id, refresh danh sách, close dialog
- ✅ Implement handleDeleteWord - Gọi DELETE /words/:id với confirmation, refresh danh sách
- ✅ Implement pagination controls: Trước/Sau buttons, hiển thị "Trang X / Y"
- ✅ Implement search box: debounce input, reset về page 1 khi search
- ✅ Implement POS filter dropdown: reset về page 1 khi filter
- ✅ Render words table với columns: word, pos, meaning_vi, actions (Edit2/Trash2 icons từ lucide-react)
- ✅ Integrate WordFormDialog vào FolderDetail: Add dialog (title "Thêm từ mới"), Edit dialog (title "Chỉnh sửa từ", pre-filled values)

### Changed - Frontend Folder Components
- ✅ Update FolderCard.tsx - Thêm Edit2 và Trash2 buttons với onEdit/onDelete callbacks
- ✅ Reorganize folder components - Di chuyển FolderCard, FolderList, CreateFolderCard, CreateFolderDialog vào frontend/src/components/folder/
- ✅ Tạo barrel export tại frontend/src/components/folder/index.ts
- ✅ Update Folder.tsx - Refactor với clear sections: STATE MANAGEMENT, LIFECYCLE, HANDLERS, RENDER
- ✅ Update Folder.tsx - Thêm handleEditFolder và handleDeleteFolder
- ✅ Update FolderList.tsx - Extend Folder type với description, createdAt, updatedAt fields

### Fixed - TypeScript & Dependencies
- ✅ Fix import errors - Đổi 'react-router-dom' → 'react-router' (React Router v7 compatibility)
- ✅ Fix Folder type - Thêm description?, createdAt?, updatedAt? vào type definition
- ✅ Fix Word model syntax - Convert từ CommonJS (module.exports) sang ESM (export default)
- ✅ Fix compile errors - Resolve 7 TypeScript errors trong FolderDetail.tsx (unused variables là intentional)

### Testing
- ✅ Test GET /folders/:id - Trả về folder với stats.totalWords
- ✅ Test GET /folders/:id/words?skip=0&limit=20 - Trả về words với pagination
- ✅ Test GET /folders/:id/words?q=example - Search hoạt động
- ✅ Test GET /folders/:id/words?pos=noun - Filter hoạt động
- ✅ Test POST /words - Tạo word mới, totalWords tăng
- ✅ Test PUT /words/:id - Cập nhật word thành công
- ✅ Test DELETE /words/:id - Xóa word, totalWords giảm
- ✅ Test cascade delete - Xóa folder xóa cả words bên trong
- ✅ Total test cases: 11/11 passed (curl validation)

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
