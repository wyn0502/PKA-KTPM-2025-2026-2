# Hướng dẫn triển khai Hệ thống thi trắc nghiệm trực tuyến

## Tổng quan

Hệ thống thi trắc nghiệm trực tuyến hỗ trợ 2 chế độ:
- **Demo Mode** (mặc định): Dữ liệu lưu trong localStorage, không cần backend
- **Production Mode**: Kết nối Supabase để lưu trữ dữ liệu thực

---

## 1. Chạy local (Development)

```bash
npm install
npm run dev
# Mở http://localhost:3000
```

Không cần cấu hình gì thêm — hệ thống chạy ở Demo Mode.

---

## 2. Cấu hình Supabase (Production)

### 2.1. Tạo project Supabase

1. Đăng nhập [app.supabase.com](https://app.supabase.com)
2. Click **New Project** → đặt tên, chọn region **Southeast Asia (Singapore)**, đặt database password
3. Chờ project khởi tạo xong (~1 phút)

### 2.2. Tắt xác nhận email (quan trọng)

Vào **Authentication > Providers > Email** → tắt **"Confirm email"** → Save.

> Nếu không tắt, người dùng sẽ cần xác nhận email trước khi đăng nhập.

### 2.3. Tạo bảng database

Vào **SQL Editor** → chạy script sau:

```sql
-- Bảng users
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

-- Bảng môn học
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Bảng câu hỏi
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng đáp án
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false
);

-- Bảng đề thi
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

-- Bảng câu hỏi trong đề thi
CREATE TABLE exam_questions (
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  PRIMARY KEY (exam_id, question_id)
);

-- Bảng nhóm thi
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Thành viên nhóm
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_id)
);

-- Nhóm được gán đề thi
CREATE TABLE exam_groups (
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (exam_id, group_id)
);

-- Kết quả thi
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

-- Log gian lận
CREATE TABLE cheating_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  detail TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Phiên thi đang diễn ra
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

-- Index
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX idx_exam_results_user ON exam_results(user_id);
CREATE INDEX idx_cheating_logs_exam ON cheating_logs(exam_id);
CREATE INDEX idx_active_sessions_exam ON active_sessions(exam_id);
```

### 2.4. Cấu hình Row Level Security (RLS)

```sql
-- Bật RLS
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

-- Policies (cho phép tất cả)
CREATE POLICY "Allow all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON answers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON exam_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON group_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON exam_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON exam_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON cheating_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON active_sessions FOR ALL USING (true) WITH CHECK (true);
```

### 2.5. Tạo tài khoản Admin

Vào **Authentication > Users** → **Add user** → nhập email & password.

Sau đó vào **SQL Editor** → thêm profile:

```sql
INSERT INTO users (email, full_name, role, password_hash)
VALUES ('your-admin@email.com', 'Admin', 'admin', '');
```

### 2.6. Lấy API Keys

Vào **Settings > API**:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

---

## 3. Biến môi trường

Tạo file `.env.local` (xem `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> Khi không có biến môi trường → tự động chạy **Demo Mode** (localStorage).

---

## 4. Deploy lên Vercel

### Cách 1: Deploy từ GitHub (Khuyến nghị)

1. Push code lên GitHub
2. Đăng nhập [vercel.com](https://vercel.com) → **Add New > Project**
3. Import repository
4. Cấu hình:
   - **Framework Preset**: Next.js (tự nhận)
   - **Root Directory**: để trống (Next.js nằm ở root repo)
   - **Environment Variables**: thêm `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

### Cách 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 5. Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| `404: NOT_FOUND` trên Vercel | Root Directory sai | Đảm bảo Root Directory = trống (không phải `online-quiz-system`) |
| `Invalid login credentials` | Sai email/password | Kiểm tra lại thông tin đăng nhập |
| `Email not confirmed` | Chưa xác nhận email | Tắt email confirmation trong Supabase **Authentication > Providers > Email** |
| `400 Bad Request` khi đăng nhập | Env vars không đúng | Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` trong Vercel |
| Dữ liệu mất sau reload | Đang ở Demo Mode | Cấu hình Supabase env vars |
