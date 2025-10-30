# CHANGELOG - mindvocab

## 2025-10-30

### Added - Sequential Session Batches
- ✅ Backend: thêm endpoint `POST /api/sessions/next` tạo session mới với 10 từ tiếp theo (lô cuối <10 nếu hết từ)
- ✅ Frontend: SummaryStep bổ sung nút "Học 10 từ kế tiếp" điều hướng sang session mới và khóa nút khi đã học hết

### Added - Navigation Shortcuts
- ✅ SessionHeader hiển thị nút quay lại FolderDetail cho session đang học
- ✅ FolderDetailHeader bổ sung nút quay lại danh sách folder

### Change - Flashcard Back Styling
- ✅ Cải thiện typography mặt sau flashcard: nghĩa chính nổi bật, ví dụ và ghi chú dễ đọc hơn
- ✅ Giữ chiều cao cố định, nội dung dài scroll trong thẻ để không đẩy navigation

### Fix - Spelling Input Focus
- ✅ Tự động focus ô nhập chính tả ngay sau khi chuyển từ mới hoặc bấm Enter/Next trong bước Spelling
## 2025-10-29

### Added - Import Pipeline (TXT/XLSX → AI → Mongo)
- ✅ Backend: thêm `ImportJob` schema, service parse TXT/XLSX, batching enrich qua Gemini (fallback-ready), lưu kết quả vào Word + cập nhật folder stats.
- ✅ API: `POST /api/import-jobs`, `GET /api/import-jobs/:id`, `GET /api/import-jobs/:id/report` với tracking counters/report.
- ✅ Frontend: `UploadWordsDialog`, `ImportStatusDrawer`, báo cáo chi tiết + toast kết quả, tích hợp tại `FolderDetail` và refactor component header/filters/pagination (<300 LOC).
- ✅ Sample TXT kèm repo; sample Excel placeholder cần thay bằng file thật trước khi release.
- ✅ Docs: cập nhật README/HANDOFF về cấu hình ENV và luồng import.
 - 📝 Docs: thêm file `format.md` mô tả chuẩn nhập liệu TXT/XLSX (headers, alias, ví dụ, checklist).

### Change - Import stability config & logs
- 🔧 Đặt mặc định an toàn trong `.env`: `IMPORT_ENRICH_BATCH=10`, `AI_TIMEOUT_MS=45000`, `AI_RETRY_LIMIT=3` để giảm timeout/cắt phản hồi khi batch lớn.
- 📈 Thêm logging quan sát: kích thước prompt/response Gemini và số phần tử phản hồi trên mỗi batch enrich.

## 2025-10-28

### Fixed - Critical Bugs (Session & Quiz)
- 🐛 Fix duplicate words bug trong createSession - Backend lọc từ trùng lặp bằng Map (key = word.toLowerCase().trim())
- 🐛 Fix Quiz Part 2 không reset về câu 1 - Thêm useEffect reset currentQuestionIndex khi stepType thay đổi
- ✅ Implement unique word filter trong sessionController - Lấy tất cả words, filter unique by word text, slice(0, 10)
- ✅ Implement stepType dependency trong QuizStep - Reset state (index=0, score=0, wrongIds=[]) khi QUIZ_PART1 → QUIZ_PART2
- ✅ Root cause: Script add words tạo duplicate documents với cùng word text nhưng khác _id
- ✅ Solution: Backend tự động filter duplicates trước khi tạo session

### Testing - Bug Fixes
- ✅ Test session mới - 10 từ unique (able, apple, big, book, call, cat, day, dog, eat, fast)
- ✅ Test Quiz P1 - Mỗi từ chỉ xuất hiện 1 lần (không còn double)
- ✅ Verify Quiz P2 reset - currentQuestionIndex về 0 khi chuyển từ P1 sang P2
- ✅ TypeScript compile - No errors

## 2025-10-28

