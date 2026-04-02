# QuizPro — Hệ thống Thi trắc nghiệm Trực tuyến

> Bài tập lớn môn **Kỹ Thuật Phần Mềm** — Trường Đại học Phenikaa, Khoa CNTT, HK2 2025–2026

**Live demo:** https://online-quiz-eight-mu.vercel.app  
**Mã nguồn:** https://github.com/wyn0502/PKA-KTPM-2025-2026-2

---

## Giới thiệu

QuizPro là nền tảng quản lý và tổ chức thi trắc nghiệm trực tuyến dành cho giảng viên và sinh viên đại học. Hệ thống tự động hóa toàn bộ quy trình: tạo ngân hàng câu hỏi → thiết lập đề thi → tổ chức thi → chấm điểm → thống kê kết quả.

---

## Tính năng chính

### Admin (Giảng viên)

| Tính năng | Mô tả |
|-----------|-------|
| Dashboard | Thống kê tổng quan, biểu đồ phân bố điểm & độ khó |
| Môn học | CRUD môn học |
| Ngân hàng câu hỏi | CRUD câu hỏi + đáp án, lọc theo môn/độ khó, import Excel |
| Đề thi | Tạo đề, cấu hình thời gian, trộn câu/đáp án, phân nhóm |
| Quản lý sinh viên | Tạo tài khoản, CRUD + import hàng loạt từ Excel/CSV |
| Nhóm thi | Phân nhóm sinh viên, gán đề thi cho nhóm |
| Giám sát thi | Theo dõi tiến độ làm bài realtime, cảnh báo gian lận tức thì |
| Kết quả thi | Thống kê chi tiết, xem log vi phạm, chấm lại, xuất Excel |
| Xem với tư cách SV | Preview toàn bộ trải nghiệm sinh viên (kết quả không lưu) |
| Cài đặt hệ thống | Đổi tên app & logo |

### Student (Sinh viên)

| Tính năng | Mô tả |
|-----------|-------|
| Bài thi | Xem danh sách đề được giao, vào thi |
| Làm bài | Timer đếm ngược, điều hướng câu, đánh dấu câu cần xem lại |
| Kết quả | Xem điểm & đáp án ngay sau nộp |
| Lịch sử | Xem lịch sử & kết quả các lần thi |

### Chống gian lận

- Phát hiện **chuyển tab / cửa sổ**
- Phát hiện **copy, paste, cut, chuột phải**
- Phát hiện **thoát toàn màn hình**
- Phát hiện **mở DevTools** (F12, Ctrl+Shift+I, Ctrl+U)
- Ghi **log chi tiết** mọi hành vi vi phạm (loại, nội dung, thời điểm)
- **Tự động cấm** sau 3 lần vi phạm: nộp bài ngay, điểm = 0
- Giảng viên nhận **cảnh báo realtime** trong trang giám sát

---

## Công nghệ

| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| Frontend | Next.js (React) | 16 / 19 |
| Styling | CSS thuần — Dark theme | — |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) | ^2.97 |
| Charts | Recharts | ^3.7 |
| Excel | xlsx | ^0.18 |
| Icons | lucide-react | ^0.575 |
| Hosting | Vercel (CI/CD từ GitHub) | — |

---

## Hai chế độ hoạt động

| Chế độ | Khi nào | Dữ liệu |
|--------|---------|---------|
| **Demo Mode** | Không có biến môi trường Supabase | localStorage (mất khi xóa cache) |
| **Production Mode** | Có `NEXT_PUBLIC_SUPABASE_*` | PostgreSQL trên Supabase |

Demo Mode phù hợp để chạy thử ngay mà không cần tài khoản Supabase.

---

## Cấu trúc project

```
├── app/
│   ├── globals.css           Dark theme CSS (2000+ dòng)
│   ├── layout.js             Root layout + metadata
│   └── page.js               Entry point (SettingsProvider > AuthProvider > ToastProvider)
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.jsx     Router + preview-as-student mode
│   │   ├── AdminHome.jsx          Dashboard + charts
│   │   ├── ExamsPage.jsx          Quản lý đề thi
│   │   ├── ExamMonitor.jsx        Giám sát thi realtime
│   │   ├── StudentsPage.jsx       Quản lý sinh viên + tạo tài khoản
│   │   ├── QuestionsPage.jsx      Ngân hàng câu hỏi
│   │   ├── SubjectsPage.jsx       Quản lý môn học
│   │   ├── GroupsPage.jsx         Nhóm thi
│   │   ├── AdminResultsPage.jsx   Kết quả & thống kê & log vi phạm
│   │   ├── ImportWayground.jsx    Import câu hỏi Excel
│   │   └── SystemSettingsPage.jsx Cài đặt hệ thống
│   ├── student/
│   │   ├── StudentDashboard.jsx   Layout sinh viên (+ previewMode)
│   │   ├── StudentExams.jsx       Danh sách bài thi
│   │   ├── TakeExam.jsx           Thi + chống gian lận + auto-ban
│   │   └── StudentResults.jsx     Lịch sử kết quả
│   ├── AppRouter.jsx          Routing theo role
│   ├── LoginPage.jsx          Đăng nhập/đăng ký
│   └── Sidebar.jsx            Thanh điều hướng
└── lib/
    ├── supabase.js    Supabase client + Demo data (localStorage)
    ├── api.js         Unified async API (tự chọn Supabase/Demo)
    ├── auth.js        Auth context (Supabase Auth / Demo fallback)
    ├── settings.js    System settings context (tên app, logo)
    └── toast.js       Toast notifications
```

