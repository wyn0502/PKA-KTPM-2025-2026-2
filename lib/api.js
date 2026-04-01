import { supabase, demoApi } from './supabase';

const isDemo = !supabase;

// ─── Supabase implementation ─────────────────────────────────────────────────
const sbApi = {
    // Stats
    async getStats() {
        const [
            { count: totalStudents },
            { count: totalQuestions },
            { count: totalExams },
            { count: activeExams },
            { data: subjects },
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
            supabase.from('questions').select('*', { count: 'exact', head: true }),
            supabase.from('exams').select('*', { count: 'exact', head: true }),
            supabase.from('exams').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('subjects').select('id, name'),
        ]);
        const subjectStats = await Promise.all((subjects || []).map(async (s) => {
            const [{ count: qc }, { count: ec }, { count: rc }] = await Promise.all([
                supabase.from('questions').select('*', { count: 'exact', head: true }).eq('subject_id', s.id),
                supabase.from('exams').select('*', { count: 'exact', head: true }).eq('subject_id', s.id),
                supabase.from('exam_results').select('exam_id, exams!inner(subject_id)', { count: 'exact', head: true }),
            ]);
            return { id: s.id, name: s.name, question_count: qc || 0, exam_count: ec || 0, result_count: rc || 0 };
        }));
        return { totalStudents: totalStudents || 0, totalQuestions: totalQuestions || 0, totalExams: totalExams || 0, activeExams: activeExams || 0, subjectStats };
    },

    // Subjects
    async getSubjects() {
        const { data } = await supabase.from('subjects').select('*').order('name');
        return data || [];
    },
    async addSubject(d) {
        const { data, error } = await supabase.from('subjects').insert(d).select().single();
        return error ? { success: false, error: error.message } : { success: true, subject: data };
    },
    async updateSubject(id, d) {
        const { error } = await supabase.from('subjects').update(d).eq('id', id);
        return error ? { success: false, error: error.message } : { success: true };
    },
    async deleteSubject(id) {
        const { error } = await supabase.from('subjects').delete().eq('id', id);
        return error ? { success: false, error: error.message } : { success: true };
    },

    // Questions
    async getQuestions(subjectId) {
        let q = supabase.from('questions').select('*, answers(*)').order('created_at');
        if (subjectId) q = q.eq('subject_id', subjectId);
        const { data } = await q;
        return data || [];
    },
    async addQuestion({ subject_id, content, difficulty, answers }) {
        const { data: question, error } = await supabase.from('questions').insert({ subject_id, content, difficulty }).select().single();
        if (error) return { success: false, error: error.message };
        if (answers?.length) {
            await supabase.from('answers').insert(answers.map(a => ({ ...a, question_id: question.id })));
        }
        return { success: true, question };
    },
    async updateQuestion(id, { content, difficulty, answers }) {
        await supabase.from('questions').update({ content, difficulty }).eq('id', id);
        if (answers?.length) {
            await supabase.from('answers').delete().eq('question_id', id);
            await supabase.from('answers').insert(answers.map(a => ({ ...a, question_id: id })));
        }
        return { success: true };
    },
    async deleteQuestion(id) {
        const { error } = await supabase.from('questions').delete().eq('id', id);
        return error ? { success: false } : { success: true };
    },

    // Exams
    async getExams() {
        const { data: exams } = await supabase.from('exams').select('*, subjects(name), exam_questions(question_id), exam_groups(group_id)').order('created_at', { ascending: false });
        return (exams || []).map(e => ({
            ...e,
            subject_name: e.subjects?.name,
            question_ids: (e.exam_questions || []).map(eq => eq.question_id),
            group_ids: (e.exam_groups || []).map(eg => eg.group_id),
        }));
    },
    async getExamById(id) {
        const { data: exam } = await supabase.from('exams').select('*, exam_questions(questions(*, answers(*)))').eq('id', id).single();
        if (!exam) return null;
        return { ...exam, questions: (exam.exam_questions || []).map(eq => eq.questions).filter(Boolean) };
    },
    async addExam({ title, subject_id, duration_minutes, shuffle_questions, shuffle_answers, show_result, status, start_time, end_time, question_ids, group_ids }) {
        const { data: exam, error } = await supabase.from('exams').insert({
            title, subject_id, duration_minutes, shuffle_questions, shuffle_answers, show_result,
            status, start_time, end_time, total_questions: question_ids?.length || 0,
        }).select().single();
        if (error) return { success: false, error: error.message };
        if (question_ids?.length) {
            await supabase.from('exam_questions').insert(question_ids.map(qid => ({ exam_id: exam.id, question_id: qid })));
        }
        if (group_ids?.length) {
            await supabase.from('exam_groups').insert(group_ids.map(gid => ({ exam_id: exam.id, group_id: gid })));
        }
        return { success: true, exam };
    },
    async updateExam(id, { title, subject_id, duration_minutes, shuffle_questions, shuffle_answers, show_result, status, start_time, end_time, question_ids, group_ids }) {
        await supabase.from('exams').update({ title, subject_id, duration_minutes, shuffle_questions, shuffle_answers, show_result, status, start_time, end_time, total_questions: question_ids?.length || 0 }).eq('id', id);
        if (question_ids) {
            await supabase.from('exam_questions').delete().eq('exam_id', id);
            if (question_ids.length) await supabase.from('exam_questions').insert(question_ids.map(qid => ({ exam_id: id, question_id: qid })));
        }
        if (group_ids !== undefined) {
            await supabase.from('exam_groups').delete().eq('exam_id', id);
            if (group_ids.length) await supabase.from('exam_groups').insert(group_ids.map(gid => ({ exam_id: id, group_id: gid })));
        }
        return { success: true };
    },
    async deleteExam(id) {
        await supabase.from('exams').delete().eq('id', id);
        return { success: true };
    },

    // Students
    async getStudents() {
        const { data } = await supabase.from('users').select('*').eq('role', 'student').order('full_name');
        return data || [];
    },
    async addStudent(d) {
        const password = d.password || 'student123';
        // Save admin session before creating new auth user
        const { data: { session: adminSession } } = await supabase.auth.getSession();
        // Create auth account
        const { error: signUpError } = await supabase.auth.signUp({ email: d.email, password });
        // Restore admin session immediately
        if (adminSession) {
            await supabase.auth.setSession({ access_token: adminSession.access_token, refresh_token: adminSession.refresh_token });
        }
        if (signUpError && !signUpError.message.includes('already registered')) {
            return { success: false, error: signUpError.message };
        }
        const { full_name, email, student_id, department, class_name, academic_year } = d;
        const { data, error } = await supabase.from('users').insert({ full_name, email, student_id, department, class_name, academic_year, role: 'student', password_hash: '' }).select().single();
        return error ? { success: false, error: error.message } : { success: true, student: data };
    },
    async updateStudent(id, d) {
        const { error } = await supabase.from('users').update(d).eq('id', id);
        return error ? { success: false } : { success: true };
    },
    async deleteStudent(id) {
        await supabase.from('users').delete().eq('id', id);
        return { success: true };
    },
    async importStudents(students) {
        const rows = students.map(s => ({ ...s, role: 'student', password_hash: '' }));
        const { error } = await supabase.from('users').upsert(rows, { onConflict: 'email' });
        return error ? { success: false, error: error.message, imported: 0 } : { success: true, imported: rows.length };
    },

    // Groups
    async getGroups() {
        const { data: groups } = await supabase.from('groups').select('*, group_members(user_id, users(id, full_name, email, student_id)), exam_groups(exam_id)').order('name');
        return (groups || []).map(g => ({
            ...g,
            members: (g.group_members || []).map(m => m.users).filter(Boolean),
            exam_ids: (g.exam_groups || []).map(eg => eg.exam_id),
        }));
    },
    async addGroup(d) {
        const { data, error } = await supabase.from('groups').insert(d).select().single();
        return error ? { success: false } : { success: true, group: data };
    },
    async updateGroup(id, d) {
        await supabase.from('groups').update(d).eq('id', id);
        return { success: true };
    },
    async deleteGroup(id) {
        await supabase.from('groups').delete().eq('id', id);
        return { success: true };
    },
    async addGroupMember(groupId, userId) {
        await supabase.from('group_members').upsert({ group_id: groupId, user_id: userId });
        return { success: true };
    },
    async removeGroupMember(groupId, userId) {
        await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
        return { success: true };
    },
    async assignExamToGroup(examId, groupId) {
        await supabase.from('exam_groups').upsert({ exam_id: examId, group_id: groupId });
        return { success: true };
    },
    async removeExamFromGroup(examId, groupId) {
        await supabase.from('exam_groups').delete().eq('exam_id', examId).eq('group_id', groupId);
        return { success: true };
    },

    // Results
    async getAllResults() {
        const { data } = await supabase.from('exam_results').select('*, users(full_name, email, student_id), exams(title)').order('submitted_at', { ascending: false });
        return (data || []).map(r => ({ ...r, user_name: r.users?.full_name, user_email: r.users?.email, student_id: r.users?.student_id, exam_title: r.exams?.title }));
    },
    async getResultsByExam(examId) {
        const { data } = await supabase.from('exam_results').select('*, users(full_name, email, student_id)').eq('exam_id', examId).order('submitted_at', { ascending: false });
        return (data || []).map(r => ({ ...r, user_name: r.users?.full_name, student_id: r.users?.student_id }));
    },
    async getResultsByUser(userId) {
        const { data } = await supabase.from('exam_results').select('*, exams(title, show_result, subjects(name))').eq('user_id', userId).order('submitted_at', { ascending: false });
        return (data || []).map(r => ({ ...r, exam_title: r.exams?.title, subject_name: r.exams?.subjects?.name, show_result: r.exams?.show_result }));
    },
    async deleteResult(id) {
        const { error } = await supabase.from('exam_results').delete().eq('id', id);
        return error ? { success: false } : { success: true };
    },
    async regradeResult(id) {
        const { data: result } = await supabase.from('exam_results').select('answers_detail, total_questions').eq('id', id).single();
        if (!result || !result.answers_detail) return { success: false };
        const details = result.answers_detail;
        const correctCount = details.filter(d => d.is_correct).length;
        const totalQuestions = details.length;
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) / 10 : 0;
        const { error } = await supabase.from('exam_results').update({ score, correct_count: correctCount, total_questions: totalQuestions }).eq('id', id);
        return error ? { success: false } : { success: true, score, correct_count: correctCount };
    },
    async updateScore(id, score) {
        const { error } = await supabase.from('exam_results').update({ score }).eq('id', id);
        return error ? { success: false } : { success: true, score };
    },
    async allowRetake(examId, userId) {
        const { error } = await supabase.from('exam_results').delete().eq('exam_id', examId).eq('user_id', userId);
        return error ? { success: false } : { success: true };
    },
    async submitExam({ exam_id, user_id, score, total_questions, correct_count, answers_detail, started_at }) {
        const { data, error } = await supabase.from('exam_results').insert({ exam_id, user_id, score, total_questions, correct_count, answers_detail, started_at }).select().single();
        if (error) return { success: false };
        await supabase.from('active_sessions').delete().eq('exam_id', exam_id).eq('user_id', user_id);
        return { success: true, result: data };
    },
    async getAllActiveExams() {
        const { data: exams } = await supabase.from('exams').select('*, subjects(name), exam_questions(questions(*, answers(*)))').eq('status', 'active');
        return (exams || []).map(e => ({
            ...e,
            subject_name: e.subjects?.name,
            questions: (e.exam_questions || []).map(eq => eq.questions).filter(Boolean),
            already_done: false,
        }));
    },
    async getAvailableExams(userId) {
        // Get groups the user belongs to
        const { data: memberships } = await supabase.from('group_members').select('group_id').eq('user_id', userId);
        const groupIds = (memberships || []).map(m => m.group_id);
        if (!groupIds.length) return [];
        const { data: examGroups } = await supabase.from('exam_groups').select('exam_id').in('group_id', groupIds);
        const examIds = [...new Set((examGroups || []).map(eg => eg.exam_id))];
        if (!examIds.length) return [];
        const { data: exams } = await supabase.from('exams').select('*, subjects(name), exam_questions(questions(*, answers(*)))').in('id', examIds).eq('status', 'active');
        const { data: doneResults } = await supabase.from('exam_results').select('exam_id').eq('user_id', userId);
        const doneIds = new Set((doneResults || []).map(r => r.exam_id));
        return (exams || []).map(e => ({
            ...e,
            subject_name: e.subjects?.name,
            questions: (e.exam_questions || []).map(eq => eq.questions).filter(Boolean),
            already_done: doneIds.has(e.id),
        }));
    },

    // Cheating
    async getCheatingLogs(examId) {
        const q = supabase.from('cheating_logs').select('*, users(full_name, student_id)').order('timestamp', { ascending: false });
        const { data } = examId ? await q.eq('exam_id', examId) : await q;
        return (data || []).map(l => ({ ...l, user_name: l.users?.full_name, student_id: l.users?.student_id }));
    },
    async logCheating({ exam_id, user_id, type, detail }) {
        await supabase.from('cheating_logs').insert({ exam_id, user_id, type, detail });
        return { success: true };
    },

    // Active sessions
    async getActiveSessions(examId) {
        const [{ data }, { data: cheatingData }] = await Promise.all([
            supabase.from('active_sessions').select('*, users(full_name, student_id)').eq('exam_id', examId),
            supabase.from('cheating_logs').select('user_id').eq('exam_id', examId),
        ]);
        const cheatingCounts = {};
        (cheatingData || []).forEach(l => { cheatingCounts[l.user_id] = (cheatingCounts[l.user_id] || 0) + 1; });
        return (data || []).map(s => ({ ...s, user_name: s.users?.full_name, student_id: s.users?.student_id, cheating_count: cheatingCounts[s.user_id] || 0 }));
    },
    async registerSession({ exam_id, user_id, total_questions }) {
        await supabase.from('active_sessions').upsert({ exam_id, user_id, total_questions, cheating_count: 0, status: 'in_progress', last_activity: new Date().toISOString() });
        return { success: true };
    },
    async updateSession(examId, userId, updates) {
        await supabase.from('active_sessions').update({ ...updates, last_activity: new Date().toISOString() }).eq('exam_id', examId).eq('user_id', userId);
        return { success: true };
    },
    async removeSession(examId, userId) {
        await supabase.from('active_sessions').delete().eq('exam_id', examId).eq('user_id', userId);
        return { success: true };
    },

    resetData: async () => ({ success: false, error: 'Reset không khả dụng ở Supabase mode' }),
};