### Added - Summary Step (Phase 9 - Frontend + Backend)
- ✅ Tạo SummaryStep component tại frontend/src/components/session/SummaryStep.tsx (240 lines)
- ✅ Implement tổng hợp điểm: Quiz P1+P2 (total/20, %), Spelling (correct count, rounds), Fill Blank (score/10, %)
- ✅ Implement badge [Inferred] count - Hiển thị số câu fill-blank có nguồn AI-generated
- ✅ Implement wrongSet review - Card hiển thị danh sách từ sai với word, pos, meaning_vi, note
- ✅ Implement CTAs: "Ôn lại từ sai" (navigate về FolderDetail với retryWords state), "Kết thúc" (về FolderDetail)
- ✅ Implement performance insight - Nhận xét dựa trên quiz percentage (xuất sắc ≥80% & no wrong, khá tốt ≥80%, cần cải thiện ≥60%, cần cố gắng <60%)
- ✅ Implement auto mastery update - useEffect gọi POST /sessions/:id/complete khi component mount
- ✅ Backend: Tạo completeSession endpoint tại backend/src/controllers/sessionController.js
- ✅ Backend: Mastery logic - Đạt ≥80% quiz + không trong wrongSet → tăng folder.stats.mastered
- ✅ Backend: Cập nhật word metadata - lastSeenAt = now, difficulty tăng nếu trong wrongSet, giảm nếu đúng tất cả
- ✅ Backend: Route POST /api/sessions/:id/complete thêm vào sessionRoute.js
- ✅ Update SessionContent.tsx - Render SummaryStep khi currentStep='SUMMARY'
- ✅ Export SummaryStep từ frontend/src/components/session/index.ts

### Added - UX Enhancements (Phase 10 - Frontend)
- ✅ Setup Toaster global - Thêm <Toaster> component từ sonner vào main.tsx với position="top-right", richColors
- ✅ Toast notifications - Session start toast khi mount Session.tsx
- ✅ Toast notifications - Step completion toast khi Continue (hiển thị step hiện tại và step tiếp theo)
- ✅ Toast notifications - QuizStep feedback toast: success "✅ Chính xác!", error "❌ Chưa đúng" + đáp án đúng, error "Lỗi lưu dữ liệu" khi API fail
- ✅ Progress bar - QuizStep thêm visual progress bar (w-full bg-gray-200 rounded, blue bar transition-all duration-300)
- ✅ Skeleton loading - Tạo Skeleton component tại frontend/src/components/ui/skeleton.tsx
- ✅ Skeleton loading - WordsTable hiển thị 5 skeleton rows khi loading=true (thay thế "Đang tải..." text)
- ✅ Keyboard shortcuts - Quiz already has 1-4, Enter (từ Phase 5), Spelling already has Enter (từ Phase 7)

### Testing - Summary Step & UX Enhancements (Phase 9 + 10)
- ✅ Test TypeScript compile - No critical errors (SummaryStep.tsx, Session.tsx, QuizStep.tsx, WordsTable.tsx)
- ✅ DoD Phase 9: Summary hiển thị đầy đủ scores (P1/P2/Spelling/Fill), wrongSet review, CTA buttons
- ✅ DoD Phase 9: Backend POST /sessions/:id/complete cập nhật mastery và word metadata thành công
- ✅ DoD Phase 10: Toast notifications hoạt động (session start, step completion, quiz feedback)
- ✅ DoD Phase 10: Progress bar QuizStep animation mượt mà
- ✅ DoD Phase 10: WordsTable skeleton loading hiển thị 5 rows

## 2025-10-28

### Added - Fill-in-the-blank Step (Phase 8 - Frontend + Backend)
- ✅ Tạo FillBlankStep component tại frontend/src/components/session/FillBlankStep.tsx (259 lines)
- ✅ Implement word bank UI với 10 từ shuffle deterministic, hiển thị trạng thái used/unused/correct/incorrect
- ✅ Implement 10 câu cloze với blank fill area (click-to-fill từ word bank hoặc click-to-clear)
- ✅ Implement smart click logic: Click từ trong bank → fill vào blank đầu tiên chưa điền; Click từ đã dùng → xoá từ khỏi blank
- ✅ Implement Submit button: Enabled khi điền đủ 10/10 câu, chấm điểm client-side
- ✅ Implement scoring logic: So sánh userAnswer với question.answer (normalize lowercase + trim)
- ✅ Implement highlight UX: Câu sai highlight background đỏ (bg-red-50), hiển thị đáp án đúng bên cạnh blank (→ answer)
- ✅ Implement [Inferred] badge: Hiển thị badge màu xanh cho câu có isInferred=true (chỉ trước Submit)
- ✅ Implement result summary card: Hiển thị điểm X/10, tỷ lệ đúng %, warning cho câu sai
- ✅ Implement progress tracking: "Đã điền: X/10" trước Submit, "Điểm: X/10" sau Submit
- ✅ Implement completion handler: POST /attempts gộp (10 attempts), PUT /sessions/:id cập nhật fillBlank.score
- ✅ Update SessionContent.tsx - Thêm prop onFillBlankComplete, render FillBlankStep khi currentStep='FILL_BLANK'
- ✅ Update Session.tsx - Thêm fillBlankCompleted state, callback onFillBlankComplete, sync session state với fillBlank score
- ✅ Update canProceedToNextStep logic - FILL_BLANK step require fillBlankCompleted=true
- ✅ Export FillBlankStep từ frontend/src/components/session/index.ts

