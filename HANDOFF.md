# HANDOFF - mindvocab

## Current Status
✅ **Folder Management CRUD Completed** - Full CRUD operations cho folders (Create, Read, Update, Delete).
✅ **Word Management CRUD Completed** - Full CRUD operations cho words với pagination, search, filter.
✅ **FolderDetail Page Completed** - Trang chi tiết folder với quản lý từ vựng hoàn chỉnh.
✅ **Frontend-Backend Integration** - API calls hoạt động đầy đủ cho folders và words.
✅ **TypeScript Migration** - Frontend đã hoàn toàn sử dụng TypeScript với type safety.

## TODO & Next Steps
1. ~~Phát triển tính năng quản lý Folder (CRUD operations)~~ ✅ DONE
2. ~~Tích hợp API backend với frontend~~ ✅ DONE
3. ~~Implement UPDATE và DELETE operations cho folders~~ ✅ DONE
4. ~~Thêm Words management (CRUD từ vựng trong folder)~~ ✅ DONE
5. Add routing configuration cho FolderDetail page
6. Integration testing (navigate to folder, add/edit/delete words, pagination, search, filter)
7. Implement authentication/authorization
8. Thêm Learning mode (flashcard, quiz, spaced repetition)
9. Improve error handling với toast notifications (sonner đã có)
10. Add loading skeletons cho better UX

## Key Paths
### Frontend
- Source: `frontend/src/`
- UI components: `frontend/src/components/ui/` (shadcn/ui components)
- Folder components: `frontend/src/components/folder/` (FolderCard, FolderList, CreateFolderDialog, CreateFolderCard)
- Word components: `frontend/src/components/word/` (WordFormDialog, WordsTable)
- Pages: `frontend/src/pages/` (Folder.tsx, FolderDetail.tsx)
- Type definitions: `frontend/src/types/` (word.ts)
- Utilities: `frontend/src/lib/utils.ts`
- API client: `frontend/src/lib/axios.ts`
- TypeScript config: `frontend/tsconfig.json`
- Vite config: `frontend/vite.config.ts`
- Shadcn config: `frontend/components.json`

### Backend
- API routes: `backend/src/routes/` (folderRoute.js, wordRoute.js)
- Controllers: `backend/src/controllers/` (folderController.js, wordController.js)
- Models: `backend/src/model/` (Folder.js, Word.js)
- Server entry: `backend/src/server.js`
- Database config: `backend/src/config/db.js`

## Latest Test Results
- ✅ TypeScript type check: No errors (`npx tsc --noEmit`)
- ✅ Production build: Success (build time ~3.8s)
- ✅ Frontend dev server: Running on port 5173
- ✅ Backend dev server: Running on port 5001
- ✅ Folder API integration: Working (GET, POST, PUT, DELETE /api/folders)
- ✅ Word API integration: Working (GET /folders/:id/words, POST /words, PUT /words/:id, DELETE /words/:id)
- ✅ Word CRUD API tests: 11/11 passed (curl validation completed on 2025-01-28)
- ✅ FolderDetail page: Compiles without errors (2025-10-28: refactored với WordsTable component)
- ✅ WordFormDialog component: Compiles without errors
- ✅ WordsTable component: Compiles without errors (2025-10-28: tách từ FolderDetail, hiển thị đầy đủ 7 columns)
- ✅ Chrome DevTools debugging: No console errors

## API Endpoints
### Folders
- `GET /api/folders` - Lấy danh sách folders
- `GET /api/folders/:id` - Lấy folder theo ID (có stats.totalWords)
- `POST /api/folders` - Tạo folder mới
- `PUT /api/folders/:id` - Cập nhật folder
- `DELETE /api/folders/:id` - Xóa folder

### Words
- `GET /api/folders/:id/words?skip=0&limit=20&q=search&pos=noun` - Lấy danh sách words trong folder (có pagination, search, filter)
- `POST /api/words` - Tạo word mới (body: { folderId, word, pos, meaning_vi, ipa?, note?, ex1?: {en, vi, source}, ex2?: {en, vi, source} })
- `PUT /api/words/:id` - Cập nhật word (body: { word, pos, meaning_vi, ipa?, note?, ex1?, ex2? })
- `DELETE /api/words/:id` - Xóa word

## Environment
### Frontend
- Node.js: Latest
- Package manager: npm
- TypeScript: 5.9.3
- React: 19.1.1
- React Router: 7.8.1
- Vite: 7.1.7
- Tailwind CSS: 4.1.12
- shadcn/ui: Latest (New York style)
- Form: React Hook Form + Zod validation
- HTTP Client: Axios

### Backend
- Node.js: Latest
- Express: Latest
- MongoDB: Connected
- Port: 5001

## Current Features
### Folder Management
- ✅ Folder listing với pagination (7 items/page)
- ✅ Create folder với form validation (name, description, category)
- ✅ Update folder (edit name, description)
- ✅ Delete folder (xóa cả words bên trong)
- ✅ Folder cards với stats display (totalWords, mastered)
- ✅ Responsive grid layout (4 columns)
- ✅ Navigation pagination (previous/next)
- ✅ API integration với error handling

### Word Management (FolderDetail Page)
- ✅ Header hiển thị: folder name, description, totalWords
- ✅ WordsTable component: tách riêng component cho bảng từ vựng (reusable, under 300 LOC)
- ✅ Bảng từ vựng với đầy đủ columns: word + note, pos, meaning_vi, ipa, ex1 (en/vi + [Inferred] badge), ex2 (en/vi + [Inferred] badge), actions (Edit/Delete icons)
- ✅ Badge [Inferred]: hiển thị badge màu xanh cho các field có source='inferred' (ex1/ex2)
- ✅ Pagination server-side: skip/limit với navigation controls
- ✅ Search box: filter words theo text query (word, meaning_vi)
- ✅ POS filter dropdown: filter theo loại từ (noun, verb, adj, adv, etc.)
- ✅ Add word button: mở dialog thêm từ mới với đầy đủ fields (word, pos, meaning_vi, ipa, note, ex1 en/vi, ex2 en/vi)
- ✅ Edit word: click icon Edit2 trên từng dòng → mở dialog với pre-filled values (bao gồm cả ex1, ex2)
- ✅ Delete word: click icon Trash2 → xóa từ với confirmation
- ✅ Reusable WordFormDialog component: form validation (Zod), POS dropdown, textarea cho note, 2 sections cho ví dụ (ex1, ex2)
- ✅ Dialog width 700px, scrollable content để chứa đầy đủ form
- ✅ Transform ex1/ex2 fields (ex1_en, ex1_vi) → {en, vi, source:'user'} trước khi submit API
- ✅ Auto refresh danh sách sau khi add/update/delete word
- ✅ Loading states và error handling
- ✅ Route /folders/:id đã được gắn vào App.tsx

## Schemas & Contracts
### Folder Type
```typescript
type Folder = {
  _id: string
  name: string
  description?: string
  category: string
  totalWords: number
  mastered: number
  createdAt?: string
  updatedAt?: string
}
```

### Word Type
```typescript
type Word = {
  _id: string
  folderId: string
  word: string
  pos: string
  meaning_vi: string
  ipa?: string
  note?: string
  ex1?: { en: string; vi: string }
  ex2?: { en: string; vi: string }
  meta: {
    reviewCount: number
    correctCount: number
    lastReview?: string
    nextReview?: string
    easyFactor: number
  }
  createdAt: string
  updatedAt: string
}
```

### GetWordsResponse Type
```typescript
type GetWordsResponse = {
  words: Word[]
  total: number
  skip: number
  limit: number
}
```
