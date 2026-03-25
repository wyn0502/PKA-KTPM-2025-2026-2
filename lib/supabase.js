import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Running in demo mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Simple password hash for demo mode (not cryptographically secure)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'h_' + Math.abs(hash).toString(36);
}

// Default demo data
const defaultDemoData = {
    users: [
        { id: '1', email: 'admin@quiz.com', full_name: 'Nguyễn Văn Admin', role: 'admin', student_id: null, department: null, class_name: null, academic_year: null, password_hash: simpleHash('admin123'), created_at: new Date().toISOString() },
        { id: '2', email: 'student@quiz.com', full_name: 'Trần Thị Sinh Viên', role: 'student', student_id: 'SV001', department: 'Công nghệ thông tin', class_name: 'CNTT01', academic_year: 'K20', password_hash: simpleHash('student123'), created_at: new Date().toISOString() },
        { id: '3', email: 'sv002@quiz.com', full_name: 'Lê Văn Học', role: 'student', student_id: 'SV002', department: 'Công nghệ thông tin', class_name: 'CNTT01', academic_year: 'K20', password_hash: simpleHash('student123'), created_at: new Date().toISOString() },
        { id: '4', email: 'sv003@quiz.com', full_name: 'Phạm Thị Mai', role: 'student', student_id: 'SV003', department: 'Công nghệ thông tin', class_name: 'CNTT02', academic_year: 'K20', password_hash: simpleHash('student123'), created_at: new Date().toISOString() },
        { id: '5', email: 'sv004@quiz.com', full_name: 'Hoàng Văn Nam', role: 'student', student_id: 'SV004', department: 'Hệ thống thông tin', class_name: 'HTTT01', academic_year: 'K21', password_hash: simpleHash('student123'), created_at: new Date().toISOString() },
    ],
    cheating_logs: [],
    active_sessions: [],
    subjects: [
        { id: '1', name: 'Kỹ thuật phần mềm', description: 'Software Engineering - Các mô hình SDLC, Agile, Design Pattern' },
        { id: '2', name: 'Cơ sở dữ liệu', description: 'Database Fundamentals - SQL, Normalization, ER Diagram' },
        { id: '3', name: 'Lập trình Web', description: 'Web Development - HTML, CSS, JavaScript, React' },
        { id: '4', name: 'Mạng máy tính', description: 'Computer Networks - TCP/IP, OSI Model, Routing' },
    ],
    questions: [
        // Kỹ thuật phần mềm
        { id: '1', subject_id: '1', content: 'SDLC là viết tắt của gì?', difficulty: 'easy', created_at: new Date().toISOString() },
        { id: '2', subject_id: '1', content: 'Mô hình Agile thuộc loại nào?', difficulty: 'medium', created_at: new Date().toISOString() },
        { id: '3', subject_id: '1', content: 'Design Pattern nào thuộc nhóm Creational?', difficulty: 'hard', created_at: new Date().toISOString() },
        { id: '4', subject_id: '1', content: 'Trong Scrum, ai chịu trách nhiệm quản lý Product Backlog?', difficulty: 'medium', created_at: new Date().toISOString() },
        { id: '5', subject_id: '1', content: 'Unit Testing thuộc giai đoạn nào trong SDLC?', difficulty: 'easy', created_at: new Date().toISOString() },
        { id: '6', subject_id: '1', content: 'Mô hình thác nước (Waterfall) có bao nhiêu giai đoạn chính?', difficulty: 'easy', created_at: new Date().toISOString() },
        // Cơ sở dữ liệu
        { id: '7', subject_id: '2', content: 'SQL là viết tắt của gì?', difficulty: 'easy', created_at: new Date().toISOString() },
        { id: '8', subject_id: '2', content: 'Chuẩn hóa 3NF yêu cầu gì?', difficulty: 'medium', created_at: new Date().toISOString() },
        { id: '9', subject_id: '2', content: 'JOIN nào trả về tất cả bản ghi từ bảng bên trái?', difficulty: 'medium', created_at: new Date().toISOString() },
        { id: '10', subject_id: '2', content: 'Primary Key có thể chứa giá trị NULL không?', difficulty: 'easy', created_at: new Date().toISOString() },
        // Lập trình Web
        { id: '11', subject_id: '3', content: 'React là gì?', difficulty: 'easy', created_at: new Date().toISOString() },
        { id: '12', subject_id: '3', content: 'Hook nào dùng để quản lý state trong React?', difficulty: 'easy', created_at: new Date().toISOString() },
        { id: '13', subject_id: '3', content: 'CSS Flexbox dùng thuộc tính nào để căn chỉnh theo trục chính?', difficulty: 'medium', created_at: new Date().toISOString() },
        { id: '14', subject_id: '3', content: 'Virtual DOM là gì và tại sao React sử dụng nó?', difficulty: 'hard', created_at: new Date().toISOString() },
    ],
    answers: [
        // Q1: SDLC
        { id: '1', question_id: '1', content: 'Software Development Life Cycle', is_correct: true },
        { id: '2', question_id: '1', content: 'System Design Life Cycle', is_correct: false },
        { id: '3', question_id: '1', content: 'Software Design Logic Control', is_correct: false },
        { id: '4', question_id: '1', content: 'System Development Logic Cycle', is_correct: false },
        // Q2: Agile
        { id: '5', question_id: '2', content: 'Mô hình lặp (Iterative)', is_correct: true },
        { id: '6', question_id: '2', content: 'Mô hình thác nước (Waterfall)', is_correct: false },
        { id: '7', question_id: '2', content: 'Mô hình xoắn ốc (Spiral)', is_correct: false },
        { id: '8', question_id: '2', content: 'Mô hình chữ V', is_correct: false },
        // Q3: Creational Pattern
        { id: '9', question_id: '3', content: 'Singleton', is_correct: true },
        { id: '10', question_id: '3', content: 'Observer', is_correct: false },
        { id: '11', question_id: '3', content: 'Strategy', is_correct: false },
        { id: '12', question_id: '3', content: 'Adapter', is_correct: false },
        // Q4: Scrum Product Backlog
        { id: '13', question_id: '4', content: 'Product Owner', is_correct: true },
        { id: '14', question_id: '4', content: 'Scrum Master', is_correct: false },
        { id: '15', question_id: '4', content: 'Development Team', is_correct: false },
        { id: '16', question_id: '4', content: 'Stakeholders', is_correct: false },
        // Q5: Unit Testing
        { id: '17', question_id: '5', content: 'Implementation (Coding)', is_correct: true },
        { id: '18', question_id: '5', content: 'Requirements Analysis', is_correct: false },
        { id: '19', question_id: '5', content: 'System Design', is_correct: false },
        { id: '20', question_id: '5', content: 'Deployment', is_correct: false },
        // Q6: Waterfall
        { id: '21', question_id: '6', content: '5 giai đoạn', is_correct: true },
        { id: '22', question_id: '6', content: '3 giai đoạn', is_correct: false },
        { id: '23', question_id: '6', content: '7 giai đoạn', is_correct: false },
        { id: '24', question_id: '6', content: '10 giai đoạn', is_correct: false },
        // Q7: SQL
        { id: '25', question_id: '7', content: 'Structured Query Language', is_correct: true },
        { id: '26', question_id: '7', content: 'Simple Query Language', is_correct: false },
        { id: '27', question_id: '7', content: 'Standard Query Logic', is_correct: false },
        { id: '28', question_id: '7', content: 'System Query Language', is_correct: false },
        // Q8: 3NF
        { id: '29', question_id: '8', content: 'Không có phụ thuộc bắc cầu', is_correct: true },
        { id: '30', question_id: '8', content: 'Phải có khóa chính', is_correct: false },
        { id: '31', question_id: '8', content: 'Tất cả thuộc tính là nguyên tử', is_correct: false },
        { id: '32', question_id: '8', content: 'Phụ thuộc đầy đủ vào khóa', is_correct: false },
        // Q9: LEFT JOIN
        { id: '33', question_id: '9', content: 'LEFT JOIN', is_correct: true },
        { id: '34', question_id: '9', content: 'RIGHT JOIN', is_correct: false },
        { id: '35', question_id: '9', content: 'INNER JOIN', is_correct: false },
        { id: '36', question_id: '9', content: 'CROSS JOIN', is_correct: false },
        // Q10: Primary Key NULL
        { id: '37', question_id: '10', content: 'Không, Primary Key không được chứa NULL', is_correct: true },
        { id: '38', question_id: '10', content: 'Có, Primary Key có thể chứa NULL', is_correct: false },
        { id: '39', question_id: '10', content: 'Chỉ khi là composite key', is_correct: false },
        { id: '40', question_id: '10', content: 'Tùy thuộc vào DBMS', is_correct: false },
        // Q11: React là gì
        { id: '41', question_id: '11', content: 'Thư viện JavaScript để xây dựng giao diện người dùng', is_correct: true },
        { id: '42', question_id: '11', content: 'Framework backend cho Node.js', is_correct: false },
        { id: '43', question_id: '11', content: 'Ngôn ngữ lập trình mới', is_correct: false },
        { id: '44', question_id: '11', content: 'Hệ quản trị cơ sở dữ liệu', is_correct: false },
        // Q12: useState
        { id: '45', question_id: '12', content: 'useState', is_correct: true },
        { id: '46', question_id: '12', content: 'useEffect', is_correct: false },
        { id: '47', question_id: '12', content: 'useContext', is_correct: false },
        { id: '48', question_id: '12', content: 'useRef', is_correct: false },
        // Q13: Flexbox justify-content
        { id: '49', question_id: '13', content: 'justify-content', is_correct: true },
        { id: '50', question_id: '13', content: 'align-items', is_correct: false },
        { id: '51', question_id: '13', content: 'flex-direction', is_correct: false },
        { id: '52', question_id: '13', content: 'flex-wrap', is_correct: false },
        // Q14: Virtual DOM
        { id: '53', question_id: '14', content: 'Bản sao nhẹ của DOM thật, giúp tối ưu hiệu năng render', is_correct: true },
        { id: '54', question_id: '14', content: 'Một framework CSS mới', is_correct: false },
        { id: '55', question_id: '14', content: 'Công cụ debug cho trình duyệt', is_correct: false },
        { id: '56', question_id: '14', content: 'API của trình duyệt để quản lý DOM', is_correct: false },
    ],
    exams: [
        {
            id: '1', title: 'Kiểm tra Giữa kỳ - KTPM', subject_id: '1',
            duration_minutes: 30, total_questions: 6, shuffle_questions: true,
            shuffle_answers: true, show_result: true, status: 'active',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
        },
        {
            id: '2', title: 'Kiểm tra CSDL - Chương 1', subject_id: '2',
            duration_minutes: 20, total_questions: 4, shuffle_questions: true,
            shuffle_answers: true, show_result: true, status: 'active',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
        },
        {
            id: '3', title: 'Quiz Lập trình Web', subject_id: '3',
            duration_minutes: 15, total_questions: 4, shuffle_questions: false,
            shuffle_answers: true, show_result: false, status: 'draft',
            start_time: null, end_time: null,
            created_at: new Date().toISOString()
        },
    ],
    exam_questions: [
        { exam_id: '1', question_id: '1' },
        { exam_id: '1', question_id: '2' },
        { exam_id: '1', question_id: '3' },
        { exam_id: '1', question_id: '4' },
        { exam_id: '1', question_id: '5' },
        { exam_id: '1', question_id: '6' },
        { exam_id: '2', question_id: '7' },
        { exam_id: '2', question_id: '8' },
        { exam_id: '2', question_id: '9' },
        { exam_id: '2', question_id: '10' },
        { exam_id: '3', question_id: '11' },
        { exam_id: '3', question_id: '12' },
        { exam_id: '3', question_id: '13' },
        { exam_id: '3', question_id: '14' },
    ],
    groups: [
        { id: '1', name: 'CNTT K20 - Nhóm 1', description: 'Sinh viên CNTT Khóa 20 Nhóm 1' },
        { id: '2', name: 'CNTT K20 - Nhóm 2', description: 'Sinh viên CNTT Khóa 20 Nhóm 2' },
    ],
    group_members: [
        { group_id: '1', user_id: '2' },
        { group_id: '1', user_id: '3' },
        { group_id: '2', user_id: '4' },
        { group_id: '2', user_id: '5' },
    ],
    exam_groups: [
        { exam_id: '1', group_id: '1' },
        { exam_id: '1', group_id: '2' },
        { exam_id: '2', group_id: '1' },
    ],
    exam_results: [],
};