### Changed - Fill-in-the-blank Interactions
- ✅ Word bank buttons: Smart toggle fill/clear (auto-fill first empty blank), show index number khi used (e.g., "(1)")
- ✅ Blank fill area: Click to clear answer trước Submit, show correct answer nếu sai sau Submit
- ✅ Questions list: Câu sai highlight red border + background, câu đúng normal style
- ✅ Result indicators: ✓ cho câu đúng, ✗ cho câu sai (hiển thị bên phải mỗi câu)

### Testing - Fill-in-the-blank Step (Phase 8)
- ✅ Test TypeScript compile - No errors (FillBlankStep.tsx, SessionContent.tsx, Session.tsx)
- ✅ Test component structure - FillBlankStep under 300 LOC (259 lines after refactor)
- ✅ DoD: Word bank 10 từ, 10 câu cloze hiển thị đầy đủ
- ✅ DoD: Click-to-fill/click-to-clear logic hoạt động mượt
- ✅ DoD: Submit chấm điểm đúng, highlight câu sai rõ ràng (red background + show correct answer)
- ✅ DoD: fillBlank.score cập nhật lên backend thành công

## 2025-10-28

### Added - Spelling Step (Phase 7 - Frontend + Backend)
- ✅ Tạo SpellingStep component tại frontend/src/components/session/SpellingStep.tsx (259 lines)
- ✅ Implement spelling input với text field, kiểm tra gõ chính tả theo nghĩa tiếng Việt
- ✅ Implement text normalization: trim, lowercase, replace multiple spaces → single space
- ✅ Implement instant feedback: Highlight correct (green) / incorrect (red) sau khi kiểm tra
- ✅ Implement optional hint: Hiển thị số ký tự đúng vị trí khi sai (e.g., "5/7 ký tự đúng vị trí")
- ✅ Implement wrongSet logic: Round 1 = wrongSet từ Quiz P1+P2, Round 2+ = wrongWords còn sai
- ✅ Implement max rounds: Lặp tối đa 3 vòng qua wrongSet, tự động stop khi wrongSet rỗng hoặc hết vòng
- ✅ Implement correctCount tracking: Đếm tổng số từ đúng trong tất cả các rounds
- ✅ Implement keyboard shortcut: Enter để kiểm tra hoặc next
- ✅ Implement completion handler: PUT /sessions/:id cập nhật spelling.rounds + spelling.correct + wrongSet
- ✅ Implement POST /attempts: Log mỗi lần nhập với sessionId, step=SPELLING, wordId, userAnswer, isCorrect
- ✅ Implement empty state: Hiển thị "Hoàn thành!" với icon success khi wrongSet rỗng (không có từ sai từ Quiz)
- ✅ Update SessionContent.tsx - Render SpellingStep khi currentStep='SPELLING'
- ✅ Update Session.tsx - Thêm spellingCompleted state, callback onSpellingComplete, sync session state với spelling results
- ✅ Update canProceedToNextStep logic - SPELLING step require spellingCompleted=true
- ✅ Export SpellingStep từ frontend/src/components/session/index.ts

### Changed - Backend Session API
- ✅ Backend sessionController đã hỗ trợ cập nhật spelling.rounds và spelling.correct qua PUT /sessions/:id (từ Phase 1)
- ✅ Backend createAttempt đã hỗ trợ log spelling attempts (từ Phase 1, không cần thay đổi)
- ✅ Text normalization logic nằm ở frontend, backend chỉ lưu attempt như hiện tại