// ─── Unified API (auto-select Supabase or Demo) ───────────────────────────────
export const api = {
    getStats:            async ()       => isDemo ? demoApi.getStats()            : sbApi.getStats(),
    getSubjects:         async ()       => isDemo ? demoApi.getSubjects()         : sbApi.getSubjects(),
    addSubject:          async (d)      => isDemo ? demoApi.addSubject(d)         : sbApi.addSubject(d),
    updateSubject:       async (id, d)  => isDemo ? demoApi.updateSubject(id, d)  : sbApi.updateSubject(id, d),
    deleteSubject:       async (id)     => isDemo ? demoApi.deleteSubject(id)     : sbApi.deleteSubject(id),
    getQuestions:        async (sid)    => isDemo ? demoApi.getQuestions(sid)     : sbApi.getQuestions(sid),
    addQuestion:         async (d)      => isDemo ? demoApi.addQuestion(d)        : sbApi.addQuestion(d),
    updateQuestion:      async (id, d)  => isDemo ? demoApi.updateQuestion(id, d) : sbApi.updateQuestion(id, d),
    deleteQuestion:      async (id)     => isDemo ? demoApi.deleteQuestion(id)    : sbApi.deleteQuestion(id),
    getExams:            async ()       => isDemo ? demoApi.getExams()            : sbApi.getExams(),
    getExamById:         async (id)     => isDemo ? demoApi.getExamById(id)       : sbApi.getExamById(id),
    addExam:             async (d)      => isDemo ? demoApi.addExam(d)            : sbApi.addExam(d),
    updateExam:          async (id, d)  => isDemo ? demoApi.updateExam(id, d)     : sbApi.updateExam(id, d),
    deleteExam:          async (id)     => isDemo ? demoApi.deleteExam(id)        : sbApi.deleteExam(id),
    getStudents:         async ()       => isDemo ? demoApi.getStudents()         : sbApi.getStudents(),
    addStudent:          async (d)      => isDemo ? demoApi.addStudent(d)         : sbApi.addStudent(d),
    updateStudent:       async (id, d)  => isDemo ? demoApi.updateStudent(id, d)  : sbApi.updateStudent(id, d),
    deleteStudent:       async (id)     => isDemo ? demoApi.deleteStudent(id)     : sbApi.deleteStudent(id),
    importStudents:      async (ss)     => isDemo ? demoApi.importStudents(ss)    : sbApi.importStudents(ss),
    getGroups:           async ()       => isDemo ? demoApi.getGroups()           : sbApi.getGroups(),
    addGroup:            async (d)      => isDemo ? demoApi.addGroup(d)           : sbApi.addGroup(d),
    updateGroup:         async (id, d)  => isDemo ? demoApi.updateGroup(id, d)    : sbApi.updateGroup(id, d),
    deleteGroup:         async (id)     => isDemo ? demoApi.deleteGroup(id)       : sbApi.deleteGroup(id),
    addGroupMember:      async (g, u)   => isDemo ? demoApi.addGroupMember(g, u)  : sbApi.addGroupMember(g, u),
    removeGroupMember:   async (g, u)   => isDemo ? demoApi.removeGroupMember(g, u): sbApi.removeGroupMember(g, u),
    assignExamToGroup:   async (e, g)   => isDemo ? demoApi.assignExamToGroup(e, g): sbApi.assignExamToGroup(e, g),
    removeExamFromGroup: async (e, g)   => isDemo ? demoApi.removeExamFromGroup(e, g): sbApi.removeExamFromGroup(e, g),
    getAllResults:        async ()       => isDemo ? demoApi.getAllResults()        : sbApi.getAllResults(),
    getResultsByExam:    async (id)     => isDemo ? demoApi.getResultsByExam(id)  : sbApi.getResultsByExam(id),
    getResultsByUser:    async (uid)    => isDemo ? demoApi.getResultsByUser(uid) : sbApi.getResultsByUser(uid),
    deleteResult:        async (id)     => isDemo ? { success: false }            : sbApi.deleteResult(id),
    regradeResult:       async (id)     => isDemo ? { success: false }            : sbApi.regradeResult(id),
    updateScore:         async (id, s)  => isDemo ? { success: false }            : sbApi.updateScore(id, s),
    allowRetake:         async (eid, uid) => isDemo ? { success: false }          : sbApi.allowRetake(eid, uid),
    submitExam:          async (d)      => isDemo ? demoApi.submitExam(d.exam_id, d.user_id, d.answers) : sbApi.submitExam(d),
    getAllActiveExams:    async ()       => isDemo ? demoApi.getExams().then(es => es.filter(e => e.status === 'active')) : sbApi.getAllActiveExams(),
    getAvailableExams:   async (uid)    => isDemo ? demoApi.getAvailableExams(uid): sbApi.getAvailableExams(uid),
    getCheatingLogs:     async (eid)    => isDemo ? demoApi.getCheatingLogs(eid)  : sbApi.getCheatingLogs(eid),
    logCheating:         async (d)      => isDemo ? demoApi.logCheating(d)        : sbApi.logCheating(d),
    getActiveSessions:   async (eid)    => isDemo ? demoApi.getActiveSessions(eid): sbApi.getActiveSessions(eid),
    registerSession:     async (d)      => isDemo ? demoApi.registerSession(d)    : sbApi.registerSession(d),
    updateSession:       async (e, u, d)=> isDemo ? demoApi.updateSession(e, u, d): sbApi.updateSession(e, u, d),
    removeSession:       async (e, u)   => isDemo ? demoApi.removeSession(e, u)   : sbApi.removeSession(e, u),
    login:               async (e, p)   => demoApi.login(e, p),
    register:            async (d)      => demoApi.register(d),
    resetData:           async ()       => isDemo ? demoApi.resetData()           : sbApi.resetData(),
};
