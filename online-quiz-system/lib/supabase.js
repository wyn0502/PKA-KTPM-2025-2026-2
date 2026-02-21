import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Running in demo mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Default demo data (used when no localStorage data exists)
const defaultDemoData = {
    users: [
        { id: '1', email: 'admin@quiz.com', full_name: 'Nguyễn Văn Admin', role: 'admin', student_id: null, created_at: new Date().toISOString() },
        { id: '2', email: 'student@quiz.com', full_name: 'Trần Thị Sinh Viên', role: 'student', student_id: 'SV001', created_at: new Date().toISOString() },
        { id: '3', email: 'sv002@quiz.com', full_name: 'Lê Văn Học', role: 'student', student_id: 'SV002', created_at: new Date().toISOString() },
    ],
    subjects: [
        { id: '1', name: 'Kỹ thuật phần mềm', description: 'Software Engineering' },
        { id: '2', name: 'Cơ sở dữ liệu', description: 'Database Fundamentals' },
        { id: '3', name: 'Lập trình Web', description: 'Web Development' },
    ],
    questions: [
        { id: '1', subject_id: '1', content: 'SDLC là viết tắt của gì?', difficulty: 'easy', created_at: new Date().toISOString() },
        { id: '2', subject_id: '1', content: 'Mô hình Agile thuộc loại nào?', difficulty: 'medium', created_at: new Date().toISOString() },
        { id: '3', subject_id: '1', content: 'Design Pattern nào thuộc nhóm Creational?', difficulty: 'hard', created_at: new Date().toISOString() },
        { id: '4', subject_id: '2', content: 'SQL là viết tắt của gì?', difficulty: 'easy', created_at: new Date().toISOString() },
        { id: '5', subject_id: '2', content: 'Chuẩn hóa 3NF yêu cầu gì?', difficulty: 'medium', created_at: new Date().toISOString() },
    ],
    answers: [
        { id: '1', question_id: '1', content: 'Software Development Life Cycle', is_correct: true },
        { id: '2', question_id: '1', content: 'System Design Life Cycle', is_correct: false },
        { id: '3', question_id: '1', content: 'Software Design Logic Control', is_correct: false },
        { id: '4', question_id: '1', content: 'System Development Logic Cycle', is_correct: false },
        { id: '5', question_id: '2', content: 'Mô hình lặp (Iterative)', is_correct: true },
        { id: '6', question_id: '2', content: 'Mô hình thác nước (Waterfall)', is_correct: false },
        { id: '7', question_id: '2', content: 'Mô hình xoắn ốc (Spiral)', is_correct: false },
        { id: '8', question_id: '2', content: 'Mô hình chữ V', is_correct: false },
        { id: '9', question_id: '3', content: 'Singleton', is_correct: true },
        { id: '10', question_id: '3', content: 'Observer', is_correct: false },
        { id: '11', question_id: '3', content: 'Strategy', is_correct: false },
        { id: '12', question_id: '3', content: 'Adapter', is_correct: false },
        { id: '13', question_id: '4', content: 'Structured Query Language', is_correct: true },
        { id: '14', question_id: '4', content: 'Simple Query Language', is_correct: false },
        { id: '15', question_id: '4', content: 'Standard Query Logic', is_correct: false },
        { id: '16', question_id: '4', content: 'System Query Language', is_correct: false },
        { id: '17', question_id: '5', content: 'Không có phụ thuộc bắc cầu', is_correct: true },
        { id: '18', question_id: '5', content: 'Phải có khóa chính', is_correct: false },
        { id: '19', question_id: '5', content: 'Tất cả thuộc tính là nguyên tử', is_correct: false },
        { id: '20', question_id: '5', content: 'Phụ thuộc đầy đủ vào khóa', is_correct: false },
    ],
    exams: [
        {
            id: '1', title: 'Kiểm tra Giữa kỳ - KTPM', subject_id: '1',
            duration_minutes: 30, total_questions: 3, shuffle_questions: true,
            shuffle_answers: true, show_result: true, status: 'active',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
        },
    ],
    exam_questions: [
        { exam_id: '1', question_id: '1' },
        { exam_id: '1', question_id: '2' },
        { exam_id: '1', question_id: '3' },
    ],
    groups: [
        { id: '1', name: 'CNTT K20 - Nhóm 1', description: 'Sinh viên CNTT Khóa 20 Nhóm 1' },
        { id: '2', name: 'CNTT K20 - Nhóm 2', description: 'Sinh viên CNTT Khóa 20 Nhóm 2' },
    ],
    group_members: [
        { group_id: '1', user_id: '2' },
        { group_id: '2', user_id: '3' },
    ],
    exam_groups: [
        { exam_id: '1', group_id: '1' },
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
    if (typeof window === 'undefined') return 100;
    try {
        const val = localStorage.getItem(COUNTER_KEY);
        return val ? parseInt(val, 10) : 100;
    } catch { return 100; }
}

function saveCounter(val) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(COUNTER_KEY, String(val)); } catch { }
}

