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
| Quản lý sinh viên | CRUD + import hàng loạt từ Excel/CSV |
| Nhóm thi | Phân nhóm sinh viên, gán đề thi cho nhóm |
| Giám sát thi | Theo dõi tiến độ làm bài realtime, xem log gian lận |
| Kết quả thi | Thống kê chi tiết, xuất Excel |
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
- Ghi **log chi tiết** mọi hành vi vi phạm

### Xác thực
- Đăng nhập bằng **Email** hoặc **Mã sinh viên**
- Hỗ trợ **Supabase Auth** (production) hoặc **Demo Mode** (localStorage)

---

## Công nghệ

| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| Frontend | Next.js (React) | 16 / 19 |
| Styling | CSS thuần — Dark theme | — |
| Backend/DB | Supabase (PostgreSQL) | ^2.97 |
| Charts | Recharts | ^3.7 |
| Excel | xlsx | ^0.18 |
| Icons | lucide-react | ^0.575 |
| Hosting | Vercel (CI/CD từ GitHub) | — |

---

## Chạy local

```bash
git clone https://github.com/wyn0502/PKA-KTPM-2025-2026-2.git
cd PKA-KTPM-2025-2026-2
npm install
npm run dev
# Mở http://localhost:3000
```

> Không cần cấu hình gì thêm — tự chạy **Demo Mode** với dữ liệu mẫu.

---

## Cấu hình Production (Supabase)

Tạo file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Xem [DEPLOY.md](./DEPLOY.md) để biết hướng dẫn đầy đủ.

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
│   │   ├── StudentsPage.jsx       Quản lý sinh viên
│   │   ├── QuestionsPage.jsx      Ngân hàng câu hỏi
│   │   ├── SubjectsPage.jsx       Quản lý môn học
│   │   ├── GroupsPage.jsx         Nhóm thi
│   │   ├── AdminResultsPage.jsx   Kết quả & thống kê
│   │   ├── ImportWayground.jsx    Import câu hỏi Excel
│   │   └── SystemSettingsPage.jsx Cài đặt hệ thống
│   ├── student/
│   │   ├── StudentDashboard.jsx   Layout sinh viên (+ previewMode)
│   │   ├── StudentExams.jsx       Danh sách bài thi
│   │   ├── TakeExam.jsx           Thi + chống gian lận (+ previewMode)
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

## Tài liệu dự án

| File | Nội dung |
|------|----------|
| [docs/bao-cao.html](./docs/bao-cao.html) | Báo cáo bài tập lớn (in → PDF) |
| [docs/bao-cao.docx](./docs/bao-cao.docx) | Báo cáo bài tập lớn (.docx) |
| [docs/y-tuong.docx](./docs/y-tuong.docx) | Tài liệu mô tả ý tưởng |
| [docs/slides.docx](./docs/slides.docx) | Nội dung slide trình bày |
| [DEPLOY.md](./DEPLOY.md) | Hướng dẫn triển khai |
