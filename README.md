# mindvocab 📚

Ứng dụng quản lý từ vựng thông minh, áp dụng phương pháp lặp lại ngắt quãng (SRS) và AI để tạo nội dung học tập tự động.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19, TypeScript 5.7, Vite 7
- **UI/UX**: Tailwind CSS v4, shadcn/ui (New York style), Lucide Icons
- **State**: React Hook Form, Axios
- **Features**: SRS Dashboard, Retention Tracking

### Backend
- **Core**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Google Gemini (Flash 1.5/2.0)

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

Để chạy được dự án này, bạn cần cài đặt sẵn:
- [Node.js](https://nodejs.org/) (Khuyên dùng v18 hoặc v20)
- [Git](https://git-scm.com/)

### Bước 1: Clone dự án

Mở Terminal (Command Prompt hoặc PowerShell) và chạy lệnh sau để tải mã nguồn về máy:

```bash
git clone https://github.com/CongDon1207/mindvocab.git
cd mindvocab
```

### Bước 2: Cấu hình Backend (.env)

Dự án cần một file cấu hình bảo mật để kết nối Database và AI.

1.  Đi vào thư mục backend:
    ```bash
    cd backend
    ```
2.  Sao chép file mẫu `.env.example` thành `.env`:
    ```bash
    # Trên Windows (Powershell)
    cp .env.example .env
    # Hoặc copy thử công bằng File Explorer
    ```
3.  Mở file `.env` vừa tạo bằng VS Code hoặc Notepad.

### Bước 3: Lấy API Key & Kết nối Database

Bạn cần điền thông tin vào file `.env` theo hướng dẫn dưới đây:

#### 1️⃣ Lấy MongoDB Connection String
*Dùng để lưu trữ từ vựng.*

1.  Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) và đăng nhập/tạo tài khoản.
2.  Tạo **Cluster** mới (gói Free M0 là đủ).
3.  Vào mục **Database Access** > **Add New Database User** > Tạo user/password (lưu lại password).
4.  Vào mục **Network Access** > **Add IP Address** > Chọn **Allow Access from Anywhere**.
5.  Quay lại **Database** > Nhấn **Connect** > Chọn **Drivers**.
6.  Copy chuỗi kết nối (ví dụ: `mongodb+srv://admin:<password>@cluster0...`).
7.  Dán vào `.env`:
    ```env
    MONGODB_CONNECTION_STRING=dán_link_vào_đây_và_thay_<password>_bằng_mật_khẩu_của_bạn
    ```

#### 2️⃣ Lấy Google AI Studio API Key (Gemini)
*Dùng để tự động dịch, tạo câu ví dụ.*

1.  Truy cập [Google AI Studio](https://aistudio.google.com/).
2.  Nhấn nút **Get API key** ở góc trái trên.
3.  Nhấn **Create API key** > Sao chép mã khóa.
4.  Dán vào `.env`:
    ```env
    GEMINI_API_KEY=dán_mã_khóa_vào_đây
    ```

*Lưu ý: Các cấu hình khác như `PORT=5001`, `AI_PROVIDER=gemini` có thể giữ nguyên.*

---

### Bước 4: Cài đặt thư viện & Chạy ứng dụng

Quay lại thư mục gốc của dự án (`d:/workspace/JS/mindvocab`) và chạy các lệnh sau:

#### 1. Cài đặt toàn bộ thư viện (Build)
Lệnh này sẽ cài đặt thư viện cho cả Backend và Frontend, sau đó đóng gói Frontend:

```bash
# Tại thư mục gốc (mindvocab)
npm run build
```

*Lệnh này thực chất chạy: `cd backend && npm ci` sau đó `cd ../frontend && npm ci && npm run build`.*

#### 2. Khởi động Server
Sau khi build xong, khởi động server bằng lệnh:

```bash
npm run start
```

Khi thấy dòng chữ sau hiện ra là thành công:
```
✅ Server đang chạy trên cổng 5001
Liên kết cơ sở dữ liệu thành công !!!
```

---

## 🌐 Truy cập ứng dụng

Mở trình duyệt web (Chrome/Edge) và nhập địa chỉ:

👉 **[http://localhost:5001](http://localhost:5001)**

Vậy là bạn đã chạy thành công **MindVocab**! Chúc bạn học từ vựng hiệu quả. 🚀

---

## 📂 Template & Cấu trúc File Import

Để nhập từ vựng từ file (Excel/TXT), bạn chỉ cần chuẩn bị file theo định dạng sau:

### 1. Excel (.xlsx)

👉 **[Tải file mẫu Excel chuẩn tại đây](./template/sample.xlsx)**

Cấu trúc các cột (Header ở dòng 1):

| Cột | Tên Tiếng Anh (Header) | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- |
| **Từ vựng** | `Term` | ✅ Có | Từ gốc cần học (ví dụ: "Serendipity") |
| **Định nghĩa** | `Definition` | ❌ Không | Nghĩa của từ. Nếu để trống, AI sẽ tự điền. |
| **Loại từ** | `Type` | ❌ Không | Danh từ (n), Động từ (v), Tính từ (adj)... |
| **Ví dụ** | `Example` | ❌ Không | Câu ví dụ ngữ cảnh. |
| **Phiên âm** | `Phonetic` | ❌ Không | Ký hiệu phiên âm (IPA). |

### 2. Text (.txt)
Nhập danh sách từ đơn giản, mỗi từ một dòng. AI sẽ tự động tìm nghĩa và ví dụ cho tất cả.

```text
blue
run
...
```

### 💡 Mẹo: Tạo dữ liệu chuẩn bằng AI (ChatGPT/Gemini)

Để có dữ liệu ổn định nhất, bạn nên sử dụng **Excel**. Bạn có thể yêu cầu AI (như ChatGPT, Gemini) tạo danh sách từ vựng theo format chuẩn bằng Prompt sau:

```markdown
- Table output format must be xlsx so I can copy it

- Use the **EXACT columns and order** below (header required):
**IMPORTANT:** The output must ALWAYS be in **Markdown Table** format with exactly **10 columns** in the following order to allow easy copying to Excel/Anki.

### Table Structure (Header & Content)
| word | meaning_vi | pos | ipa | note | ex1_en | ex1_vi | ex2_en | ex2_vi | tags |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *word* | *Vietnamese meaning* | *part of speech* | *IPA* | *usage note/collocation* | *example 1 (EN)* | *example 1 translation (VI)* | *example 2 (EN)* | *example 2 translation (VI)* | *topic tags* |

### Content Standards:
1.  **word:** Keep the base form (infinitive/singular).
2.  **meaning_vi:** Accurate, concise meaning.
3.  **pos (Part of Speech):** n, v, adj, adv, phr...
4.  **ipa:** Standard International Phonetic Alphabet (if possible).
5.  **note:** Extremely important. Must include Collocations, prepositions, or nuance (formal/informal).
6.  **ex1/ex2:** Examples must contain the keyword and sound natural.
7.  **tags:** Related tags (TOEIC, Business, Marketing, Daily...).
```

**Lưu ý:** Sau khi AI tạo bảng, bạn chỉ cần copy cột `word` vào cột `Term` trong file Excel mẫu, `meaning_vi` vào `Definition`, `pos` vào `Type`, v.v. để nhập vào ứng dụng.

---


