# Hướng dẫn triển khai Online Quiz System

## 1. Chuẩn bị

### Yêu cầu
- Node.js >= 18
- Tài khoản [Supabase](https://supabase.com) (miễn phí)
- Tài khoản [Vercel](https://vercel.com) (miễn phí)
- Repository trên GitHub

---

## 2. Cấu hình Supabase

### 2.1. Tạo project Supabase
1. Đăng nhập [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Đặt tên project, chọn region gần nhất (Singapore cho VN), đặt database password
4. Chờ project khởi tạo xong

### 2.2. Tạo bảng database
Vào **SQL Editor** trong Supabase Dashboard, chạy script sau:

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
  password_hash TEXT NOT NULL,
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

-- Tạo admin mặc định
INSERT INTO users (email, full_name, role, password_hash)
VALUES ('admin@quiz.com', 'Admin', 'admin', 'CHANGE_THIS_TO_HASH');
```

### 2.3. Cấu hình Row Level Security (RLS)
Vào **Authentication > Policies** hoặc chạy SQL:

```sql
-- Bật RLS cho tất cả bảng
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

-- Policy cho phép đọc (tùy chỉnh theo nhu cầu)
-- Ví dụ: Admin đọc tất cả, student chỉ đọc dữ liệu liên quan
CREATE POLICY "Allow all for authenticated" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON subjects FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON questions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON answers FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON exams FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON exam_questions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON groups FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON group_members FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON exam_groups FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON exam_results FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON cheating_logs FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON active_sessions FOR ALL USING (true);
```

### 2.4. Lấy API Keys
1. Vào **Settings > API** trong Supabase Dashboard
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

---

## 3. Cấu hình biến môi trường

Tạo file `.env.local` trong thư mục project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Lưu ý**: Khi không có biến môi trường, hệ thống tự động chạy ở **Demo Mode** với dữ liệu localStorage. Đây là cách mặc định khi phát triển.

---

## 4. Deploy lên Vercel

### 4.1. Cách 1: Deploy từ GitHub (Khuyến nghị)
1. Push code lên GitHub repository
2. Đăng nhập [vercel.com](https://vercel.com)
3. Click **Add New > Project**
4. Import repository từ GitHub
5. Cấu hình:
   - **Framework Preset**: Next.js
   - **Root Directory**: `online-quiz-system` (nếu không phải root)
   - **Environment Variables**: Thêm 2 biến:
     - `NEXT_PUBLIC_SUPABASE_URL` = URL Supabase của bạn
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Anon key Supabase
6. Click **Deploy**

### 4.2. Cách 2: Deploy bằng Vercel CLI
```bash
# Cài Vercel CLI
npm i -g vercel

# Đăng nhập
vercel login

# Deploy (trong thư mục online-quiz-system)
cd online-quiz-system
vercel

# Deploy production
vercel --prod
```

Khi hỏi biến môi trường, nhập các giá trị Supabase ở trên.

### 4.3. Cấu hình domain (tùy chọn)
1. Vào project trên Vercel Dashboard
2. **Settings > Domains**
3. Thêm domain tùy chỉnh
4. Cập nhật DNS theo hướng dẫn

---

## 5. Chạy local (Development)

```bash
# Cài dependencies
npm install

# Chạy development server
npm run dev

# Mở trình duyệt: http://localhost:3000
```

### Tài khoản demo (Demo Mode - không cần Supabase):
- **Admin**: admin@quiz.com / admin123
- **Sinh viên**: student@quiz.com / student123

---

## 6. Cấu trúc project

```
online-quiz-system/
├── app/
│   ├── globals.css      # CSS toàn cục
│   ├── layout.js        # Root layout
│   └── page.js          # Entry point
├── components/
│   ├── admin/           # Các trang admin
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminHome.jsx
│   │   ├── ExamsPage.jsx
│   │   ├── ExamMonitor.jsx    # Giám sát thi realtime
│   │   ├── StudentsPage.jsx
│   │   ├── QuestionsPage.jsx
│   │   ├── SubjectsPage.jsx
│   │   ├── GroupsPage.jsx
│   │   └── AdminResultsPage.jsx
│   ├── student/         # Các trang sinh viên
│   │   ├── StudentDashboard.jsx
│   │   ├── StudentExams.jsx
│   │   ├── TakeExam.jsx       # Thi + chống gian lận
│   │   └── StudentResults.jsx
│   ├── LoginPage.jsx
│   └── Sidebar.jsx
├── lib/
│   ├── supabase.js      # Data layer (Supabase + Demo)
│   ├── auth.js          # Authentication context
│   └── toast.js         # Toast notifications
└── package.json
```

---

## 7. Tính năng chính

- Quản lý môn học, câu hỏi, đề thi
- Import sinh viên từ Excel/CSV (hàng loạt)
- Quản lý sinh viên theo khoa, lớp, khóa
- Tạo đề thi với thời gian bắt đầu/kết thúc
- Trộn câu hỏi & đáp án
- Hệ thống chống gian lận (tab switch, copy/paste, fullscreen, devtools)
- Giám sát thi realtime (xem tiến độ từng sinh viên)
- Xuất kết quả ra Excel
- Giao diện dark theme responsive
