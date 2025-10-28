# HANDOFF - mindvocab
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

## Current Status
✅ **BUG FIXES - Session & Quiz (Critical) - COMPLETED**
- 🐛 Fixed duplicate words trong quiz - Backend filter unique by word.toLowerCase().trim() qua Map
- 🐛 Fixed Quiz P2 không reset về câu 1 - Frontend useEffect reset state khi stepType thay đổi
- Root cause #1: Script add words tạo duplicate docs (cùng word text, khác _id) → sessionController giờ filter duplicates
- Root cause #2: QuizStep state persist khi chuyển QUIZ_PART1 → QUIZ_PART2 → thêm useEffect dependency [stepType]
- Test: Session mới với 10 từ unique ✓, Quiz P2 reset index về 0 ✓

✅ **Phase 9 (Summary Step) - COMPLETED**
- SummaryStep component hiển thị tổng kết session (Quiz P1/P2/Spelling/Fill scores)
- Badge [Inferred] cho câu fill-blank sinh bởi AI
- wrongSet review với danh sách từ sai chi tiết
- CTA: Ôn lại từ sai (navigate về FolderDetail) & Kết thúc
- Backend API POST /sessions/:id/complete - Cập nhật mastery, word metadata (lastSeenAt, difficulty)
- Mastery logic: ≥80% quiz + không trong wrongSet → folder.stats.mastered tăng

✅ **Phase 10 (UX Enhancements) - COMPLETED**
- Toast notifications (sonner) cho session start, step completion, quiz feedback, errors
- Progress bar chi tiết trong QuizStep (visual bar theo câu hiện tại)
- Skeleton loading cho WordsTable (5 skeleton rows)
- Keyboard shortcuts: 1-4, Enter (quiz), Enter (spelling) - đã có từ trước

## TODO & Next Steps
1. **Phase 11 - Spaced Repetition**: Implement SRS algorithm cập nhật meta.easyFactor và meta.nextReview (SuperMemo-2)
2. **Phase 12 - Review Notes**: Thêm note cho từ sai trong session, lưu vào reviewNotes array
3. **Phase 13 - Retry Session từ wrongSet**: Tạo session mới chỉ với wrongSet words (feature "Ôn lại từ sai")

## Current Features
### Session Learning Flow (Phases 1-8 COMPLETED)
- ✅ Session creation với 10 words (alphabetically sorted), random seed, idempotency guard
- ✅ SessionPage UI với 6-step stepper (visual progress), localStorage persistence, state machine controls
- ✅ Flashcard Step: Flip animation, prev/next nav, mark difficult, [Inferred] badges, viewed tracking
- ✅ Quiz Part 1 (VN→EN): 10 câu sequential với 4 options A-D, instant feedback, keyboard shortcuts (1-4/Enter), wrongSet merge
- ✅ Quiz Part 2 (EN→VI): Tái sử dụng QuizStep component với mode EN→VI, wrongSet merge unique
- ✅ Spelling Step: Text input với normalization, multi-round (max 3), wrongSet logic, hint (ký tự đúng vị trí)
- ✅ Fill-in-the-blank Step: Word bank 10 từ, 10 câu cloze, click-to-fill, Submit chấm điểm, highlight câu sai rõ ràng
- ✅ Question Generator: PRNG deterministic với seed, lazy generation, distractor selection (cùng POS), isInferred flag
- ✅ Session API: GET/POST/PUT sessions, POST/GET attempts, validation guards (chặn lùi bước/nhảy bước)

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

### Session Type (Backend Schema - Phase 3)
```typescript
type Question = {
  type: 'VN2EN' | 'EN2VI' | 'SPELLING' | 'FILL'
  wordId: string
  prompt: string          // meaning_vi (VN2EN) | word (EN2VI) | cloze sentence (FILL)
  options: string[]       // 4 options for quiz (empty for FILL)
  answer: string          // correct answer
  bank: string[]          // word bank for FILL (empty for quiz)
  isInferred?: boolean    // flag for inferred examples (FILL only)
}

type Session = {
  _id: string
  folderId: string
  wordIds: string[]       // 10 words (alphabetically sorted)
  step: 'FLASHCARDS' | 'QUIZ_PART1' | 'QUIZ_PART2' | 'SPELLING' | 'FILL_BLANK' | 'SUMMARY'
  wrongSet: string[]
  reviewNotes: string[]
  quizP1: { questions: Question[], score: number }
  quizP2: { questions: Question[], score: number }
  spelling: { rounds: number, correct: number, maxRounds: number }
  fillBlank: { questions: Question[], score: number }
  seed: number            // random seed for deterministic question generation
  createdAt: string
  updatedAt: string
}
```

### Question Generator (Phase 3)
- **PRNG Algorithm:** Linear Congruential Generator (LCG) với seed deterministic
- **Quiz P1 (VN→EN):** prompt = meaning_vi, answer = word, 4 options (1 đáp án + 3 nhiễu cùng POS)
- **Quiz P2 (EN→VI):** prompt = word, answer = meaning_vi, 4 options (1 đáp án + 3 nhiễu cùng POS)
- **Fill Blank:** Cloze sentences từ ex1/ex2 (ưu tiên ex1), word bank = 10 từ shuffle deterministic
- **Distractor Selection:** Ưu tiên từ cùng POS trong folder, mở rộng nếu không đủ
- **isInferred Flag:** Fill Blank questions có flag isInferred=true nếu ví dụ có source='inferred'
- **Lazy Generation:** Questions được generate lần đầu GET /api/sessions/:id, sau đó persist vào DB