### Testing - Spelling Step (Phase 7)
- ✅ Test TypeScript compile - No errors (SpellingStep.tsx, SessionContent.tsx, Session.tsx)
- ✅ Test component structure - SpellingStep under 300 LOC (259 lines)

## 2025-10-28

### Added - Quiz Part 2 Step (Phase 6 - Frontend)
- ✅ Tái sử dụng QuizStep component cho Quiz P2 mode (EN→VI)
- ✅ Update SessionContent.tsx - Thêm prop onQuizP2Complete, render QuizStep khi currentStep='QUIZ_PART2'
- ✅ Update Session.tsx - Thêm quizP2Completed state, callback onQuizP2Complete, sync session state với score + wrongSet
- ✅ Update canProceedToNextStep logic - QUIZ_PART2 step require quizP2Completed=true
- ✅ Quiz P2 mode: prompt = word (EN), answer = meaning_vi (VI), 4 options A-D
- ✅ Sequential question flow: 10 câu tuần tự EN→VI
- ✅ Keyboard shortcuts: 1-4 để chọn, Enter để trả lời/next (tái sử dụng từ P1)
- ✅ Skip button: Tính sai, POST /attempts với isCorrect=false (tái sử dụng từ P1)
- ✅ Submit + feedback: POST /attempts mỗi câu, highlight correct/incorrect (tái sử dụng từ P1)
- ✅ Completion handler: PUT /sessions/:id cập nhật quizP2.score + wrongSet (merge unique với backend từ Phase 5)
- ✅ Score tracking: Hiển thị "Điểm: X/10" trên header (tái sử dụng từ P1)

### Testing - Quiz Part 2 (Phase 6)
- ✅ Test TypeScript compile - No errors (SessionContent.tsx, Session.tsx)
- ✅ DoD: Tái sử dụng QuizStep OK (không cần tạo component mới)
- ✅ DoD: 10 câu EN→VI render đầy đủ với prompt đảo ngược
- ✅ DoD: POST /attempts mỗi câu (tổng 20 attempts sau P1+P2)
- ✅ DoD: PUT /sessions/:id cập nhật quizP2.score và merge wrongSet unique (backend từ Phase 5)
- ✅ DoD: Điểm P2 hiển thị, dữ liệu bền vững sau refresh (localStorage persistence từ Phase 2)

## 2025-10-28

### Added - Quiz Part 1 Step (Phase 5 - Frontend + Backend)
- ✅ Tạo QuizStep component tại frontend/src/components/session/QuizStep.tsx (276 lines)
- ✅ Implement Quiz P1 mode (VN→EN): prompt = meaning_vi, answer = word, 4 options A-D
- ✅ Implement sequential question flow: 10 câu tuần tự, không cho nhảy câu
- ✅ Implement answer selection: Click hoặc phím tắt 1-4 để chọn đáp án
- ✅ Implement Skip button: Tính sai, POST /attempts với isCorrect=false
- ✅ Implement Submit button: POST /attempts mỗi câu với sessionId, step, wordId, userAnswer, isCorrect
- ✅ Implement instant feedback: Highlight correct (green) / incorrect (red) sau khi trả lời
- ✅ Implement keyboard shortcuts: 1-4 để chọn, Enter để trả lời hoặc next
- ✅ Implement completion handler: PUT /sessions/:id cập nhật quizP1.score + wrongSet (unique merge)
- ✅ Implement score tracking: Hiển thị "Điểm: X/10" trên header
- ✅ Update SessionContent.tsx - Render QuizStep khi currentStep='QUIZ_PART1'
- ✅ Update Session.tsx - Thêm quizP1Completed state, callback onQuizP1Complete, sync session state với score + wrongSet
- ✅ Update canProceedToNextStep logic - QUIZ_PART1 step require quizP1Completed=true
- ✅ Export QuizStep từ frontend/src/components/session/index.ts

### Changed - Backend Session API Enhancement
- ✅ Update updateSession trong sessionController.js - wrongSet merge unique thay vì replace
- ✅ wrongSet merge logic: Convert existing + new IDs to strings, merge với Set, lưu unique array
- ✅ Đảm bảo không duplicate wordIds trong wrongSet khi quiz P1 và P2 cùng sai 1 từ

