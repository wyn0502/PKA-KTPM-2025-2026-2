# Slide Outline: QuizPro — Hệ thống Thi trực tuyến

**Thuyết trình bài tập lớn — Kỹ Thuật Phần Mềm**
**Phenikaa University | 2025–2026**

---

## Slide 1: Trang bìa & Giới thiệu

**Tiêu đề:** QuizPro — Hệ thống Thi trực tuyến Thế hệ Mới

**Nội dung:**
- Logo QuizPro
- Tên nhóm, thành viên, lớp, GVHD
- Slogan: *"Thi thông minh. Giám sát thực. Kết quả chính xác."*

**Hình ảnh gợi ý:** Screenshot giao diện login hoặc dashboard admin

---

## Slide 2: Vấn đề & Giải pháp

**Tiêu đề:** Tại sao cần QuizPro?

**Vấn đề hiện tại (3 điểm đau):**
- Gian lận thi trực tuyến khó kiểm soát
- Giám sát thủ công, tốn công sức giảng viên
- Hệ thống cũ cồng kềnh, chi phí cao

**Giải pháp QuizPro:**
- Phát hiện gian lận tự động đa lớp
- Giám sát thời gian thực không cần phần mềm phụ
- JAMstack: triển khai miễn phí, vận hành đơn giản

**Bảng so sánh nhanh:**

| | Moodle | Google Forms | QuizPro |
|---|---|---|---|
| Chi phí | Cao | 0 | ~0 |
| Chống gian lận | Yếu | Không | Mạnh |
| Giám sát realtime | Hạn chế | Không | Có |

---

## Slide 3: Kiến trúc & Công nghệ

**Tiêu đề:** Thiết kế Hệ thống

**Sơ đồ kiến trúc (3 tầng):**
```
[Browser / Student / Admin]
         ↓
[Next.js 15 on Vercel]
  - App Router
  - React 19 Components
  - lib/api.js (Demo / Supabase auto-switch)
         ↓
[Supabase (PostgreSQL + Auth + Realtime)]
  - users, questions, exams, results
  - cheating_logs, active_sessions
```

**Công nghệ nổi bật:**
- **Next.js 15 + React 19** — Server Components, App Router
- **Supabase** — PostgreSQL + JWT Auth + Row Level Security
- **Vercel** — CI/CD tự động, CDN toàn cầu
- **Demo Mode** — Chạy không cần backend (dữ liệu trong bộ nhớ)

**Hình ảnh gợi ý:** Sơ đồ ERD hoặc diagram kiến trúc hệ thống

---

## Slide 4: Tính năng Nổi bật (Demo Live)

**Tiêu đề:** Những gì QuizPro làm được

**4 tính năng chủ chốt (mỗi cái 1 bullet với screenshot nhỏ):**

**1. Ngân hàng câu hỏi thông minh**
- Tạo câu hỏi trắc nghiệm, phân loại độ khó
- Nhập hàng loạt qua Excel (import 100 câu trong 10 giây)

**2. Chống gian lận đa lớp**
- Phát hiện: chuyển tab, thoát fullscreen, Ctrl+C, F12
- Log gian lận ghi nhận realtime với loại và thời điểm

**3. Giám sát kỳ thi thời gian thực**
- Xem danh sách sinh viên đang thi
- Tiến độ trả lời, cảnh báo bất thường

**4. Preview Mode cho Giảng viên**
- Xem trước đề thi với giao diện sinh viên
- Kết quả không được lưu — test an toàn

**Hình ảnh gợi ý:** Grid 2x2 screenshots của 4 tính năng

---

## Slide 5: Quy trình phát triển, Kết quả & Hướng tiếp theo

**Tiêu đề:** Agile Development & Kết quả

**Mô hình phát triển — Scrum (6 sprints):**
- Sprint 0: Setup dự án, Supabase schema, CI/CD
- Sprint 1–2: Auth, CRUD môn học, câu hỏi, đề thi
- Sprint 3: Luồng làm bài thi + chấm điểm tự động
- Sprint 4: Chống gian lận + Giám sát realtime
- Sprint 5: Import/Export Excel, Cài đặt hệ thống
- Sprint 6: Preview Mode, bug fixes, documentation

**Kết quả đạt được:**
- 12/12 test case chức năng: PASS
- Lighthouse Performance: 92/100 (desktop)
- Triển khai thành công trên Vercel (free tier)

**Hướng phát triển tiếp theo:**
- AI sinh câu hỏi từ tài liệu (OpenAI API)
- Proctoring qua webcam
- Mobile app (React Native)
- Tích hợp LMS (Moodle, Google Classroom)

**Kết thúc:** Cảm ơn — Q&A
- GitHub: [repository link]
- Demo: [vercel deployment link]