// Initialize data from localStorage or defaults
const demoData = loadFromStorage() || JSON.parse(JSON.stringify(defaultDemoData));
let idCounter = loadCounter();

function generateId() {
    idCounter++;
    saveCounter(idCounter);
    return String(idCounter);
}

// Save after every mutation
function persist() {
    saveToStorage(demoData);
}

// Demo API helpers
export const demoApi = {
    // Reset data to defaults
    resetData() {
        Object.keys(defaultDemoData).forEach(key => {
            demoData[key] = JSON.parse(JSON.stringify(defaultDemoData[key]));
        });
        idCounter = 100;
        saveCounter(idCounter);
        persist();
    },

    // Auth
    login(email, password) {
        const user = demoData.users.find(u => u.email === email);
        if (user) return { success: true, user };
        return { success: false, error: 'Email hoặc mật khẩu không đúng' };
    },

    register(userData) {
        const exists = demoData.users.find(u => u.email === userData.email);
        if (exists) return { success: false, error: 'Email đã tồn tại' };
        const newUser = { id: generateId(), ...userData, role: 'student', created_at: new Date().toISOString() };
        demoData.users.push(newUser);
        persist();
        return { success: true, user: newUser };
    },

    // Users
    getUsers() { return [...demoData.users]; },
    getUserById(id) { return demoData.users.find(u => u.id === id); },

    addUser(data) {
        const exists = demoData.users.find(u => u.email === data.email);
        if (exists) return { success: false, error: 'Email đã tồn tại' };
        const user = { id: generateId(), ...data, created_at: new Date().toISOString() };
        demoData.users.push(user);
        persist();
        return { success: true, user };
    },

    updateUser(id, data) {
        const idx = demoData.users.findIndex(u => u.id === id);
        if (idx < 0) return null;
        demoData.users[idx] = { ...demoData.users[idx], ...data };
        persist();
        return demoData.users[idx];
    },

    deleteUser(id) {
        demoData.users = demoData.users.filter(u => u.id !== id);
        demoData.group_members = demoData.group_members.filter(gm => gm.user_id !== id);
        demoData.exam_results = demoData.exam_results.filter(r => r.user_id !== id);
        persist();
        return true;
    },

    // Subjects
    getSubjects() { return [...demoData.subjects]; },
    addSubject(data) {
        const subject = { id: generateId(), ...data };
        demoData.subjects.push(subject);
        persist();
        return subject;
    },
    updateSubject(id, data) {
        const idx = demoData.subjects.findIndex(s => s.id === id);
        if (idx >= 0) { demoData.subjects[idx] = { ...demoData.subjects[idx], ...data }; persist(); return demoData.subjects[idx]; }
        return null;
    },
    deleteSubject(id) {
        demoData.subjects = demoData.subjects.filter(s => s.id !== id);
        persist();
        return true;
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
        const question = { id: generateId(), content: data.content, subject_id: data.subject_id, difficulty: data.difficulty, created_at: new Date().toISOString() };
        demoData.questions.push(question);
        if (data.answers) {
            data.answers.forEach(a => {
                const answer = { id: generateId(), question_id: question.id, content: a.content, is_correct: a.is_correct };
                demoData.answers.push(answer);
            });
        }
        persist();
        return this.getQuestionById(question.id);
    },
    updateQuestion(id, data) {
        const idx = demoData.questions.findIndex(q => q.id === id);
        if (idx < 0) return null;
        demoData.questions[idx] = { ...demoData.questions[idx], content: data.content, subject_id: data.subject_id, difficulty: data.difficulty };
        if (data.answers) {
            demoData.answers = demoData.answers.filter(a => a.question_id !== id);
            data.answers.forEach(a => {
                demoData.answers.push({ id: generateId(), question_id: id, content: a.content, is_correct: a.is_correct });
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
        const exam = {
            id: generateId(), title: data.title, subject_id: data.subject_id,
            duration_minutes: data.duration_minutes, total_questions: data.question_ids?.length || 0,
            shuffle_questions: data.shuffle_questions || false, shuffle_answers: data.shuffle_answers || false,
            show_result: data.show_result !== false, status: data.status || 'draft',
            start_time: data.start_time || null, end_time: data.end_time || null,
            created_at: new Date().toISOString()
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
        demoData.exams[idx] = { ...demoData.exams[idx], ...data, total_questions: data.question_ids?.length || demoData.exams[idx].total_questions };
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
        persist();
        return true;
    },
    updateExamStatus(id, status) {
        const idx = demoData.exams.findIndex(e => e.id === id);
        if (idx >= 0) { demoData.exams[idx].status = status; persist(); return demoData.exams[idx]; }
        return null;
    },

    // Exams for students
    getExamsForStudent(userId) {
        const userGroups = demoData.group_members.filter(gm => gm.user_id === userId).map(gm => gm.group_id);
        const examIds = demoData.exam_groups.filter(eg => userGroups.includes(eg.group_id)).map(eg => eg.exam_id);
        return demoData.exams
            .filter(e => examIds.includes(e.id) && e.status === 'active')
            .map(e => ({
                ...e,
                subject: demoData.subjects.find(s => s.id === e.subject_id),
                hasSubmitted: demoData.exam_results.some(r => r.exam_id === e.id && r.user_id === userId),
            }));
    },

    // Groups
    getGroups() {
        return demoData.groups.map(g => ({
            ...g,
            members: demoData.group_members.filter(gm => gm.group_id === g.id)
                .map(gm => demoData.users.find(u => u.id === gm.user_id)).filter(Boolean),
        }));
    },
    addGroup(data) {
        const group = { id: generateId(), name: data.name, description: data.description || '' };
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
        demoData.groups[idx] = { ...demoData.groups[idx], name: data.name, description: data.description };
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
                user_answer_id: userAnswer,
                correct_answer_id: correctAnswer?.id,
                is_correct: isCorrect,
                answers: q.answers,
            });
        });

        const result = {
            id: generateId(),
            exam_id: examId,
            user_id: userId,
            score: Math.round((correctCount / exam.questions.length) * 100) / 10,
            total_questions: exam.questions.length,
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
            user: demoData.users.find(u => u.id === r.user_id),
        }));
    },

    getAllResults() {
        return demoData.exam_results.map(r => ({
            ...r,
            exam: demoData.exams.find(e => e.id === r.exam_id),
            user: demoData.users.find(u => u.id === r.user_id),
        }));
    },

    // Stats
    getStats() {
        return {
            totalUsers: demoData.users.filter(u => u.role === 'student').length,
            totalQuestions: demoData.questions.length,
            totalExams: demoData.exams.length,
            totalResults: demoData.exam_results.length,
            activeExams: demoData.exams.filter(e => e.status === 'active').length,
        };
    },
};