### Testing - Quiz Part 1 (Phase 5)
- ✅ Test TypeScript compile - No errors (QuizStep.tsx, SessionContent.tsx, Session.tsx)
- ✅ Test component structure - QuizStep under 300 LOC (276 lines)
- ✅ DoD: 10 câu VN→EN render đầy đủ, 4 options A-D, phím tắt 1-4/Enter hoạt động
- ✅ DoD: POST /attempts mỗi câu (10 attempts được tạo)
- ✅ DoD: PUT /sessions/:id cập nhật quizP1.score và merge wrongSet unique
- ✅ DoD: Điểm P1 hiển thị trong header, wrongSet đúng (không duplicate)
- ✅ DoD: Skip button tính sai, Continue button enabled sau khi hoàn thành

## 2025-10-28

### Fixed - Flashcard Flip Animation
- ✅ Fix FlashcardStep.tsx - Mặt sau flashcard không hiển thị nội dung (meaning_vi, ex1/ex2, note)
- ✅ Root cause: backfaceVisibility: 'hidden' được đặt trên CardContent chứa cả 2 mặt trong conditional rendering
- ✅ Solution: Refactor thành 2 Card riêng biệt (front và back) với position: absolute, mỗi Card có backfaceVisibility riêng
- ✅ Front card: backfaceVisibility: 'hidden', transform: rotateY(0deg)
- ✅ Back card: backfaceVisibility: 'hidden', transform: rotateY(180deg)
- ✅ Container div có transformStyle: 'preserve-3d' và transform toggle khi flip
- ✅ Hiện mặt sau đã hiển thị đầy đủ: meaning_vi, ex1/ex2 với [Inferred] badge, note

## 2025-10-28

### Added - Flashcard Step (Phase 4 - Frontend)
- ✅ Tạo FlashcardStep component tại frontend/src/components/session/FlashcardStep.tsx (221 lines)
- ✅ Implement flip animation - Nhấp để lật thẻ, mặt trước hiển thị word/ipa/pos, mặt sau hiển thị meaning_vi + ví dụ + note
- ✅ Implement prev/next navigation - ChevronLeft/ChevronRight buttons để duyệt 10 thẻ
- ✅ Implement viewed cards tracking - Set<number> để track đã xem thẻ nào
- ✅ Implement mark difficult feature - Star button (yellow fill) để đánh dấu từ khó
- ✅ Implement [Inferred] badge - Badge màu xanh cho ví dụ có source='inferred'
- ✅ Implement progress indicator - "Thẻ X/10" và "Đã xem: Y/10"
- ✅ Implement dot navigation - 10 dots dưới thẻ, blue = viewed, gray = not viewed, active dot rộng hơn
- ✅ Implement completion check - Green alert box khi đã xem đủ 10 thẻ
- ✅ Implement onComplete callback - Notify parent component khi completion status thay đổi
- ✅ Update SessionContent.tsx - Render FlashcardStep khi currentStep='FLASHCARDS'
- ✅ Update Session.tsx - Thêm flashcardsCompleted state, pass callback onFlashcardsComplete vào SessionContent
- ✅ Update canProceedToNextStep logic - FLASHCARDS step require flashcardsCompleted=true (đã xem đủ 10 thẻ)
- ✅ Update session.ts types - Thêm isInferred field vào Question type, wordIds có thể là Word[] hoặc string[]
- ✅ Export FlashcardStep từ frontend/src/components/session/index.ts

### Changed - Session State Management
- ✅ SessionContent nhận optional prop onFlashcardsComplete callback
- ✅ Session.tsx track completion status và control Continue button enable/disable
- ✅ Điều kiện Continue: phải xem hết 10 thẻ (viewedCards.size === totalCards)

### Testing - Flashcard Step
- ✅ Test TypeScript compile - No errors (FlashcardStep.tsx, SessionContent.tsx, Session.tsx)
- ✅ Test component structure - FlashcardStep under 300 LOC (221 lines)
- ✅ DoD: Flip animation hoạt động, prev/next navigation OK, mark difficult OK, [Inferred] badge hiển thị
- ✅ DoD: Điều kiện Continue - Disabled cho đến khi xem đủ 10 thẻ, sau đó enabled
- ✅ DoD: Refresh page giữ nguyên seed (localStorage persistence từ Phase 2)

## 2025-10-28

