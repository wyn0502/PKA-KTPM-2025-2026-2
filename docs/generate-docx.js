/**
 * Tạo file .docx cho tài liệu dự án QuizPro
 * Chạy: node docs/generate-docx.js
 */
const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    Table, TableRow, TableCell, WidthType, BorderStyle,
    AlignmentType, PageBreak, VerticalAlign, ShadingType,
    convertInchesToTwip, Header, Footer, PageNumber,
    NumberFormat,
} = require('docx');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname);

// ─── Helpers ────────────────────────────────────────────────────────────────
const h1 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
const h2 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } });
const h3 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } });
const p = (text, opts = {}) => new Paragraph({
    children: [new TextRun({ text, size: 26, font: 'Times New Roman', ...opts })],
    spacing: { after: 120, line: 360 },
});
const pBold = (text) => p(text, { bold: true });
const br = () => new Paragraph({ children: [new TextRun('')], spacing: { after: 80 } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const tableRow = (cells, isHeader = false) => new TableRow({
    children: cells.map(text => new TableCell({
        children: [new Paragraph({
            children: [new TextRun({ text: String(text), size: 22, font: 'Times New Roman', bold: isHeader })],
            alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { before: 60, after: 60 },
        })],
        verticalAlign: VerticalAlign.CENTER,
        shading: isHeader ? { type: ShadingType.SOLID, color: 'D0D0D0' } : undefined,
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
    })),
    tableHeader: isHeader,
});

const makeTable = (headers, rows) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tableRow(headers, true), ...rows.map(r => tableRow(r))],
    margins: { top: 60, bottom: 60 },
});

const li = (text, level = 0) => new Paragraph({
    children: [new TextRun({ text, size: 26, font: 'Times New Roman' })],
    bullet: { level },
    spacing: { after: 80, line: 340 },
});