---

## Chạy local (Development)

```bash
git clone https://github.com/wyn0502/PKA-KTPM-2025-2026-2.git
cd PKA-KTPM-2025-2026-2
npm install
npm run dev
# Mở http://localhost:3000
```

Chạy ngay không cần cấu hình — **Demo Mode** tự kích hoạt với dữ liệu mẫu.

```bash
npm run build   # Kiểm tra lỗi build trước khi deploy
```

---

## Triển khai Production (Supabase + Vercel)

### Bước 1 — Tạo project Supabase

1. Đăng nhập [app.supabase.com](https://app.supabase.com) → **New Project**
2. Region: **Southeast Asia (Singapore)**
3. Chờ khởi tạo (~1 phút)

### Bước 2 — Tắt xác nhận email

**Authentication → Providers → Email → tắt "Confirm email" → Save**

> Nếu không tắt, người dùng cần xác nhận email mới đăng nhập được.

### Bước 3 — Tạo schema (SQL Editor)

Vào **SQL Editor** trong Supabase, chạy toàn bộ script sau:

```sql
-- Users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  student_id TEXT,
  department TEXT,
  class_name TEXT,
  academic_year TEXT,
  password_hash TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Questions
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false
);

-- Exams
CREATE TABLE exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id),
  duration_minutes INTEGER DEFAULT 30,
  total_questions INTEGER DEFAULT 0,
  shuffle_questions BOOLEAN DEFAULT true,
  shuffle_answers BOOLEAN DEFAULT true,
  show_result BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exam_questions (
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  PRIMARY KEY (exam_id, question_id)
);

-- Groups
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE exam_groups (
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (exam_id, group_id)
);

-- Results
CREATE TABLE exam_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score NUMERIC(4,1),
  total_questions INTEGER,
  correct_count INTEGER,
  answers_detail JSONB,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anti-cheat logs
CREATE TABLE cheating_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  detail TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Active sessions (giám sát realtime)
CREATE TABLE active_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  answered_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  cheating_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress'
);

-- Indexes
CREATE INDEX idx_questions_subject   ON questions(subject_id);
CREATE INDEX idx_answers_question    ON answers(question_id);
CREATE INDEX idx_exam_results_exam   ON exam_results(exam_id);
CREATE INDEX idx_exam_results_user   ON exam_results(user_id);
CREATE INDEX idx_cheating_logs_exam  ON cheating_logs(exam_id);
CREATE INDEX idx_active_sessions_exam ON active_sessions(exam_id);
```

### Bước 4 — Bật RLS + Policies

```sql
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups           ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_groups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheating_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions  ENABLE ROW LEVEL SECURITY;

-- Cho phép tất cả (đơn giản hóa cho dự án học thuật)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','subjects','questions','answers','exams',
    'exam_questions','groups','group_members','exam_groups','exam_results',
    'cheating_logs','active_sessions']
  LOOP
    EXECUTE format(
      'CREATE POLICY "allow_all" ON %I FOR ALL USING (true) WITH CHECK (true)', t
    );
  END LOOP;
END $$;
```

### Bước 5 — Tạo tài khoản Admin

Vào **Authentication → Users → Add user** → nhập email & mật khẩu.

Sau đó vào **SQL Editor**:

```sql
INSERT INTO users (email, full_name, role)
VALUES ('your-admin@email.com', 'Tên Giảng Viên', 'admin');
```

### Bước 6 — Lấy API Keys

**Settings → API** → Copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Bước 7 — Biến môi trường

**Chạy local** — tạo file `.env.local` tại thư mục gốc:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

**Vercel** — Project Settings → Environment Variables → thêm 2 biến trên.

### Bước 8 — Deploy lên Vercel

**Từ GitHub (Khuyến nghị):**

1. Push code lên GitHub
2. [vercel.com](https://vercel.com) → **Add New → Project** → Import repo
3. Cấu hình:
   - **Framework**: Next.js *(tự nhận)*
   - **Root Directory**: để **trống** *(Next.js ở root repo)*
   - **Environment Variables**: thêm 2 biến Supabase ở Bước 7
4. Nhấn **Deploy**

**Vercel CLI:**

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `404: NOT_FOUND` trên Vercel | Root Directory sai | Để trống Root Directory trong Vercel settings |
| Màn hình loading vô tận | Supabase `getSession()` lỗi | Kiểm tra env vars, hoặc xóa env vars để dùng Demo Mode |
| `invalid_credentials` | Sai mật khẩu | Kiểm tra lại |
| `Email not confirmed` | Chưa tắt xác nhận email | Tắt "Confirm email" trong Supabase Auth settings (Bước 2) |
| Dashboard hiện dữ liệu cũ | Đang ở Demo Mode | Thêm Supabase env vars rồi refresh trang |
| `400 Bad Request` khi login | Env vars không đúng | Kiểm tra URL và anon key |

---

## Tài liệu dự án

| File | Nội dung |
|------|----------|
| [docs/bao-cao.html](./docs/bao-cao.html) | Báo cáo bài tập lớn (in → PDF) |
| [docs/bao-cao.docx](./docs/bao-cao.docx) | Báo cáo bài tập lớn (.docx) |
| [docs/y-tuong.docx](./docs/y-tuong.docx) | Tài liệu mô tả ý tưởng |
| [docs/slides.docx](./docs/slides.docx) | Nội dung slide trình bày |