### Added - Question Generator (Phase 3 - Backend)
- ✅ Tạo questionGenerator.js utility tại backend/src/utils/ với PRNG (Pseudo-Random Number Generator) từ seed (237 lines)
- ✅ Implement SeededRandom class với LCG algorithm để deterministic shuffle
- ✅ Implement generateQuizP1 - VN→EN: prompt = meaning_vi, answer = word, 4 options (1 đáp án + 3 nhiễu cùng POS)
- ✅ Implement generateQuizP2 - EN→VI: prompt = word, answer = meaning_vi, 4 options (1 đáp án + 3 nhiễu cùng POS)
- ✅ Implement generateFillBlank - Cloze sentences: 10 câu từ ex1/ex2, word bank = 10 từ shuffle deterministic
- ✅ Implement getDistractors helper - Ưu tiên từ cùng POS, mở rộng folder nếu không đủ
- ✅ Implement generateAllQuestions - Main generator sinh tất cả questions song song
- ✅ Fill Blank có isInferred flag cho ví dụ source='inferred'
- ✅ Update Session model - Thêm isInferred field vào QuestionSchema
- ✅ Update sessionController.getSession - Lazy generation: generate questions lần đầu GET, lưu vào DB

### Changed - Session API Enhancement
- ✅ Import generateAllQuestions vào sessionController.js
- ✅ getSession tự động generate questions nếu chưa có (quizP1/quizP2/fillBlank empty)
- ✅ Questions được lưu vào DB sau lần GET đầu tiên (persist để deterministic)
- ✅ Log chi tiết số lượng questions: Q1/Q2/FB counts

### Testing - Question Generator (Phase 3)
- ✅ Test folder creation - Tạo folder "Test Quiz" với 10 từ (apple, book, cat, dog, eat, fast, good, house, jump, run)
- ✅ Test POST /api/sessions - Tạo session với seed random (585500606)
- ✅ Test GET /api/sessions/:id - Questions được generate tự động (lazy generation)
- ✅ Test Quiz P1 structure - 10 câu VN→EN với 4 options, answer = word
- ✅ Test Quiz P2 structure - 10 câu EN→VI với 4 options, answer = meaning_vi
- ✅ Test Fill Blank structure - 10 câu cloze với word bank 10 từ, isInferred flag cho cat word
- ✅ Test determinism - Gọi GET nhiều lần với cùng sessionId trả cùng questions (same options order)
- ✅ Test different seeds - Session mới có seed khác → word bank order khác (cat/fast/apple/dog vs dog/cat/book/eat)
- ✅ Test isInferred flag - Word "cat" (ex1 source='inferred') có isInferred=true trong Fill Blank
- ✅ DoD verification: 10 câu mỗi phần, 4 lựa chọn quiz, word bank 10 từ, deterministic với cùng seed
- ✅ Total test cases: 10/10 passed (curl validation completed on 2025-10-28)

## 2025-10-28

### Refactored - SessionPage Component Structure
- ✅ Tách SessionPage thành 6 components nhỏ tại frontend/src/components/session/ (completed)
- ✅ Tạo SessionHeader.tsx (40 LOC) - Hiển thị folder name, step label, progress percentage
- ✅ Tạo SessionStepper.tsx (68 LOC) - 6-step visual progress indicator với animation
- ✅ Tạo SessionContent.tsx (38 LOC) - Placeholder cho nội dung từng bước học
- ✅ Tạo SessionNavigation.tsx (53 LOC) - Back/Continue buttons với step counter
- ✅ Tạo SessionLoading.tsx (44 LOC) - Skeleton UI khi loading session
- ✅ Tạo SessionError.tsx (26 LOC) - Error state với navigate về trang chủ
- ✅ Tạo barrel export tại frontend/src/components/session/index.ts
- ✅ Refactor Session.tsx - Giảm từ ~257 LOC xuống 209 LOC (đạt mục tiêu <300 LOC)
- ✅ All components reusable và dưới 80 LOC (tuân thủ clean code practices)

### Testing - SessionPage Refactor
- ✅ Test TypeScript compile - No errors (all session components)
- ✅ Test production build - Success (build time 3.86s)
- ✅ Verify component structure - 6 components + 1 barrel export created
- ✅ Verify LOC reduction - Session.tsx: 257 → 209 LOC (18% reduction)
- ✅ Total components LOC: 269 LOC (all under 80 LOC each)

## 2025-10-28

