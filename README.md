# Hệ thống thi trắc nghiệm trực tuyến

Nền tảng thi trắc nghiệm hiện đại dành cho giảng viên và sinh viên, xây dựng bằng **Next.js 16 + Supabase**.

## Tính năng

- **Admin:** Quản lý môn học, ngân hàng câu hỏi, đề thi, sinh viên, nhóm thi, kết quả
- **Sinh viên:** Làm bài thi trực tuyến, xem lịch sử & điểm số
- **Chống gian lận:** Phát hiện chuyển tab, copy/paste, thoát fullscreen, mở DevTools
- **Giám sát thi realtime:** Admin theo dõi tiến độ từng sinh viên
- **Import hàng loạt:** Nhập danh sách sinh viên từ Excel/CSV
- **Xuất kết quả:** Tải kết quả thi ra file Excel
- **Tùy chỉnh thương hiệu:** Đổi tên hệ thống & logo trong cài đặt admin
- **Demo Mode:** Chạy hoàn toàn bằng localStorage, không cần Supabase

## Công nghệ

| Package | Phiên bản |
|---------|-----------|
| Next.js | 16 |
| React | 19 |
| Supabase JS | ^2.97 |
| Recharts | ^3.7 |
| xlsx | ^0.18 |
| lucide-react | ^0.575 |

## Chạy local

```bash
npm install
npm run dev
# Mở http://localhost:3000
```

> Không cần cấu hình Supabase — hệ thống tự chạy ở **Demo Mode** với dữ liệu localStorage.

## Cấu hình Supabase (Production)

Tạo file `.env.local` (xem `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Xem [DEPLOY.md](./DEPLOY.md) để biết hướng dẫn đầy đủ.

## Deploy

Repo này được deploy tự động lên **Vercel** từ nhánh `main`.
Xem [DEPLOY.md](./DEPLOY.md) để biết cách cấu hình.

## Cấu trúc project

```
├── app/
│   ├── globals.css       CSS toàn cục (dark theme)
│   ├── layout.js         Root layout + metadata
│   └── page.js           Entry point (Providers)
├── components/
│   ├── admin/            Các trang quản trị
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminHome.jsx
│   │   ├── ExamsPage.jsx
│   │   ├── ExamMonitor.jsx
│   │   ├── StudentsPage.jsx
│   │   ├── QuestionsPage.jsx
│   │   ├── SubjectsPage.jsx
│   │   ├── GroupsPage.jsx
│   │   ├── AdminResultsPage.jsx
│   │   ├── ImportWayground.jsx
│   │   └── SystemSettingsPage.jsx
│   ├── student/          Các trang sinh viên
│   │   ├── StudentDashboard.jsx
│   │   ├── StudentExams.jsx
│   │   ├── TakeExam.jsx
│   │   └── StudentResults.jsx
│   ├── AppRouter.jsx
│   ├── LoginPage.jsx
│   └── Sidebar.jsx
└── lib/
    ├── supabase.js       Supabase client + Demo data layer
    ├── api.js            Async API wrapper (Supabase / Demo)
    ├── auth.js           Auth context (Supabase Auth / Demo)
    ├── settings.js       System settings context
    └── toast.js          Toast notifications
```
