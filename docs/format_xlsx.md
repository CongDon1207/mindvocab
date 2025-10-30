## Hướng dẫn định dạng file import (TXT / XLSX)

Mục đích: mô tả chuẩn dữ liệu để hệ thống có thể import danh sách từ vựng, tự động chuẩn hoá, phát hiện thiếu và (nếu cần) gọi AI để điền phần còn thiếu.

Lưu ý chung
- Hỗ trợ 2 định dạng: .txt và .xlsx
- Mã hoá khuyến nghị: UTF-8
- Trùng trong cùng file sẽ bị bỏ qua theo từ khoá (không phân biệt hoa thường)
- Nếu trường còn thiếu (pos, ipa, note, ví dụ 1, ví dụ 2) hệ thống sẽ gọi AI để điền và gắn `source: "inferred"`

---



### 2) File XLSX
- Dùng sheet đầu tiên (Sheet1 hoặc tên khác đều được, miễn là sheet đầu tiên trong file)
- Hàng 1 là header, không merge ô, không để trống header
- Cột bắt buộc (tối thiểu):
  - `word` (từ tiếng Anh)
  - `meaning_vi` (nghĩa tiếng Việt)
-  `pos`, `ipa`, `note`, `ex1_en`, `ex1_vi`, `ex2_en`, `ex2_vi`, `tags`
- Thứ tự cột không bắt buộc; importer sẽ tự map header (theo alias) về tên chuẩn

Alias header được hỗ trợ
- word: `word`, `từ`, `english`, `en`
- meaning_vi: `meaning_vi`, `meaning`, `definition_vi`, `nghĩa`, `vi`, `vietnamese`
- pos: `pos`, `part_of_speech`, `loại từ`, `speech`
- ipa: `ipa`, `phonetic`, `phiên âm`
- note: `note`, `ghi chú`, `tips`, `hint`
- ex1_en: `ex1_en`, `example1_en`, `example_en`, `ví dụ 1 en`
- ex1_vi: `ex1_vi`, `example1_vi`, `example_vi`, `ví dụ 1 vi`
- ex2_en: `ex2_en`, `example2_en`
- ex2_vi: `ex2_vi`, `example2_vi`
- tags: `tags`, `tag`, `nhãn`

Ràng buộc / chuẩn hoá
- pos (nếu điền): thuộc một trong `noun | verb | adj | adv | prep | phrase | idiom | other`
- ipa (nếu điền): phải là ký tự IPA hợp lệ; không bắt buộc có dấu `/`
- note: ngắn gọn (≤ 1–2 câu)
- Ví dụ (ex1/ex2):
  - `ex1_en` bắt buộc chứa đúng `word` (case-insensitive; phrasal verb giữ nguyên cụm)
  - `ex1_vi` là bản dịch ngắn gọn, không lặp nguyên văn `meaning_vi`
  - `ex2_en` và `ex2_vi` tương tự
- tags: nhiều thẻ phân tách bởi dấu phẩy, ví dụ: `phrasal,common`

Ví dụ dữ liệu (3 hàng)
- Row 2
  - word: `abide by`
  - meaning_vi: `tuân theo (quy định)`
  - pos: `verb`
  - ipa: `əˈbaɪd`
  - note: `Ghi nhớ: abide by + rules`
  - ex1_en: `You must abide by the safety rules.`
  - ex1_vi: `Bạn phải tuân thủ các quy tắc an toàn.`
  - ex2_en: `All employees should abide by company policies.`
  - ex2_vi: `Mọi nhân viên nên tuân thủ chính sách công ty.`
  - tags: `phrasal,common`
- Row 3
  - word: `abundant`
  - meaning_vi: `dồi dào, phong phú`
  - pos: `adj`
  - ipa: `əˈbʌndənt`
  - note: `Thường đi với resources/amount`
  - ex1_en: `The region has abundant fresh water.`
  - ex1_vi: `Khu vực này có nguồn nước dồi dào.`
  - ex2_en: `We enjoyed an abundant meal.`
  - ex2_vi: `Chúng tôi thưởng thức một bữa ăn thịnh soạn.`
  - tags: `common`
- Row 4
  - word: `accommodate`
  - meaning_vi: `cung cấp chỗ ở`
  - pos: `verb`
  - ipa: `əˈkɒmədeɪt`
  - note: `Hotels accommodate guests`
  - ex1_en: `The hostel can accommodate fifty students.`
  - ex1_vi: `Ký túc xá có thể chứa 50 sinh viên.`
  - ex2_en: `The hotel can accommodate large conferences.`
  - ex2_vi: `Khách sạn có thể tổ chức hội nghị lớn.`
  - tags: `travel`

---

### 3) Hệ thống xử lý thế nào?
- PARSING: đọc file, chuẩn hoá, loại trùng (theo `(folderId, word)` case-insensitive)
- ENRICHING: nếu còn thiếu bất kỳ trường `pos|ipa|note|ex1|ex2` → gom batch (mặc định 10) gọi AI (Gemini); mọi trường do AI sinh sẽ có `source: "inferred"`
- SAVING: upsert theo `(folderId, word)`; không ghi đè dữ liệu do người dùng nhập, trừ khi bạn bật “Cho phép cập nhật” khi upload

---

### 4) Lỗi thường gặp & cách khắc phục
- “Không tìm thấy cột word/meaning_vi sau khi chuẩn hoá header (Sheet1)”
  - Kiểm tra hàng 1 là header thật sự, không merge ô
  - Đặt đúng tên `word` và `meaning_vi` (hoặc các alias đã liệt kê)
  - Đảm bảo sheet có dữ liệu là sheet đầu tiên
- “Ví dụ không chứa đúng từ khoá”
  - Sửa câu ví dụ để có đúng `word`; hoặc để trống để hệ thống nhờ AI bổ sung
- Timeout/rate-limit khi import file lớn
  - Hệ thống mặc định batch=10, timeout=45s, retry=3; nếu vẫn gặp vấn đề, chia file thành 2–3 lần upload

---

### 5) Checklist nhanh trước khi import
- [ ] TXT: mỗi dòng `word: meaning_vi`, không thiếu dấu ngăn cách
- [ ] XLSX: sheet đầu, header ở hàng 1, có `word` và `meaning_vi`
- [ ] pos/ipa/note/ex1/ex2 (nếu có) đúng quy tắc; nếu thiếu, hệ thống sẽ nhờ AI
- [ ] Không merge ô/không để trống header; không có dòng tiêu đề phía trên header