// ==========================================
// localStorage persistence layer
// ==========================================
const STORAGE_KEY = 'quizpro_demo_data';
const COUNTER_KEY = 'quizpro_id_counter';

function loadFromStorage() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function saveToStorage(data) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { console.warn('Failed to save to localStorage:', e); }
}

function loadCounter() {
    if (typeof window === 'undefined') return 200;
    try {
        const val = localStorage.getItem(COUNTER_KEY);
        return val ? parseInt(val, 10) : 200;
    } catch { return 200; }
}

function saveCounter(val) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(COUNTER_KEY, String(val)); } catch { }
}

const demoData = loadFromStorage() || JSON.parse(JSON.stringify(defaultDemoData));
let idCounter = loadCounter();

function generateId() {
    idCounter++;
    saveCounter(idCounter);
    return String(idCounter);
}

function persist() {
    saveToStorage(demoData);
}

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Demo API
export const demoApi = {
    resetData() {
        Object.keys(defaultDemoData).forEach(key => {
            demoData[key] = JSON.parse(JSON.stringify(defaultDemoData[key]));
        });
        idCounter = 200;
        saveCounter(idCounter);
        persist();
    },

    // Auth
    login(emailOrStudentId, password) {
        if (!emailOrStudentId || !password) return { success: false, error: 'Vui lòng nhập thông tin đăng nhập và mật khẩu' };

        const input = emailOrStudentId.trim();
        let user;
        if (isValidEmail(input)) {
            user = demoData.users.find(u => u.email === input.toLowerCase());
        } else {
            user = demoData.users.find(u => u.student_id && u.student_id.toLowerCase() === input.toLowerCase());
        }

        if (!user) return { success: false, error: 'Thông tin đăng nhập hoặc mật khẩu không đúng' };

        const hash = simpleHash(password);
        if (user.password_hash && user.password_hash !== hash) {
            return { success: false, error: 'Thông tin đăng nhập hoặc mật khẩu không đúng' };
        }

        const { password_hash, ...safeUser } = user;
        return { success: true, user: safeUser };
    },

    register(userData) {
        if (!userData.email || !userData.full_name) {
            return { success: false, error: 'Vui lòng nhập đầy đủ thông tin' };
        }
        if (!isValidEmail(userData.email)) {
            return { success: false, error: 'Email không hợp lệ' };
        }
        if (userData.password && userData.password.length < 6) {
            return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
        }

        const email = userData.email.toLowerCase().trim();
        const exists = demoData.users.find(u => u.email === email);
        if (exists) return { success: false, error: 'Email đã tồn tại trong hệ thống' };

        const newUser = {
            id: generateId(),
            email,
            full_name: userData.full_name.trim(),
            student_id: userData.student_id?.trim() || null,
            department: userData.department?.trim() || null,
            class_name: userData.class_name?.trim() || null,
            academic_year: userData.academic_year?.trim() || null,
            role: 'student',
            password_hash: simpleHash(userData.password || 'student123'),
            created_at: new Date().toISOString(),
        };
        demoData.users.push(newUser);
        persist();

        const { password_hash, ...safeUser } = newUser;
        return { success: true, user: safeUser };
    },

    // Users
    getUsers() {
        return demoData.users.map(({ password_hash, ...u }) => u);
    },

    getUserById(id) {
        const user = demoData.users.find(u => u.id === id);
        if (!user) return null;
        const { password_hash, ...safeUser } = user;
        return safeUser;
    },

    addUser(data) {
        if (!data.email || !data.full_name) return { success: false, error: 'Thiếu thông tin bắt buộc' };
        if (!isValidEmail(data.email)) return { success: false, error: 'Email không hợp lệ' };

        const email = data.email.toLowerCase().trim();
        const exists = demoData.users.find(u => u.email === email);
        if (exists) return { success: false, error: 'Email đã tồn tại' };

        const user = {
            id: generateId(),
            email,
            full_name: data.full_name.trim(),
            student_id: data.student_id?.trim() || null,
            department: data.department?.trim() || null,
            class_name: data.class_name?.trim() || null,
            academic_year: data.academic_year?.trim() || null,
            role: data.role || 'student',
            password_hash: simpleHash(data.password || 'student123'),
            created_at: new Date().toISOString(),
        };
        demoData.users.push(user);
        persist();
        const { password_hash, ...safeUser } = user;
        return { success: true, user: safeUser };
    },

    // Bulk import students from array
    bulkImportUsers(usersArray) {
        let imported = 0;
        let skipped = 0;
        const errors = [];

        usersArray.forEach((row, index) => {
            const email = (row.email || row.Email || '').toLowerCase().trim();
            const fullName = (row.full_name || row['Họ tên'] || row['Ho ten'] || row.name || row.Name || '').trim();
            const studentId = (row.student_id || row['Mã SV'] || row['Ma SV'] || row.msv || '').trim();
            const department = (row.department || row['Khoa'] || row['Phòng/Khoa'] || '').trim();
            const className = (row.class_name || row['Lớp'] || row['Lop'] || '').trim();
            const academicYear = (row.academic_year || row['Khóa'] || row['Khoa hoc'] || row['Niên khóa'] || '').trim();

            if (!email || !fullName) {
                errors.push(`Dòng ${index + 2}: Thiếu email hoặc họ tên`);
                skipped++;
                return;
            }
            if (!isValidEmail(email)) {
                errors.push(`Dòng ${index + 2}: Email "${email}" không hợp lệ`);
                skipped++;
                return;
            }
            if (demoData.users.find(u => u.email === email)) {
                errors.push(`Dòng ${index + 2}: Email "${email}" đã tồn tại`);
                skipped++;
                return;
            }

            demoData.users.push({
                id: generateId(),
                email,
                full_name: fullName,
                student_id: studentId || null,
                department: department || null,
                class_name: className || null,
                academic_year: academicYear || null,
                role: 'student',
                password_hash: simpleHash('student123'),
                created_at: new Date().toISOString(),
            });
            imported++;
        });

        persist();
        return { imported, skipped, errors, total: usersArray.length };
    },

    // Get unique values for filters
    getDepartments() {
        return [...new Set(demoData.users.filter(u => u.department).map(u => u.department))].sort();
    },
    getClassNames() {
        return [...new Set(demoData.users.filter(u => u.class_name).map(u => u.class_name))].sort();
    },
    getAcademicYears() {
        return [...new Set(demoData.users.filter(u => u.academic_year).map(u => u.academic_year))].sort();
    },

    updateUser(id, data) {
        const idx = demoData.users.findIndex(u => u.id === id);
        if (idx < 0) return null;
        demoData.users[idx] = {
            ...demoData.users[idx],
            full_name: data.full_name?.trim() || demoData.users[idx].full_name,
            student_id: data.student_id?.trim() ?? demoData.users[idx].student_id,
            department: data.department?.trim() ?? demoData.users[idx].department,
            class_name: data.class_name?.trim() ?? demoData.users[idx].class_name,
            academic_year: data.academic_year?.trim() ?? demoData.users[idx].academic_year,
            role: data.role || demoData.users[idx].role,
        };
        if (data.password) {
            demoData.users[idx].password_hash = simpleHash(data.password);
        }
        persist();
        const { password_hash, ...safeUser } = demoData.users[idx];
        return safeUser;
    },

    deleteUser(id) {
        const user = demoData.users.find(u => u.id === id);
        if (!user) return false;
        if (['admin@quiz.com', 'student@quiz.com'].includes(user.email)) return false;

        demoData.users = demoData.users.filter(u => u.id !== id);
        demoData.group_members = demoData.group_members.filter(gm => gm.user_id !== id);
        demoData.exam_results = demoData.exam_results.filter(r => r.user_id !== id);
        persist();
        return true;
    },

    // Subjects
    getSubjects() { return [...demoData.subjects]; },

    addSubject(data) {
        if (!data.name?.trim()) return null;
        const subject = { id: generateId(), name: data.name.trim(), description: data.description?.trim() || '' };
        demoData.subjects.push(subject);
        persist();
        return subject;
    },

    updateSubject(id, data) {
        const idx = demoData.subjects.findIndex(s => s.id === id);
        if (idx < 0) return null;
        demoData.subjects[idx] = {
            ...demoData.subjects[idx],
            name: data.name?.trim() || demoData.subjects[idx].name,
            description: data.description?.trim() ?? demoData.subjects[idx].description,
        };
        persist();
        return demoData.subjects[idx];
    },

    deleteSubject(id) {
        const hasQuestions = demoData.questions.some(q => q.subject_id === id);
        if (hasQuestions) return { success: false, error: 'Không thể xóa môn học đang có câu hỏi' };
        demoData.subjects = demoData.subjects.filter(s => s.id !== id);
        persist();
        return { success: true };
    },

    // Questions
    getQuestions(subjectId = null) {
        let qs = [...demoData.questions];
        if (subjectId) qs = qs.filter(q => q.subject_id === subjectId);
        return qs.map(q => ({
            ...q,
            subject: demoData.subjects.find(s => s.id === q.subject_id),
            answers: demoData.answers.filter(a => a.question_id === q.id),
        }));
    },

    getQuestionById(id) {
        const q = demoData.questions.find(q => q.id === id);
        if (!q) return null;
        return {
            ...q,
            subject: demoData.subjects.find(s => s.id === q.subject_id),
            answers: demoData.answers.filter(a => a.question_id === q.id),
        };
    },

    addQuestion(data) {
        if (!data.content?.trim() || !data.subject_id) return null;
        const hasCorrect = data.answers?.some(a => a.is_correct && a.content?.trim());
        if (!hasCorrect) return null;

        const question = {
            id: generateId(),
            content: data.content.trim(),
            subject_id: data.subject_id,
            difficulty: data.difficulty || 'easy',
            created_at: new Date().toISOString(),
        };
        demoData.questions.push(question);
        if (data.answers) {
            data.answers.forEach(a => {
                if (a.content?.trim()) {
                    demoData.answers.push({
                        id: generateId(),
                        question_id: question.id,
                        content: a.content.trim(),
                        is_correct: !!a.is_correct,
                    });
                }
            });
        }
        persist();
        return this.getQuestionById(question.id);
    },

    updateQuestion(id, data) {
        const idx = demoData.questions.findIndex(q => q.id === id);
        if (idx < 0) return null;

        demoData.questions[idx] = {
            ...demoData.questions[idx],
            content: data.content?.trim() || demoData.questions[idx].content,
            subject_id: data.subject_id || demoData.questions[idx].subject_id,
            difficulty: data.difficulty || demoData.questions[idx].difficulty,
        };
        if (data.answers) {
            demoData.answers = demoData.answers.filter(a => a.question_id !== id);
            data.answers.forEach(a => {
                if (a.content?.trim()) {
                    demoData.answers.push({
                        id: generateId(),
                        question_id: id,
                        content: a.content.trim(),
                        is_correct: !!a.is_correct,
                    });
                }
            });
        }
        persist();
        return this.getQuestionById(id);
    },

    deleteQuestion(id) {
        demoData.questions = demoData.questions.filter(q => q.id !== id);
        demoData.answers = demoData.answers.filter(a => a.question_id !== id);
        demoData.exam_questions = demoData.exam_questions.filter(eq => eq.question_id !== id);
        persist();
        return true;
    },

    // Exams
    getExams() {
        return demoData.exams.map(e => ({
            ...e,
            subject: demoData.subjects.find(s => s.id === e.subject_id),
            questions: demoData.exam_questions.filter(eq => eq.exam_id === e.id)
                .map(eq => this.getQuestionById(eq.question_id)).filter(Boolean),
            groups: demoData.exam_groups.filter(eg => eg.exam_id === e.id)
                .map(eg => demoData.groups.find(g => g.id === eg.group_id)).filter(Boolean),
            result_count: demoData.exam_results.filter(r => r.exam_id === e.id).length,
        }));
    },

    getExamById(id) {
        const exam = demoData.exams.find(e => e.id === id);
        if (!exam) return null;
        return {
            ...exam,
            subject: demoData.subjects.find(s => s.id === exam.subject_id),
            questions: demoData.exam_questions.filter(eq => eq.exam_id === id)
                .map(eq => this.getQuestionById(eq.question_id)).filter(Boolean),
            groups: demoData.exam_groups.filter(eg => eg.exam_id === id)
                .map(eg => demoData.groups.find(g => g.id === eg.group_id)).filter(Boolean),
        };
    },

    addExam(data) {
        if (!data.title?.trim() || !data.subject_id) return null;
        const exam = {
            id: generateId(),
            title: data.title.trim(),
            subject_id: data.subject_id,
            duration_minutes: Math.max(1, parseInt(data.duration_minutes) || 30),
            total_questions: data.question_ids?.length || 0,
            shuffle_questions: !!data.shuffle_questions,
            shuffle_answers: !!data.shuffle_answers,
            show_result: data.show_result !== false,
            status: data.status || 'draft',
            start_time: data.start_time || null,
            end_time: data.end_time || null,
            created_at: new Date().toISOString(),
        };
        demoData.exams.push(exam);
        if (data.question_ids) {
            data.question_ids.forEach(qid => demoData.exam_questions.push({ exam_id: exam.id, question_id: qid }));
        }
        if (data.group_ids) {
            data.group_ids.forEach(gid => demoData.exam_groups.push({ exam_id: exam.id, group_id: gid }));
        }
        persist();
        return this.getExamById(exam.id);
    },

    updateExam(id, data) {
        const idx = demoData.exams.findIndex(e => e.id === id);
        if (idx < 0) return null;
        demoData.exams[idx] = {
            ...demoData.exams[idx],
            title: data.title?.trim() || demoData.exams[idx].title,
            subject_id: data.subject_id || demoData.exams[idx].subject_id,
            duration_minutes: data.duration_minutes ? Math.max(1, parseInt(data.duration_minutes)) : demoData.exams[idx].duration_minutes,
            total_questions: data.question_ids?.length ?? demoData.exams[idx].total_questions,
            shuffle_questions: data.shuffle_questions ?? demoData.exams[idx].shuffle_questions,
            shuffle_answers: data.shuffle_answers ?? demoData.exams[idx].shuffle_answers,
            show_result: data.show_result ?? demoData.exams[idx].show_result,
            status: data.status || demoData.exams[idx].status,
            start_time: data.start_time ?? demoData.exams[idx].start_time,
            end_time: data.end_time ?? demoData.exams[idx].end_time,
        };
        if (data.question_ids) {
            demoData.exam_questions = demoData.exam_questions.filter(eq => eq.exam_id !== id);
            data.question_ids.forEach(qid => demoData.exam_questions.push({ exam_id: id, question_id: qid }));
        }
        if (data.group_ids) {
            demoData.exam_groups = demoData.exam_groups.filter(eg => eg.exam_id !== id);
            data.group_ids.forEach(gid => demoData.exam_groups.push({ exam_id: id, group_id: gid }));
        }
        persist();
        return this.getExamById(id);
    },

    deleteExam(id) {
        demoData.exams = demoData.exams.filter(e => e.id !== id);
        demoData.exam_questions = demoData.exam_questions.filter(eq => eq.exam_id !== id);
        demoData.exam_groups = demoData.exam_groups.filter(eg => eg.exam_id !== id);
        demoData.exam_results = demoData.exam_results.filter(r => r.exam_id !== id);
        persist();
        return true;
    },

    updateExamStatus(id, status) {
        const idx = demoData.exams.findIndex(e => e.id === id);
        if (idx >= 0) {
            demoData.exams[idx].status = status;
            persist();
            return demoData.exams[idx];
        }
        return null;
    },

    // Student exams
    getExamsForStudent(userId) {
        const userGroups = demoData.group_members.filter(gm => gm.user_id === userId).map(gm => gm.group_id);
        const examIds = [...new Set(demoData.exam_groups.filter(eg => userGroups.includes(eg.group_id)).map(eg => eg.exam_id))];
        return demoData.exams
            .filter(e => examIds.includes(e.id) && e.status === 'active')
            .map(e => ({
                ...e,
                subject: demoData.subjects.find(s => s.id === e.subject_id),
                questions: demoData.exam_questions.filter(eq => eq.exam_id === e.id)
                    .map(eq => this.getQuestionById(eq.question_id)).filter(Boolean),
                hasSubmitted: demoData.exam_results.some(r => r.exam_id === e.id && r.user_id === userId),
            }));
    },

    // Groups
    getGroups() {
        return demoData.groups.map(g => ({
            ...g,
            members: demoData.group_members.filter(gm => gm.group_id === g.id)
                .map(gm => demoData.users.find(u => u.id === gm.user_id)).filter(Boolean)
                .map(({ password_hash, ...u }) => u),
        }));
    },

    addGroup(data) {
        if (!data.name?.trim()) return null;
        const group = { id: generateId(), name: data.name.trim(), description: data.description?.trim() || '' };
        demoData.groups.push(group);
        if (data.member_ids) {
            data.member_ids.forEach(uid => demoData.group_members.push({ group_id: group.id, user_id: uid }));
        }
        persist();
        return group;
    },

    updateGroup(id, data) {
        const idx = demoData.groups.findIndex(g => g.id === id);
        if (idx < 0) return null;
        demoData.groups[idx] = {
            ...demoData.groups[idx],
            name: data.name?.trim() || demoData.groups[idx].name,
            description: data.description?.trim() ?? demoData.groups[idx].description,
        };
        if (data.member_ids) {
            demoData.group_members = demoData.group_members.filter(gm => gm.group_id !== id);
            data.member_ids.forEach(uid => demoData.group_members.push({ group_id: id, user_id: uid }));
        }
        persist();
        return demoData.groups[idx];
    },

    deleteGroup(id) {
        demoData.groups = demoData.groups.filter(g => g.id !== id);
        demoData.group_members = demoData.group_members.filter(gm => gm.group_id !== id);
        demoData.exam_groups = demoData.exam_groups.filter(eg => eg.group_id !== id);
        persist();
        return true;
    },

    // Exam Results
    submitExam(examId, userId, userAnswers) {
        const exam = this.getExamById(examId);
        if (!exam) return { success: false, error: 'Bài thi không tồn tại' };

        const alreadySubmitted = demoData.exam_results.find(r => r.exam_id === examId && r.user_id === userId);
        if (alreadySubmitted) return { success: false, error: 'Bạn đã nộp bài thi này rồi' };

        let correctCount = 0;
        const answersDetail = [];
        exam.questions.forEach(q => {
            const userAnswer = userAnswers[q.id];
            const correctAnswer = q.answers.find(a => a.is_correct);
            const isCorrect = userAnswer === correctAnswer?.id;
            if (isCorrect) correctCount++;
            answersDetail.push({
                question_id: q.id,
                question_content: q.content,
                user_answer_id: userAnswer || null,
                correct_answer_id: correctAnswer?.id,
                is_correct: isCorrect,
                answers: q.answers,
            });
        });

        const totalQuestions = exam.questions.length;
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) / 10 : 0;

        const result = {
            id: generateId(),
            exam_id: examId,
            user_id: userId,
            score,
            total_questions: totalQuestions,
            correct_count: correctCount,
            answers_detail: answersDetail,
            started_at: new Date(Date.now() - exam.duration_minutes * 60 * 1000).toISOString(),
            submitted_at: new Date().toISOString(),
        };
        demoData.exam_results.push(result);
        persist();
        return { success: true, result };
    },

    getResults(userId = null) {
        let results = [...demoData.exam_results];
        if (userId) results = results.filter(r => r.user_id === userId);
        return results.map(r => ({
            ...r,
            exam: demoData.exams.find(e => e.id === r.exam_id),
            user: (() => {
                const u = demoData.users.find(u => u.id === r.user_id);
                if (!u) return null;
                const { password_hash, ...safe } = u;
                return safe;
            })(),
        }));
    },

    getAllResults() {
        return this.getResults();
    },

    // Stats
    getStats() {
        return {
            totalUsers: demoData.users.filter(u => u.role === 'student').length,
            totalQuestions: demoData.questions.length,
            totalExams: demoData.exams.length,
            totalResults: demoData.exam_results.length,
            activeExams: demoData.exams.filter(e => e.status === 'active').length,
            totalSubjects: demoData.subjects.length,
            totalGroups: demoData.groups.length,
        };
    },

    // Active exam sessions (for real-time monitoring)
    startExamSession(examId, userId) {
        // Remove any existing session for this user+exam
        demoData.active_sessions = (demoData.active_sessions || []).filter(
            s => !(s.exam_id === examId && s.user_id === userId)
        );
        const session = {
            id: generateId(),
            exam_id: examId,
            user_id: userId,
            started_at: new Date().toISOString(),
            answered_count: 0,
            total_questions: 0,
            last_activity: new Date().toISOString(),
            status: 'in_progress', // 'in_progress' | 'submitted'
        };
        demoData.active_sessions.push(session);
        persist();
        return session;
    },

    updateExamSession(examId, userId, answeredCount, totalQuestions) {
        const sessions = demoData.active_sessions || [];
        const idx = sessions.findIndex(s => s.exam_id === examId && s.user_id === userId);
        if (idx >= 0) {
            sessions[idx].answered_count = answeredCount;
            sessions[idx].total_questions = totalQuestions;
            sessions[idx].last_activity = new Date().toISOString();
            persist();
        }
    },

    endExamSession(examId, userId) {
        const sessions = demoData.active_sessions || [];
        const idx = sessions.findIndex(s => s.exam_id === examId && s.user_id === userId);
        if (idx >= 0) {
            sessions[idx].status = 'submitted';
            sessions[idx].last_activity = new Date().toISOString();
            persist();
        }
    },

    getActiveSessionsForExam(examId) {
        return (demoData.active_sessions || [])
            .filter(s => s.exam_id === examId && s.status === 'in_progress')
            .map(s => {
                const user = demoData.users.find(u => u.id === s.user_id);
                const cheatingCount = (demoData.cheating_logs || []).filter(
                    l => l.exam_id === examId && l.user_id === s.user_id
                ).length;
                return {
                    ...s,
                    user: user ? (() => { const { password_hash, ...safe } = user; return safe; })() : null,
                    cheating_count: cheatingCount,
                };
            });
    },

    getExamMonitorData(examId) {
        const exam = this.getExamById(examId);
        if (!exam) return null;
        const activeSessions = this.getActiveSessionsForExam(examId);
        const completedResults = demoData.exam_results.filter(r => r.exam_id === examId);
        const totalAssigned = new Set([
            ...(demoData.active_sessions || []).filter(s => s.exam_id === examId).map(s => s.user_id),
            ...completedResults.map(r => r.user_id),
        ]).size;
        return {
            exam,
            activeSessions,
            completedCount: completedResults.length,
            totalAssigned,
            completedResults: completedResults.map(r => {
                const user = demoData.users.find(u => u.id === r.user_id);
                return {
                    ...r,
                    user: user ? (() => { const { password_hash, ...safe } = user; return safe; })() : null,
                    cheating_count: (demoData.cheating_logs || []).filter(l => l.exam_id === examId && l.user_id === r.user_id).length,
                };
            }),
        };
    },

    // Cheating detection logs
    addCheatingLog(examId, userId, type, detail = '') {
        const log = {
            id: generateId(),
            exam_id: examId,
            user_id: userId,
            type, // 'tab_switch', 'copy', 'paste', 'right_click', 'fullscreen_exit', 'devtools'
            detail,
            timestamp: new Date().toISOString(),
        };
        demoData.cheating_logs.push(log);
        persist();
        return log;
    },

    getCheatingLogs(examId = null, userId = null) {
        let logs = [...(demoData.cheating_logs || [])];
        if (examId) logs = logs.filter(l => l.exam_id === examId);
        if (userId) logs = logs.filter(l => l.user_id === userId);
        return logs.map(l => ({
            ...l,
            user: (() => {
                const u = demoData.users.find(u => u.id === l.user_id);
                if (!u) return null;
                const { password_hash, ...safe } = u;
                return safe;
            })(),
            exam: demoData.exams.find(e => e.id === l.exam_id),
        }));
    },

    getCheatingCountForResult(examId, userId) {
        return (demoData.cheating_logs || []).filter(l => l.exam_id === examId && l.user_id === userId).length;
    },

    // Export helpers
    getExamResultsForExport(examId = null) {
        let results = [...demoData.exam_results];
        if (examId) results = results.filter(r => r.exam_id === examId);
        return results.map(r => {
            const user = demoData.users.find(u => u.id === r.user_id);
            const exam = demoData.exams.find(e => e.id === r.exam_id);
            return {
                'Mã SV': user?.student_id || '',
                'Họ tên': user?.full_name || '',
                'Email': user?.email || '',
                'Đề thi': exam?.title || '',
                'Điểm': r.score,
                'Số câu đúng': r.correct_count,
                'Tổng câu': r.total_questions,
                'Kết quả': r.score >= 5 ? 'Đạt' : 'Không đạt',
                'Cảnh báo gian lận': (demoData.cheating_logs || []).filter(l => l.exam_id === r.exam_id && l.user_id === r.user_id).length,
                'Thời gian nộp': new Date(r.submitted_at).toLocaleString('vi-VN'),
            };
        });
    },
};
