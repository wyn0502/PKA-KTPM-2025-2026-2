import { supabase, demoApi } from './supabase';

const isDemo = !supabase;

// Export all demoApi methods as async for demo mode
// For Supabase mode, we'd call supabase.from(...) queries
// For now, wrap demoApi to be async-compatible
export const api = {
    getStats: async () => demoApi.getStats(),
    getSubjects: async () => demoApi.getSubjects(),
    addSubject: async (data) => demoApi.addSubject(data),
    updateSubject: async (id, data) => demoApi.updateSubject(id, data),
    deleteSubject: async (id) => demoApi.deleteSubject(id),
    getQuestions: async (subjectId) => demoApi.getQuestions(subjectId),
    addQuestion: async (data) => demoApi.addQuestion(data),
    updateQuestion: async (id, data) => demoApi.updateQuestion(id, data),
    deleteQuestion: async (id) => demoApi.deleteQuestion(id),
    getExams: async () => demoApi.getExams(),
    getExamById: async (id) => demoApi.getExamById(id),
    addExam: async (data) => demoApi.addExam(data),
    updateExam: async (id, data) => demoApi.updateExam(id, data),
    deleteExam: async (id) => demoApi.deleteExam(id),
    getStudents: async () => demoApi.getStudents(),
    addStudent: async (data) => demoApi.addStudent(data),
    updateStudent: async (id, data) => demoApi.updateStudent(id, data),
    deleteStudent: async (id) => demoApi.deleteStudent(id),
    importStudents: async (students) => demoApi.importStudents(students),
    getGroups: async () => demoApi.getGroups(),
    addGroup: async (data) => demoApi.addGroup(data),
    updateGroup: async (id, data) => demoApi.updateGroup(id, data),
    deleteGroup: async (id) => demoApi.deleteGroup(id),
    addGroupMember: async (groupId, userId) => demoApi.addGroupMember(groupId, userId),
    removeGroupMember: async (groupId, userId) => demoApi.removeGroupMember(groupId, userId),
    assignExamToGroup: async (examId, groupId) => demoApi.assignExamToGroup(examId, groupId),
    removeExamFromGroup: async (examId, groupId) => demoApi.removeExamFromGroup(examId, groupId),
    getAllResults: async () => demoApi.getAllResults(),
    getResultsByExam: async (examId) => demoApi.getResultsByExam(examId),
    getResultsByUser: async (userId) => demoApi.getResultsByUser(userId),
    submitExam: async (data) => demoApi.submitExam(data),
    getAvailableExams: async (userId) => demoApi.getAvailableExams(userId),
    getCheatingLogs: async (examId) => demoApi.getCheatingLogs(examId),
    logCheating: async (data) => demoApi.logCheating(data),
    getActiveSessions: async (examId) => demoApi.getActiveSessions(examId),
    registerSession: async (data) => demoApi.registerSession(data),
    updateSession: async (examId, userId, updates) => demoApi.updateSession(examId, userId, updates),
    removeSession: async (examId, userId) => demoApi.removeSession(examId, userId),
    login: async (email, password) => demoApi.login(email, password),
    register: async (data) => demoApi.register(data),
};