### Added - SessionPage UI (Phase 2 - Frontend)
- ✅ Tạo Session types tại frontend/src/types/session.ts (SessionStep, SessionProgress, Question, Session, SessionLocalState)
- ✅ Tạo SessionPage component tại frontend/src/pages/Session.tsx (297 lines)
- ✅ Implement header hiển thị folder name, current step, progress percentage
- ✅ Implement Stepper visual với 6 bước: Flashcards → Quiz P1 → Quiz P2 → Spelling → Fill → Summary
- ✅ Stepper visual indicators: completed (green ✓), active (blue with ring), upcoming (gray)
- ✅ Implement progress bar animation (blue bar theo percentage)
- ✅ Implement máy trạng thái (finite-state machine) để kiểm soát Continue button
- ✅ Implement localStorage persistence: lưu sessionId + currentStep vào localStorage với key `mindvocab_session_${sessionId}`
- ✅ Implement resume logic: đọc localStorage khi mount, sync với server step nếu server step > local step
- ✅ Implement skeleton loading states cho header, stepper, content khi fetch session
- ✅ Implement navigation controls: Back button (disabled ở first step), Continue button (disabled khi chưa đạt điều kiện hoặc ở last step)
- ✅ Implement step counter: "Bước X / 6" ở navigation footer
- ✅ Add route /sessions/:id vào App.tsx
- ✅ Placeholder content area cho các bước học (sẽ implement Phase 3)

### Changed - Backend Session API Enhancement
- ✅ Update getSession trong sessionController.js - Enrich response với folderName và totalWords fields
- ✅ folderName lấy từ session.folderId.name (populated field)
- ✅ totalWords lấy từ session.wordIds.length (số lượng words trong session)

### Testing - SessionPage (Phase 2)
- ✅ Test TypeScript compile - No errors (npx tsc --noEmit)
- ✅ Test production build - Success (build time 3.73s)
- ✅ Test GET /api/sessions/:id - Backend trả về folderName="ielts" và totalWords=1
- ✅ Test POST /api/sessions - Tạo session mới thành công
- ✅ Test PUT /api/sessions/:id - Cập nhật step từ FLASHCARDS → QUIZ_PART1 thành công
- ✅ Verify SessionPage route - /sessions/:id hoạt động
- ✅ Verify localStorage persistence - Key `mindvocab_session_${sessionId}` được lưu và đọc đúng
- ✅ Verify Stepper visual - Hiển thị đúng trạng thái completed/active/upcoming
- ✅ Verify state machine - Continue button enabled/disabled theo điều kiện từng bước
- ✅ Total test cases: 9/9 passed (manual verification on 2025-10-28)

### Added - Start Learning Button (FolderDetail Enhancement)
- ✅ Thêm button "🎯 Bắt đầu học" vào header của FolderDetail.tsx
- ✅ Button màu xanh (bg-blue-600 hover:bg-blue-700) để nổi bật
- ✅ Button disabled khi folder không có từ (totalWords = 0)
- ✅ Implement handleStartLearning - Tạo session mới (POST /sessions) và navigate sang /sessions/:id
- ✅ Validation: alert user nếu folder chưa có từ vựng
- ✅ Refactor header layout: "Bắt đầu học" (primary) + "Thêm từ mới" (outline) trong flex gap-3

### Testing - Start Learning Flow
- ✅ Test TypeScript compile - No errors (npx tsc --noEmit)
- ✅ Test production build - Success (build time 3.90s)
- ✅ Test button visibility - "Bắt đầu học" hiển thị trong FolderDetail header
- ✅ Test button state - Disabled khi totalWords = 0, enabled khi totalWords > 0
- ✅ Test session creation - Click button → POST /sessions → sessionId returned
- ✅ Test navigation - Auto navigate từ /folders/:id → /sessions/:sessionId
- ✅ Total test cases: 6/6 passed (manual verification on 2025-10-28)

## 2025-10-28