// ─── BÁO CÁO ────────────────────────────────────────────────────────────────
async function genBaoCao() {
    const doc = new Document({
        styles: {
            default: {
                document: { run: { font: 'Times New Roman', size: 26 } },
            },
        },
        numbering: {
            config: [{
                reference: 'bullet',
                levels: [{ level: 0, format: NumberFormat.BULLET, text: '•', alignment: AlignmentType.LEFT }],
            }],
        },
        sections: [{
            properties: { page: { margin: { top: 1440, bottom: 1440, left: 1800, right: 1260 } } },
            children: [
                // ── BÌA ──
                br(), br(), br(),
                new Paragraph({ children: [new TextRun({ text: 'TRƯỜNG ĐẠI HỌC PHENIKAA', bold: true, size: 28, font: 'Times New Roman', allCaps: true })], alignment: AlignmentType.CENTER }),
                new Paragraph({ children: [new TextRun({ text: 'Khoa Công nghệ thông tin', size: 26, font: 'Times New Roman' })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
                br(), br(), br(),
                new Paragraph({ children: [new TextRun({ text: 'BÁO CÁO BÀI TẬP LỚN', bold: true, size: 36, font: 'Times New Roman', allCaps: true })], alignment: AlignmentType.CENTER }),
                br(),
                new Paragraph({ children: [new TextRun({ text: 'Môn học: Kỹ Thuật Phần Mềm', size: 28, font: 'Times New Roman', italics: true })], alignment: AlignmentType.CENTER }),
                br(), br(),
                new Paragraph({ children: [new TextRun({ text: 'QUIZPRO', bold: true, size: 44, font: 'Times New Roman', color: '1A237E' })], alignment: AlignmentType.CENTER }),
                new Paragraph({ children: [new TextRun({ text: 'Hệ thống Thi trắc nghiệm Trực tuyến', size: 30, font: 'Times New Roman' })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
                br(), br(), br(),
                new Paragraph({ children: [new TextRun({ text: 'Giảng viên hướng dẫn: ................................', size: 26, font: 'Times New Roman' })], spacing: { after: 120 } }),
                new Paragraph({ children: [new TextRun({ text: 'Nhóm sinh viên: ......................................', size: 26, font: 'Times New Roman' })], spacing: { after: 120 } }),
                new Paragraph({ children: [new TextRun({ text: 'Lớp: ....................................................', size: 26, font: 'Times New Roman' })], spacing: { after: 120 } }),
                new Paragraph({ children: [new TextRun({ text: 'Mã môn học: ............................................', size: 26, font: 'Times New Roman' })], spacing: { after: 600 } }),
                new Paragraph({ children: [new TextRun({ text: 'Hà Nội, năm học 2025 – 2026', bold: true, size: 26, font: 'Times New Roman' })], alignment: AlignmentType.CENTER }),

                pageBreak(),

                // ── MỤC LỤC (thủ công) ──
                h1('MỤC LỤC'),
                p('Chương 1: Giới thiệu dự án ........................................ 3'),
                p('  1.1 Bối cảnh và lý do chọn đề tài ............................. 3'),
                p('  1.2 Mục tiêu dự án ................................................ 3'),
                p('  1.3 Phạm vi và giới hạn ........................................... 4'),
                p('Chương 2: Phân tích yêu cầu ...................................... 5'),
                p('  2.1 Yêu cầu chức năng ............................................. 5'),
                p('  2.2 Yêu cầu phi chức năng ......................................... 6'),
                p('  2.3 Use case tổng quan ............................................. 7'),
                p('Chương 3: Mô hình phát triển phần mềm .......................... 8'),
                p('  3.1 Lựa chọn mô hình Agile ....................................... 8'),
                p('  3.2 Kế hoạch Sprint ................................................ 9'),
                p('Chương 4: Thiết kế hệ thống ....................................... 10'),
                p('  4.1 Kiến trúc tổng thể ............................................ 10'),
                p('  4.2 Thiết kế cơ sở dữ liệu (ERD) ................................ 11'),
                p('  4.3 Thiết kế giao diện ............................................ 12'),
                p('Chương 5: Cài đặt và kiểm thử ..................................... 13'),
                p('  5.1 Môi trường phát triển .......................................... 13'),
                p('  5.2 Kết quả cài đặt ................................................ 13'),
                p('  5.3 Kiểm thử ....................................................... 14'),
                p('Chương 6: Kết luận ................................................... 15'),
                p('Tài liệu tham khảo .................................................... 16'),

                pageBreak(),

                // ── CHƯƠNG 1 ──
                h1('CHƯƠNG 1: GIỚI THIỆU DỰ ÁN'),
                h2('1.1 Bối cảnh và lý do chọn đề tài'),
                p('Trong bối cảnh giáo dục đại học hiện nay, việc tổ chức kiểm tra đánh giá đóng vai trò quan trọng trong quy trình dạy và học. Tuy nhiên, các phương thức thi trắc nghiệm truyền thống (giấy tờ hoặc Google Forms đơn giản) đang bộc lộ nhiều hạn chế:'),
                li('Thiếu bảo mật: sinh viên dễ tra cứu đáp án, chia sẻ câu hỏi trong khi thi'),
                li('Tốn tài nguyên: giảng viên phải chấm điểm thủ công, không có phân tích tự động'),
                li('Không có tính năng giám sát: không theo dõi được tiến độ làm bài'),
                li('Khó quản lý: ngân hàng câu hỏi lớn rất phức tạp khi dùng công cụ đơn giản'),
                br(),
                p('Từ những vấn đề thực tế đó, nhóm quyết định xây dựng QuizPro — một nền tảng thi trắc nghiệm trực tuyến tích hợp đầy đủ tính năng, từ quản lý nội dung đến tổ chức thi và phân tích kết quả.'),

                h2('1.2 Mục tiêu dự án'),
                p('Dự án QuizPro đặt ra các mục tiêu cụ thể sau:'),
                li('Tự động hóa toàn bộ quy trình thi: tạo đề → thi → chấm điểm → thống kê'),
                li('Tích hợp cơ chế chống gian lận đa lớp (tab switch, copy, fullscreen, DevTools)'),
                li('Cung cấp giao diện trực quan, dễ sử dụng cho cả giảng viên lẫn sinh viên'),
                li('Triển khai được trên môi trường cloud với chi phí bằng 0 (Supabase + Vercel free tier)'),
                li('Áp dụng đầy đủ quy trình SDLC và mô hình Agile trong quá trình phát triển'),

                h2('1.3 Phạm vi và giới hạn'),
                pBold('Trong phạm vi:'),
                li('Quản lý môn học, ngân hàng câu hỏi, đề thi, sinh viên, nhóm thi'),
                li('Thi trực tuyến với timer, trộn câu/đáp án, chống gian lận'),
                li('Giám sát thi realtime, thống kê và xuất kết quả Excel'),
                li('Hai chế độ: Demo Mode (localStorage) và Production Mode (Supabase)'),
                li('Tính năng "Xem với tư cách sinh viên" cho giảng viên'),
                br(),
                pBold('Ngoài phạm vi:'),
                li('Hệ thống LMS đầy đủ (học liệu, video, forum)'),
                li('Thanh toán, phân cấp tổ chức phức tạp'),
                li('Mobile app native'),

                pageBreak(),

                // ── CHƯƠNG 2 ──
                h1('CHƯƠNG 2: PHÂN TÍCH YÊU CẦU'),
                h2('2.1 Yêu cầu chức năng'),
                h3('UC-01: Xác thực người dùng'),
                li('FR01: Đăng nhập bằng địa chỉ email'),
                li('FR02: Đăng nhập bằng mã sinh viên'),
                li('FR03: Đăng ký tài khoản sinh viên mới'),
                li('FR04: Phân quyền Admin (giảng viên) / Student (sinh viên)'),
                h3('UC-02: Quản lý nội dung (Admin)'),
                li('FR05: CRUD môn học'),
                li('FR06: CRUD câu hỏi với 4 đáp án, đánh dấu đáp án đúng'),
                li('FR07: Import câu hỏi hàng loạt từ file Excel/CSV'),
                li('FR08: CRUD đề thi với cấu hình thời gian, số câu, trộn đề'),
                li('FR09: Gán đề thi cho nhóm sinh viên'),
                h3('UC-03: Quản lý sinh viên (Admin)'),
                li('FR10: CRUD tài khoản sinh viên với thông tin đầy đủ'),
                li('FR11: Import danh sách sinh viên từ Excel'),
                li('FR12: Phân nhóm thi, quản lý thành viên nhóm'),
                h3('UC-04: Thi trực tuyến (Student)'),
                li('FR13: Xem danh sách đề thi được giao'),
                li('FR14: Làm bài trong thời gian quy định với timer đếm ngược'),
                li('FR15: Điều hướng câu hỏi, đánh dấu câu cần xem lại'),
                li('FR16: Nộp bài thủ công hoặc tự động khi hết giờ'),
                li('FR17: Xem kết quả và đáp án ngay sau nộp bài'),
                h3('UC-05: Giám sát và Kết quả'),
                li('FR18: Admin theo dõi tiến độ làm bài realtime'),
                li('FR19: Ghi log các hành vi gian lận'),
                li('FR20: Thống kê điểm số, phân bố, tỷ lệ đậu/rớt'),
                li('FR21: Xuất kết quả thi ra file Excel'),
                h3('UC-06: Xem với tư cách sinh viên (Admin)'),
                li('FR22: Admin vào chế độ preview trải nghiệm sinh viên'),
                li('FR23: Kết quả bài thi trong chế độ preview không được lưu vào hệ thống'),

                h2('2.2 Yêu cầu phi chức năng'),
                makeTable(
                    ['ID', 'Yêu cầu', 'Mức độ'],
                    [
                        ['NFR01', 'Thời gian tải trang < 2 giây (Vercel CDN)', 'Cao'],
                        ['NFR02', 'Giao diện responsive (mobile / tablet / desktop)', 'Cao'],
                        ['NFR03', 'Bảo mật: JWT Auth, Row Level Security (Supabase)', 'Cao'],
                        ['NFR04', 'Uptime ≥ 99% (Vercel SLA)', 'Trung bình'],
                        ['NFR05', 'Hỗ trợ đồng thời 50+ sinh viên', 'Trung bình'],
                        ['NFR06', 'Demo Mode hoạt động offline (localStorage)', 'Trung bình'],
                    ]
                ),

                h2('2.3 Use case tổng quan'),
                p('Hệ thống có hai actor chính là Admin (Giảng viên) và Student (Sinh viên). Admin có quyền truy cập toàn bộ chức năng quản lý và có thêm tính năng đặc biệt là xem hệ thống với tư cách sinh viên (preview mode). Student chỉ có thể xem đề thi được giao, thực hiện bài thi và xem kết quả của mình.'),

                pageBreak(),

                // ── CHƯƠNG 3 ──
                h1('CHƯƠNG 3: MÔ HÌNH PHÁT TRIỂN PHẦN MỀM'),
                h2('3.1 Lựa chọn mô hình Agile (Iterative)'),
                p('Nhóm lựa chọn mô hình phát triển Agile với các lý do sau:'),
                li('Yêu cầu dự án có thể thay đổi và bổ sung trong quá trình phát triển'),
                li('Cho phép demo và lấy phản hồi sau mỗi sprint ngắn (1–2 tuần)'),
                li('Phù hợp với nhóm nhỏ 3–4 người, không cần quy trình quản lý nặng nề'),
                li('Mỗi sprint tạo ra một phần sản phẩm hoạt động được'),
                br(),
                p('So sánh với mô hình Waterfall: Waterfall yêu cầu toàn bộ yêu cầu phải được xác định trước, không linh hoạt khi thay đổi. Với quy mô dự án học kỳ và nhóm sinh viên, Agile phù hợp hơn nhiều.'),

                h2('3.2 Kế hoạch Sprint'),
                makeTable(
                    ['Sprint', 'Thời gian', 'Mục tiêu', 'Kết quả chính'],
                    [
                        ['Sprint 0', 'Tuần 1', 'Khởi động dự án', 'Phân tích yêu cầu, thiết kế ERD, setup GitHub / Vercel / Supabase'],
                        ['Sprint 1', 'Tuần 2–3', 'Lõi hệ thống', 'Auth (email + mã SV), quản lý môn học, câu hỏi (CRUD + import Excel)'],
                        ['Sprint 2', 'Tuần 4–5', 'Thi & Chấm điểm', 'Tạo đề thi, sinh viên làm bài, chấm điểm tự động, xem kết quả'],
                        ['Sprint 3', 'Tuần 6–7', 'Giám sát & An toàn', 'Chống gian lận đa lớp, giám sát realtime, thống kê & biểu đồ'],
                        ['Sprint 4', 'Tuần 8', 'Hoàn thiện & Deploy', 'Preview mode, cài đặt hệ thống, UI polish, deploy Vercel production'],
                    ]
                ),

                pageBreak(),

                // ── CHƯƠNG 4 ──
                h1('CHƯƠNG 4: THIẾT KẾ HỆ THỐNG'),
                h2('4.1 Kiến trúc tổng thể'),
                p('Hệ thống QuizPro được xây dựng theo kiến trúc client-server đơn giản, tận dụng Backend-as-a-Service (BaaS) để giảm thiểu công việc phía server:'),
                li('Client: Next.js 16 (React 19) chạy trên trình duyệt, deploy trên Vercel'),
                li('Backend/Database: Supabase — cung cấp PostgreSQL, Auth (JWT) và Row Level Security'),
                li('CI/CD: GitHub → Vercel tự động deploy khi push lên nhánh main'),
                li('Demo Mode: Khi không có biến môi trường Supabase, toàn bộ dữ liệu được lưu trong localStorage'),
                br(),
                p('Kiến trúc phân tầng (lib/):'),
                li('lib/supabase.js — Supabase client + dữ liệu mẫu Demo Mode'),
                li('lib/api.js — Unified async API, tự động chọn Supabase hoặc Demo'),
                li('lib/auth.js — AuthContext (Supabase Auth hoặc Demo fallback)'),
                li('lib/settings.js — SettingsContext (tên app, logo — localStorage)'),

                h2('4.2 Thiết kế cơ sở dữ liệu (ERD)'),
                p('Cơ sở dữ liệu gồm 12 bảng, được tổ chức thành các nhóm:'),
                pBold('Nhóm người dùng:'),
                li('users — Thông tin tài khoản (role: admin/student, student_id, department...)'),
                pBold('Nhóm nội dung:'),
                li('subjects — Môn học'),
                li('questions — Câu hỏi (liên kết subjects, có difficulty: easy/medium/hard)'),
                li('answers — Đáp án (4 đáp án/câu, đánh dấu is_correct)'),
                pBold('Nhóm đề thi:'),
                li('exams — Đề thi (title, duration, status, start_time, end_time)'),
                li('exam_questions — Quan hệ N-N giữa exams và questions'),
                pBold('Nhóm tổ chức:'),
                li('groups — Nhóm thi'),
                li('group_members — Quan hệ N-N giữa groups và users'),
                li('exam_groups — Quan hệ N-N giữa exams và groups'),
                pBold('Nhóm kết quả & giám sát:'),
                li('exam_results — Kết quả thi (score, answers_detail JSONB)'),
                li('cheating_logs — Log vi phạm (type, detail, timestamp)'),
                li('active_sessions — Phiên thi đang diễn ra (answered_count, last_activity)'),

                h2('4.3 Thiết kế giao diện (UI Flow)'),
                p('Giao diện được thiết kế theo hướng dark theme, responsive, với 2 luồng chính:'),
                pBold('Luồng Admin:'),
                li('Login → AdminDashboard (Sidebar + Main Content)'),
                li('Main content thay đổi theo menu: Dashboard / Môn học / Câu hỏi / Đề thi / Sinh viên / Nhóm / Kết quả / Cài đặt'),
                li('Nút Eye icon ở sidebar footer → chuyển sang Preview Mode (StudentDashboard)'),
                pBold('Luồng Student:'),
                li('Login → StudentDashboard → Danh sách đề thi → TakeExam (fullscreen) → Kết quả'),

                pageBreak(),

                // ── CHƯƠNG 5 ──
                h1('CHƯƠNG 5: CÀI ĐẶT VÀ KIỂM THỬ'),
                h2('5.1 Môi trường phát triển'),
                makeTable(
                    ['Công cụ', 'Phiên bản', 'Mục đích'],
                    [
                        ['Node.js', '≥ 18', 'JavaScript runtime'],
                        ['Next.js', '16.1.6', 'React framework (SSR/CSR)'],
                        ['Supabase JS', '^2.97.0', 'Backend SDK'],
                        ['Recharts', '^3.7.0', 'Biểu đồ thống kê'],
                        ['xlsx', '^0.18.5', 'Import/Export Excel'],
                        ['lucide-react', '^0.575.0', 'Icon library'],
                        ['VS Code', 'latest', 'IDE'],
                        ['Git + GitHub', 'latest', 'Version control + CI/CD'],
                        ['Vercel', 'latest', 'Hosting + Deploy tự động'],
                        ['Supabase', 'latest', 'Database + Auth'],
                    ]
                ),

                h2('5.2 Kết quả cài đặt'),
                makeTable(
                    ['Chức năng', 'Trạng thái', 'Ghi chú'],
                    [
                        ['Đăng nhập / Đăng ký', '✅ Hoàn thành', 'Email + Mã SV; Supabase Auth + Demo'],
                        ['Demo Mode (localStorage)', '✅ Hoàn thành', 'Dữ liệu mẫu đầy đủ'],
                        ['Quản lý môn học', '✅ Hoàn thành', 'CRUD đầy đủ'],
                        ['Ngân hàng câu hỏi', '✅ Hoàn thành', 'CRUD + lọc + import Excel'],
                        ['Quản lý đề thi', '✅ Hoàn thành', 'Tạo đề, gán câu, trộn đề'],
                        ['Quản lý sinh viên', '✅ Hoàn thành', 'CRUD + import Excel hàng loạt'],
                        ['Nhóm thi', '✅ Hoàn thành', 'Phân nhóm + gán đề thi'],
                        ['Làm bài thi', '✅ Hoàn thành', 'Timer, điều hướng, đánh dấu câu'],
                        ['Chấm điểm tự động', '✅ Hoàn thành', 'So sánh đáp án, tính điểm/10'],
                        ['Chống gian lận', '✅ Hoàn thành', 'Tab, copy, fullscreen, DevTools'],
                        ['Giám sát realtime', '✅ Hoàn thành', 'Tiến độ từng sinh viên'],
                        ['Thống kê & Biểu đồ', '✅ Hoàn thành', 'Phân bố điểm, độ khó'],
                        ['Xuất kết quả Excel', '✅ Hoàn thành', 'xlsx'],
                        ['Xem với tư cách SV', '✅ Hoàn thành', 'Preview mode, kết quả không lưu'],
                        ['Cài đặt hệ thống', '✅ Hoàn thành', 'Đổi tên app, logo'],
                        ['Supabase data layer', '✅ Hoàn thành', 'Tất cả CRUD qua Supabase API'],
                        ['Deploy production', '✅ Hoàn thành', 'Vercel + GitHub CI/CD'],
                    ]
                ),

                h2('5.3 Kiểm thử'),
                h3('5.3.1 Kiểm thử chức năng (Functional Testing)'),
                makeTable(
                    ['Test Case', 'Input', 'Expected', 'Kết quả'],
                    [
                        ['TC01', 'Đăng nhập đúng email/MK', 'Vào dashboard', '✅ Pass'],
                        ['TC02', 'Đăng nhập sai mật khẩu', 'Hiện thông báo lỗi tiếng Việt', '✅ Pass'],
                        ['TC03', 'Đăng nhập bằng mã SV', 'Vào StudentDashboard', '✅ Pass'],
                        ['TC04', 'Tạo câu hỏi + 4 đáp án', 'Câu hỏi được lưu', '✅ Pass'],
                        ['TC05', 'Tạo đề thi 10 câu, 30 phút', 'Đề thi tạo thành công', '✅ Pass'],
                        ['TC06', 'Nộp bài khi hết giờ', 'Tự động nộp bài', '✅ Pass'],
                        ['TC07', 'Đổi tab trong khi thi', 'Cảnh báo gian lận + log', '✅ Pass'],
                        ['TC08', 'Ctrl+C trong khi thi', 'Chặn copy + log', '✅ Pass'],
                        ['TC09', 'Admin nhấn nút Eye', 'Chuyển sang preview mode', '✅ Pass'],
                        ['TC10', 'Nộp bài ở preview mode', 'Điểm hiện nhưng không lưu DB', '✅ Pass'],
                    ]
                ),
                h3('5.3.2 Kiểm thử giao diện'),
                p('Giao diện được kiểm tra trên các kích thước màn hình: 1920px (desktop), 1366px (laptop), 768px (tablet), 375px (mobile) — đều hiển thị đúng và responsive.'),

                pageBreak(),

                // ── CHƯƠNG 6 ──
                h1('CHƯƠNG 6: KẾT LUẬN'),
                h2('6.1 Kết quả đạt được'),
                li('Xây dựng thành công hệ thống thi trắc nghiệm đầy đủ tính năng, vượt mục tiêu MVP'),
                li('Triển khai production tại: https://online-quiz-eight-mu.vercel.app'),
                li('Mã nguồn công khai: https://github.com/wyn0502/PKA-KTPM-2025-2026-2'),
                li('Áp dụng đầy đủ SDLC: Phân tích → Thiết kế → Cài đặt → Kiểm thử → Triển khai'),
                li('Áp dụng mô hình Agile, chia sprint theo nhóm tính năng, demo được sau mỗi sprint'),

                h2('6.2 Hạn chế'),
                li('Demo Mode dùng localStorage — dữ liệu mất khi người dùng xóa cache trình duyệt'),
                li('Giám sát realtime hiện dùng polling (refresh theo thời gian), chưa dùng WebSocket'),
                li('Chưa có thông báo email khi có đề thi mới'),

                h2('6.3 Hướng phát triển'),
                li('Thay polling bằng Supabase Realtime (WebSocket) cho giám sát thi chính xác hơn'),
                li('Thêm thi tự luận (essay), nộp bài theo file'),
                li('Mobile app (React Native)'),
                li('Tính năng thống kê nâng cao (AI phân tích câu hỏi yếu/mạnh)'),

                h2('6.4 Kết luận'),
                p('Dự án QuizPro đã đáp ứng và vượt qua các mục tiêu đề ra của bài tập lớn môn Kỹ Thuật Phần Mềm. Nhóm đã thành công trong việc áp dụng đầy đủ kiến thức từ lý thuyết vào thực tiễn: từ việc phân tích yêu cầu người dùng, lựa chọn và áp dụng mô hình phát triển Agile, thiết kế kiến trúc hệ thống và cơ sở dữ liệu, đến cài đặt, kiểm thử và triển khai lên môi trường cloud thực tế. Sản phẩm hoạt động ổn định và có thể được áp dụng vào thực tế tại môi trường học tập của trường.'),

                pageBreak(),
                h1('TÀI LIỆU THAM KHẢO'),
                new Paragraph({ children: [new TextRun({ text: '[1] Sommerville, I. (2016). Software Engineering (10th ed.). Pearson Education.', size: 26, font: 'Times New Roman' })], spacing: { after: 120 } }),
                new Paragraph({ children: [new TextRun({ text: '[2] Next.js Documentation. https://nextjs.org/docs', size: 26, font: 'Times New Roman' })], spacing: { after: 120 } }),
                new Paragraph({ children: [new TextRun({ text: '[3] Supabase Documentation. https://supabase.com/docs', size: 26, font: 'Times New Roman' })], spacing: { after: 120 } }),
                new Paragraph({ children: [new TextRun({ text: '[4] Vercel Documentation. https://vercel.com/docs', size: 26, font: 'Times New Roman' })], spacing: { after: 120 } }),
                new Paragraph({ children: [new TextRun({ text: '[5] Schwaber, K., & Sutherland, J. (2020). The Scrum Guide. Scrum.org.', size: 26, font: 'Times New Roman' })], spacing: { after: 120 } }),
            ],
        }],
    });

    const buf = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(OUT, 'bao-cao.docx'), buf);
    console.log('✅ docs/bao-cao.docx');
}

// ─── TÀI LIỆU Ý TƯỞNG ───────────────────────────────────────────────────────
async function genYTuong() {
    const doc = new Document({
        sections: [{
            properties: { page: { margin: { top: 1440, bottom: 1440, left: 1800, right: 1260 } } },
            children: [
                new Paragraph({ children: [new TextRun({ text: 'TRƯỜNG ĐẠI HỌC PHENIKAA — KHOA CNTT', bold: true, size: 26, font: 'Times New Roman', allCaps: true })], alignment: AlignmentType.CENTER }),
                new Paragraph({ children: [new TextRun({ text: 'Kỹ Thuật Phần Mềm — HK2 2025–2026', size: 26, font: 'Times New Roman', italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
                h1('TÀI LIỆU MÔ TẢ Ý TƯỞNG DỰ ÁN'),
                new Paragraph({ children: [new TextRun({ text: 'QuizPro — Hệ thống Thi trắc nghiệm Trực tuyến', bold: true, size: 32, font: 'Times New Roman', color: '1A237E' })], alignment: AlignmentType.CENTER, spacing: { after: 300 } }),

                h2('A. VISION (Tầm nhìn)'),
                h3('Sản phẩm là gì?'),
                p('QuizPro là nền tảng web quản lý và tổ chức thi trắc nghiệm trực tuyến, hỗ trợ toàn bộ quy trình: tạo ngân hàng câu hỏi → thiết lập đề thi → tổ chức thi → chấm điểm tự động → thống kê kết quả.'),

                h3('Dành cho ai?'),
                makeTable(
                    ['Đối tượng', 'Vai trò'],
                    [
                        ['Giảng viên / Admin', 'Quản lý toàn bộ hệ thống: môn học, câu hỏi, đề thi, sinh viên, giám sát thi, xem kết quả'],
                        ['Sinh viên', 'Đăng nhập bằng email hoặc mã SV, xem đề được giao, làm bài thi, xem điểm'],
                    ]
                ),

                h3('Giải quyết vấn đề gì?'),
                p('Thi trắc nghiệm thủ công (giấy / Google Forms) có nhiều hạn chế:'),
                li('Dễ gian lận — tra đáp án trên Google, chia sẻ câu hỏi'),
                li('Không trộn đề tự động — sinh viên nhìn bài nhau'),
                li('Không giám sát được tiến độ realtime'),
                li('Chấm điểm thủ công tốn thời gian'),
                li('Không có thống kê, phân tích kết quả'),
                br(),
                p('QuizPro giải quyết tất cả những vấn đề trên trong một nền tảng duy nhất.'),

                h3('Tại sao đáng xây dựng?'),
                li('Chi phí triển khai bằng 0 (Supabase free + Vercel free)'),
                li('Có thể dùng thực tế ngay tại trường Phenikaa'),
                li('Minh chứng áp dụng SDLC và mô hình Agile đầy đủ'),

                br(),
                h2('B. APPROACH (Hướng tiếp cận)'),
                h3('MVP — Minimum Viable Product'),
                makeTable(
                    ['#', 'Tính năng', 'Ưu tiên'],
                    [
                        ['1', 'Đăng nhập / Đăng ký (email + mã sinh viên)', 'Cao'],
                        ['2', 'Quản lý môn học & câu hỏi (CRUD)', 'Cao'],
                        ['3', 'Tạo đề thi, trộn câu hỏi & đáp án', 'Cao'],
                        ['4', 'Sinh viên làm bài, nộp bài, chấm điểm tự động', 'Cao'],
                        ['5', 'Chống gian lận (tab switch, copy, fullscreen, DevTools)', 'Trung bình'],
                        ['6', 'Giám sát thi realtime', 'Trung bình'],
                        ['7', 'Thống kê kết quả, xuất Excel', 'Trung bình'],
                        ['8', 'Import sinh viên hàng loạt từ Excel', 'Thấp'],
                        ['9', 'Xem với tư cách sinh viên (preview mode)', 'Thấp'],
                    ]
                ),

                h3('Công nghệ sử dụng'),
                makeTable(
                    ['Layer', 'Công nghệ', 'Lý do chọn'],
                    [
                        ['Frontend', 'Next.js 16 (React 19)', 'SSR/CSR linh hoạt, routing sẵn có, deploy dễ với Vercel'],
                        ['Styling', 'CSS thuần (dark theme)', 'Không phụ thuộc thêm framework CSS'],
                        ['Backend/DB', 'Supabase (PostgreSQL)', 'BaaS miễn phí, tích hợp Auth + RLS'],
                        ['Charts', 'Recharts', 'Biểu đồ đẹp, tích hợp tốt với React'],
                        ['Excel', 'xlsx', 'Import/Export dữ liệu phổ biến'],
                        ['Deploy', 'Vercel', 'CI/CD tự động từ GitHub, miễn phí'],
                    ]
                ),

                h3('Tài nguyên'),
                li('Nhóm: 3–4 sinh viên'),
                li('Thời gian: ~8 tuần (theo lịch học kỳ)'),
                li('Chi phí: 0 VNĐ (tất cả free tier)'),
                li('Công cụ: VS Code, GitHub, Vercel, Supabase'),
            ],
        }],
    });

    const buf = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(OUT, 'y-tuong.docx'), buf);
    console.log('✅ docs/y-tuong.docx');
}

// ─── SLIDES ─────────────────────────────────────────────────────────────────
async function genSlides() {
    const slide = (num, title, children) => [
        new Paragraph({
            children: [new TextRun({ text: `SLIDE ${num}: ${title.toUpperCase()}`, bold: true, size: 32, font: 'Times New Roman', color: '1A237E' })],
            spacing: { before: 400, after: 200 },
            border: { bottom: { color: '1A237E', size: 12, space: 4, style: BorderStyle.SINGLE } },
        }),
        ...children,
        br(),
    ];

    const doc = new Document({
        sections: [{
            properties: { page: { margin: { top: 1440, bottom: 1440, left: 1800, right: 1260 } } },
            children: [
                new Paragraph({ children: [new TextRun({ text: 'TRƯỜNG ĐẠI HỌC PHENIKAA — KHOA CNTT', bold: true, size: 26, font: 'Times New Roman', allCaps: true })], alignment: AlignmentType.CENTER }),
                h1('NỘI DUNG SLIDE TRÌNH BÀY ĐỀ XUẤT'),
                new Paragraph({ children: [new TextRun({ text: 'Môn: Kỹ Thuật Phần Mềm  |  Nhóm: [Tên nhóm]  |  Học kỳ 2 – 2025/2026', size: 24, font: 'Times New Roman', italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),

                ...slide(1, 'Bìa', [
                    pBold('Tên dự án:'), p('QuizPro — Hệ thống Thi trắc nghiệm Trực tuyến'),
                    pBold('Nhóm thực hiện:'), p('[Danh sách thành viên]'),
                    pBold('Giảng viên hướng dẫn:'), p('[Tên giảng viên]'),
                    pBold('Demo live:'), p('https://online-quiz-eight-mu.vercel.app'),
                    pBold('Mã nguồn:'), p('https://github.com/wyn0502/PKA-KTPM-2025-2026-2'),
                ]),

                ...slide(2, 'Vấn đề & Tầm nhìn', [
                    pBold('❌ Vấn đề hiện tại:'),
                    li('Thi thủ công (giấy / Google Forms) → dễ gian lận'),
                    li('Không trộn đề → sinh viên nhìn bài nhau'),
                    li('Không giám sát được realtime'),
                    li('Chấm điểm thủ công, không có thống kê'),
                    br(),
                    pBold('✅ Giải pháp — QuizPro:'),
                    li('Thi online, trộn câu/đáp án tự động'),
                    li('Chống gian lận đa lớp (tab switch, copy, fullscreen, DevTools)'),
                    li('Chấm điểm tức thời, giám sát realtime'),
                    li('Thống kê phân bố điểm, biểu đồ trực quan'),
                    br(),
                    pBold('Đối tượng: Giảng viên (Admin) và Sinh viên của trường đại học'),
                ]),

                ...slide(3, 'Tính năng MVP', [
                    pBold('Phía Admin (Giảng viên):'),
                    li('Quản lý môn học, câu hỏi, đề thi (CRUD)'),
                    li('Import câu hỏi & sinh viên từ Excel'),
                    li('Tạo đề với thời hạn, phân nhóm sinh viên'),
                    li('Giám sát realtime, xem kết quả & xuất Excel'),
                    li('Xem với tư cách sinh viên (preview mode)'),
                    br(),
                    pBold('Phía Student (Sinh viên):'),
                    li('Đăng nhập bằng email hoặc mã sinh viên'),
                    li('Làm bài trong thời gian giới hạn'),
                    li('Xem điểm và đáp án ngay sau nộp'),
                ]),

                ...slide(4, 'Công nghệ & Kiến trúc', [
                    pBold('Tech Stack:'),
                    makeTable(
                        ['Layer', 'Công nghệ'],
                        [
                            ['Frontend', 'Next.js 16 + React 19 (Vercel)'],
                            ['Backend/DB', 'Supabase (PostgreSQL + Auth + RLS)'],
                            ['Charts', 'Recharts'],
                            ['Excel', 'xlsx'],
                            ['CI/CD', 'GitHub → Vercel (auto-deploy)'],
                        ]
                    ),
                    br(),
                    pBold('Mô hình phát triển: Agile — 4 Sprint trong 8 tuần'),
                    li('Sprint 1: Auth + Quản lý nội dung'),
                    li('Sprint 2: Thi + Chấm điểm'),
                    li('Sprint 3: Chống gian lận + Giám sát'),
                    li('Sprint 4: Hoàn thiện + Deploy'),
                ]),

                ...slide(5, 'Kế hoạch & Kết quả', [
                    pBold('Kết quả đã đạt được:'),
                    li('Tất cả tính năng MVP đã hoàn thành và vượt kế hoạch'),
                    li('Deploy tại: https://online-quiz-eight-mu.vercel.app'),
                    li('Mã nguồn: github.com/wyn0502/PKA-KTPM-2025-2026-2'),
                    br(),
                    pBold('Phân công nhóm:'),
                    makeTable(
                        ['Thành viên', 'Vai trò', 'Phụ trách chính'],
                        [
                            ['[SV1]', 'Team Lead', 'Auth, API, Supabase schema, CI/CD'],
                            ['[SV2]', 'Frontend Admin', 'Admin pages, Dashboard, Charts'],
                            ['[SV3]', 'Frontend Student', 'Student pages, TakeExam, Anti-cheat'],
                            ['[SV4]', 'QA / Docs', 'Testing, Documentation, Deployment'],
                        ]
                    ),
                    br(),
                    p('→ Nhóm sẵn sàng demo live tại đây: https://online-quiz-eight-mu.vercel.app'),
                ]),
            ],
        }],
    });

    const buf = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(OUT, 'slides.docx'), buf);
    console.log('✅ docs/slides.docx');
}

// ─── Run ─────────────────────────────────────────────────────────────────────
Promise.all([genBaoCao(), genYTuong(), genSlides()])
    .then(() => console.log('\n🎉 Tất cả file đã được tạo trong thư mục docs/'))
    .catch(err => { console.error('❌ Lỗi:', err.message); process.exit(1); });
