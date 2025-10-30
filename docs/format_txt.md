## Hướng dẫn định dạng file import (TXT / XLSX)

Mục đích: mô tả chuẩn dữ liệu để hệ thống có thể import danh sách từ vựng, tự động chuẩn hoá, phát hiện thiếu và (nếu cần) gọi AI để điền phần còn thiếu.

Lưu ý chung
- Hỗ trợ 2 định dạng: .txt và .xlsx
- Mã hoá khuyến nghị: UTF-8
- Trùng trong cùng file sẽ bị bỏ qua theo từ khoá (không phân biệt hoa thường)
- Nếu trường còn thiếu (pos, ipa, note, ví dụ 1, ví dụ 2) hệ thống sẽ gọi AI để điền và gắn `source: "inferred"`

---

### 1) File TXT
- Mỗi dòng là một mục từ theo mẫu cơ bản: `word: meaning_vi`
- Hệ thống chấp nhận các biến thể thường gặp và sẽ tự chuẩn hoá:
  - Có số thứ tự ở đầu: `1) abundant — dồi dào` → vẫn nhận
  - Dấu ngăn cách là `:` hoặc `–` hoặc `—` hoặc `-` (có khoảng trắng 2 bên càng tốt)
  - Khoảng trắng thừa được loại bỏ tự động
- Chỉ tiêu tối thiểu: phải tách được `word` và `meaning_vi`
- Các trường khác (pos, ipa, note, ví dụ) nếu muốn điền ngay trong TXT thì không được hỗ trợ; hãy dùng Excel nếu cần nhiều cột ngay từ đầu

Ví dụ hợp lệ (TXT)
```
abide by: tuân theo (quy định)
abundant: dồi dào, phong phú
3) accommodate – cung cấp chỗ ở
bring up — nuôi dưỡng, đề cập
call off - hủy bỏ
```

Dòng không hợp lệ
- Dòng trống hoặc chỉ có `word` mà không có phần `meaning_vi`

---