### Added - Session/Attempt API (Phase 1 - Backend)
- ✅ Convert Session.js model từ CommonJS sang ESM syntax (import/export) tại backend/src/model/Session.js
- ✅ Convert Attempt.js model từ CommonJS sang ESM syntax tại backend/src/model/Attempt.js
- ✅ Tạo sessionController.js tại backend/src/controllers/ với 5 functions (257 lines)
- ✅ Implement createSession - Tạo session với 10 words (sort alphabetically), seed random, idempotency guard (5s window)
- ✅ Implement getSession - Lấy session với populate folderId (name, description) và wordIds (full word details)
- ✅ Implement updateSession - Cập nhật step/scores/wrongSet với validation guards: chặn lùi bước, chặn nhảy bước
- ✅ Implement createAttempt - Ghi log từng câu trả lời với validation: sessionId, step, wordId required, wordId phải thuộc session
- ✅ Implement getSessionAttempts - Lấy attempts của session với filter optional by step, populate word details
- ✅ Tạo sessionRoute.js tại backend/src/routes/ với 5 routes: POST /sessions, GET /sessions/:id, PUT /sessions/:id, POST /attempts, GET /sessions/:id/attempts
- ✅ Register sessionRoute vào server.js tại /api

### Changed - Session Model Schema
- ✅ Session model có đầy đủ fields: folderId, wordIds (10 words), step (FLASHCARDS→QUIZ_PART1→QUIZ_PART2→SPELLING→FILL_BLANK→SUMMARY), wrongSet, reviewNotes, quizP1/quizP2 (questions[], score), spelling (rounds, correct, maxRounds=3), fillBlank (questions[], score), seed (random 1-1e9)
- ✅ Attempt model có fields: sessionId, step, wordId, userAnswer, isCorrect

### Testing - Session/Attempt API
- ✅ Test POST /api/sessions - Tạo session thành công với 1 word (folder test có ít từ)
- ✅ Test GET /api/sessions/:id - Lấy session với populate folder name và word details (word, pos, meaning_vi, ipa, note, ex1, ex2)
- ✅ Test PUT /api/sessions/:id - Cập nhật step FLASHCARDS→QUIZ_PART1 và quizP1.score=8 thành công
- ✅ Test validation guard - Chặn lùi bước từ QUIZ_PART1 về FLASHCARDS (HTTP 400)
- ✅ Test validation guard - Chặn nhảy bước từ QUIZ_PART1 sang SPELLING (HTTP 400)
- ✅ Test POST /api/attempts - Ghi 2 attempts (1 correct, 1 incorrect) thành công
- ✅ Test GET /api/sessions/:id/attempts - Lấy 2 attempts với populate word details
- ✅ Test filter by step - GET /api/sessions/:id/attempts?step=QUIZ_PART1 hoạt động
- ✅ Test idempotency guard - Tạo session mới sau 5 giây (không trả session cũ vì quá 5s)
- ✅ Test validation - Thiếu required fields sessionId/step/wordId bị reject (HTTP 400)
- ✅ Test validation - wordId không thuộc session bị reject với error message rõ ràng
- ✅ Test cập nhật wrongSet - Thêm wordId vào wrongSet và update quizP1.score thành công
- ✅ Total test cases: 13/13 passed (curl validation completed on 2025-10-28)

### Added - WordsTable Component (Refactor)
- ✅ Tạo WordsTable component tại frontend/src/components/word/WordsTable.tsx - Tách logic hiển thị bảng từ FolderDetail (131 lines)
- ✅ Thêm đầy đủ 7 columns vào WordsTable: word + note, pos, meaning_vi, ipa, ex1 (en/vi), ex2 (en/vi), actions
- ✅ Implement badge [Inferred] cho ex1/ex2 với source='inferred' - Badge màu xanh (bg-blue-100, text-blue-700)
- ✅ Hiển thị note dưới word column (italic, gray text) khi có note
- ✅ Export WordsTable từ frontend/src/components/word/index.ts

### Changed - FolderDetail Refactor
- ✅ Refactor FolderDetail.tsx - Thay thế table JSX (70+ dòng) bằng WordsTable component
- ✅ Giảm FolderDetail từ 319 dòng xuống ~250 dòng (đạt mục tiêu under 300 LOC)
- ✅ Remove unused imports (Edit2, Trash2 từ lucide-react) trong FolderDetail.tsx
- ✅ Simplify pagination logic - Di chuyển conditional rendering vào WordsTable component

### Testing
- ✅ Test TypeScript compile - No errors (npx tsc --noEmit)
- ✅ Test production build - Success (build time 3.84s)
- ✅ Verify WordsTable component structure - Hiển thị đầy đủ 7 columns với [Inferred] badges

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

