# Hướng dẫn triển khai QuizPro

## Hai chế độ hoạt động

| Chế độ | Khi nào | Dữ liệu |
|--------|---------|---------|
| **Demo Mode** | Không có biến môi trường Supabase | localStorage (mất khi xóa cache) |
| **Production Mode** | Có `NEXT_PUBLIC_SUPABASE_*` | PostgreSQL trên Supabase |

---

## 1. Chạy local (Development)

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # Kiểm tra lỗi build
```

Chạy ngay không cần cấu hình — Demo Mode tự kích hoạt.

---

## 2. Cấu hình Supabase (Production)

### Bước 1 — Tạo project

1. Đăng nhập [app.supabase.com](https://app.supabase.com) → **New Project**
2. Region: **Southeast Asia (Singapore)**
3. Chờ khởi tạo (~1 phút)

### Bước 2 — Tắt xác nhận email ⚠️

**Authentication → Providers → Email → tắt "Confirm email" → Save**

> Nếu không tắt, người dùng cần xác nhận email trước khi đăng nhập được.

### Bước 3 — Tạo bảng (SQL Editor)

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

-- Anti-cheat
CREATE TABLE cheating_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  detail TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Active sessions
CREATE TABLE active_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  answered_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'in_progress'
);

-- Indexes
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX idx_exam_results_user ON exam_results(user_id);
CREATE INDEX idx_cheating_logs_exam ON cheating_logs(exam_id);
CREATE INDEX idx_active_sessions_exam ON active_sessions(exam_id);
```

### Bước 4 — Bật RLS + Policies

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheating_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- Cho phép tất cả (đơn giản hóa cho dự án học thuật)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','subjects','questions','answers','exams',
    'exam_questions','groups','group_members','exam_groups','exam_results',
    'cheating_logs','active_sessions']
  LOOP
    EXECUTE format('CREATE POLICY "allow_all" ON %I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
```

### Bước 5 — Tạo tài khoản Admin

**Authentication → Users → Add user** → nhập email & mật khẩu

Sau đó vào **SQL Editor**:
```sql
INSERT INTO users (email, full_name, role)
VALUES ('your-admin@email.com', 'Tên Giảng Viên', 'admin');
```

### Bước 6 — Lấy API Keys

**Settings → API** → Copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 3. Biến môi trường

**Local** — tạo `.env.local` (dựa theo `.env.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

**Vercel** — Project Settings → Environment Variables → thêm 2 biến trên.

---

## 4. Deploy lên Vercel

### Từ GitHub (Khuyến nghị)

1. Push code lên GitHub
2. [vercel.com](https://vercel.com) → **Add New → Project** → Import repo
3. Cấu hình:
   - **Framework**: Next.js *(tự nhận)*
   - **Root Directory**: để **trống** *(Next.js ở root repo)*
   - **Environment Variables**: thêm 2 biến Supabase
4. **Deploy**

### Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 5. Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `404: NOT_FOUND` trên Vercel | Root Directory sai | Để trống Root Directory trong Vercel settings |
| Màn hình loading vô tận | Supabase `getSession()` lỗi | Kiểm tra env vars, hoặc xóa env vars để dùng Demo Mode |
| `invalid_credentials` | Sai mật khẩu | Kiểm tra lại |
| `Email not confirmed` | Chưa xác nhận email | Tắt "Confirm email" trong Supabase Auth settings |
| Dashboard hiện dữ liệu cũ | Đang ở Demo Mode | Thêm Supabase env vars, hoặc refresh trang |
| `400 Bad Request` khi login | Env vars không đúng | Kiểm tra URL và anon key |
