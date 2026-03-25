# Ý tưởng dự án: QuizPro — Hệ thống Thi trực tuyến

**Môn học:** Kỹ Thuật Phần Mềm
**Trường:** Đại học Phenikaa
**Năm học:** 2025–2026

---

## 1. Vấn đề đặt ra

Các kỳ thi trực tuyến hiện tại tại nhiều trường đại học Việt Nam thường gặp phải:

- **Gian lận khó kiểm soát:** Sinh viên dễ dàng chuyển tab tìm kiếm đáp án, chia sẻ màn hình với người khác, hoặc sao chép nội dung đề thi.
- **Thiếu giám sát thời gian thực:** Giảng viên không biết sinh viên nào đang làm bài, tiến độ ra sao, hoặc có hành vi bất thường không.
- **Quản lý ngân hàng câu hỏi thủ công:** Nhiều hệ thống yêu cầu nhập câu hỏi từng cái một, mất nhiều thời gian khi có hàng trăm câu.
- **Không linh hoạt:** Khó tùy chỉnh nhóm thi, gán đề cho từng lớp/nhóm riêng biệt.
- **Chi phí cao:** Các phần mềm thương mại như Moodle, Canvas đòi hỏi cơ sở hạ tầng server và chi phí vận hành lớn.

## 2. Giải pháp đề xuất: QuizPro

**QuizPro** là hệ thống thi trực tuyến được xây dựng trên nền tảng Next.js 15 + Supabase, nhắm đến các trường đại học quy mô vừa và nhỏ.

### Điểm khác biệt so với các giải pháp hiện có

| Tiêu chí | Moodle/Canvas | Google Forms | QuizPro |
|---|---|---|---|
| Chi phí | Cao (server) | Miễn phí | Gần như 0 (Vercel Free + Supabase Free) |
| Chống gian lận | Hạn chế | Không | Tích hợp sẵn, đa lớp |
| Giám sát realtime | Hạn chế | Không | Có (active sessions) |
| Nhập Excel | Có | Không | Có |
| Triển khai | Phức tạp | Tức thì | Nhanh (Vercel CI/CD) |
| Tuỳ chỉnh | Khó | Không | Hoàn toàn (open source) |

### Tính năng cốt lõi

1. **Ngân hàng câu hỏi thông minh:** Phân loại theo môn, độ khó, nhập hàng loạt qua Excel.
2. **Đề thi linh hoạt:** Trộn câu hỏi, trộn đáp án, giới hạn thời gian bắt đầu/kết thúc.
3. **Phân quyền theo nhóm:** Chỉ sinh viên trong nhóm mới thấy đề thi được gán.
4. **Chống gian lận đa lớp:** Tab switching, fullscreen exit, copy/paste, DevTools detection.
5. **Giám sát thời gian thực:** Admin xem tiến độ làm bài và log gian lận ngay lập tức.
6. **Preview Mode:** Giảng viên xem trước đề thi với tư cách sinh viên, không lưu dữ liệu.
7. **Kết quả tức thì:** Chấm điểm tự động, xem đáp án chi tiết sau khi nộp.

## 3. Công nghệ lựa chọn và lý do

- **Next.js 15:** Framework React hiện đại với App Router, SSR/CSR linh hoạt, triển khai miễn phí trên Vercel.
- **Supabase:** PostgreSQL + Auth + Realtime, có Row Level Security, miễn phí cho quy mô nhỏ.
- **Vercel:** CI/CD tự động từ GitHub, CDN toàn cầu, preview deployments cho mỗi PR.

## 4. Đối tượng sử dụng

- **Giảng viên:** Quản lý toàn bộ hệ thống, tạo đề thi, giám sát và đánh giá.
- **Sinh viên:** Làm bài thi, xem kết quả và lịch sử các bài đã làm.

## 5. Tiềm năng phát triển

Sau khi hoàn thiện phiên bản cơ bản, dự án có thể mở rộng thêm:
- AI tự động sinh câu hỏi từ tài liệu môn học (OpenAI API).
- Giám sát qua webcam (proctoring nâng cao).
- Tích hợp với các LMS phổ biến (Moodle, Google Classroom) qua API.
- Ứng dụng mobile (React Native).
- Chứng chỉ điện tử sau khi hoàn thành bài thi.
