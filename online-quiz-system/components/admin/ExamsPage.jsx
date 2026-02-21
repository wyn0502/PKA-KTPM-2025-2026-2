'use client';

import { useState, useEffect } from 'react';
import { demoApi } from '@/lib/supabase';
import {
    ClipboardList, Plus, Pencil, Trash2, X, Play, Pause,
    Clock, Shuffle, Eye, Users, CheckSquare
} from 'lucide-react';

export default function ExamsPage() {
    const [exams, setExams] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        title: '', subject_id: '', duration_minutes: 30,
        shuffle_questions: true, shuffle_answers: true, show_result: true,
        status: 'draft', question_ids: [], group_ids: [],
        start_time: '', end_time: '',
    });

    useEffect(() => { loadData(); }, []);

    const loadData = () => {
        setExams(demoApi.getExams());
        setQuestions(demoApi.getQuestions());
        setSubjects(demoApi.getSubjects());
        setGroups(demoApi.getGroups());
    };

    const handleSave = () => {
        if (!form.title.trim() || !form.subject_id) return;
        if (editing) {
            demoApi.updateExam(editing.id, form);
        } else {
            demoApi.addExam(form);
        }
        closeModal();
        loadData();
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({
            title: '', subject_id: '', duration_minutes: 30,
            shuffle_questions: true, shuffle_answers: true, show_result: true,
            status: 'draft', question_ids: [], group_ids: [],
            start_time: '', end_time: '',
        });
    };

    const handleEdit = (exam) => {
        setEditing(exam);
        setForm({
            title: exam.title, subject_id: exam.subject_id, duration_minutes: exam.duration_minutes,
            shuffle_questions: exam.shuffle_questions, shuffle_answers: exam.shuffle_answers,
            show_result: exam.show_result, status: exam.status,
            question_ids: exam.questions?.map(q => q.id) || [],
            group_ids: exam.groups?.map(g => g.id) || [],
            start_time: exam.start_time || '', end_time: exam.end_time || '',
        });
        setShowModal(true);
    };

    const toggleStatus = (exam) => {
        const newStatus = exam.status === 'active' ? 'closed' : 'active';
        demoApi.updateExamStatus(exam.id, newStatus);
        loadData();
    };

    const handleDelete = (id) => {
        if (confirm('Bạn có chắc muốn xóa đề thi này?')) { demoApi.deleteExam(id); loadData(); }
    };

    const toggleQuestionSelection = (qId) => {
        setForm(prev => ({
            ...prev,
            question_ids: prev.question_ids.includes(qId)
                ? prev.question_ids.filter(id => id !== qId)
                : [...prev.question_ids, qId]
        }));
    };

    const toggleGroupSelection = (gId) => {
        setForm(prev => ({
            ...prev,
            group_ids: prev.group_ids.includes(gId)
                ? prev.group_ids.filter(id => id !== gId)
                : [...prev.group_ids, gId]
        }));
    };

    const filteredQuestions = form.subject_id
        ? questions.filter(q => q.subject_id === form.subject_id)
        : questions;

    const statusInfo = {
        draft: { label: 'Nháp', badge: 'badge-warning' },
        active: { label: 'Đang mở', badge: 'badge-success' },
        closed: { label: 'Đã đóng', badge: 'badge-danger' },
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản lý Đề thi</h1>
                    <p className="page-subtitle">{exams.length} đề thi</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Tạo đề thi
                </button>
            </div>

            {exams.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><ClipboardList size={28} /></div>
                        <h3 className="empty-state-title">Chưa có đề thi nào</h3>
                        <p className="empty-state-text">Tạo đề thi đầu tiên cho sinh viên</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {exams.map(exam => (
                        <div key={exam.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{exam.title}</h3>
                                        <span className={`badge ${statusInfo[exam.status]?.badge}`}>
                                            {statusInfo[exam.status]?.label}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Clock size={14} /> {exam.duration_minutes} phút
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <CheckSquare size={14} /> {exam.questions?.length || 0} câu hỏi
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Users size={14} /> {exam.groups?.map(g => g.name).join(', ') || 'Chưa gán nhóm'}
                                        </span>
                                        {exam.shuffle_questions && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Shuffle size={14} /> Trộn đề
                                            </span>
                                        )}
                                        {exam.show_result && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Eye size={14} /> Hiển thị kết quả
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="btn-group">
                                    <button className={`btn btn-sm ${exam.status === 'active' ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleStatus(exam)}>
                                        {exam.status === 'active' ? <><Pause size={14} /> Đóng</> : <><Play size={14} /> Mở</>}
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(exam)}>
                                        <Pencil size={14} />
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exam.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Sửa đề thi' : 'Tạo đề thi mới'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Tên đề thi</label>
                                <input className="form-input" placeholder="VD: Kiểm tra giữa kỳ" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Môn học</label>
                                    <select className="form-select" value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value, question_ids: [] })}>
                                        <option value="">Chọn môn học...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Thời gian (phút)</label>
                                    <input type="number" className="form-input" min="1" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 30 })} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
                                <label className="form-checkbox">
                                    <input type="checkbox" checked={form.shuffle_questions} onChange={e => setForm({ ...form, shuffle_questions: e.target.checked })} />
                                    <Shuffle size={16} /> Trộn câu hỏi
                                </label>
                                <label className="form-checkbox">
                                    <input type="checkbox" checked={form.shuffle_answers} onChange={e => setForm({ ...form, shuffle_answers: e.target.checked })} />
                                    <Shuffle size={16} /> Trộn đáp án
                                </label>
                                <label className="form-checkbox">
                                    <input type="checkbox" checked={form.show_result} onChange={e => setForm({ ...form, show_result: e.target.checked })} />
                                    <Eye size={16} /> Hiện kết quả sau nộp
                                </label>
                            </div>

                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label className="form-label" style={{ margin: 0 }}>Chọn câu hỏi ({form.question_ids.length} đã chọn)</label>
                                    {filteredQuestions.length > 0 && (
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm"
                                            style={{ color: 'var(--primary-light)' }}
                                            onClick={() => {
                                                const allIds = filteredQuestions.map(q => q.id);
                                                const allSelected = allIds.every(id => form.question_ids.includes(id));
                                                setForm(prev => ({
                                                    ...prev,
                                                    question_ids: allSelected ? [] : allIds,
                                                }));
                                            }}
                                        >
                                            <CheckSquare size={14} />
                                            {filteredQuestions.every(q => form.question_ids.includes(q.id)) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                        </button>
                                    )}
                                </div>
                                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 8 }}>
                                    {filteredQuestions.length === 0 ? (
                                        <p style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
                                            {form.subject_id ? 'Không có câu hỏi cho môn này' : 'Chọn môn học trước'}
                                        </p>
                                    ) : filteredQuestions.map(q => (
                                        <label key={q.id} className="form-checkbox" style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                                            <input type="checkbox" checked={form.question_ids.includes(q.id)} onChange={() => toggleQuestionSelection(q.id)} />
                                            <span style={{ flex: 1 }}>{q.content}</span>
                                            <span className={`badge badge-${q.difficulty}`} style={{ fontSize: '0.7rem' }}>
                                                {{ easy: 'Dễ', medium: 'TB', hard: 'Khó' }[q.difficulty]}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Gán nhóm thi ({form.group_ids.length} đã chọn)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {groups.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa có nhóm thi nào</p>
                                    ) : groups.map(g => (
                                        <label key={g.id} className="form-checkbox">
                                            <input type="checkbox" checked={form.group_ids.includes(g.id)} onChange={() => toggleGroupSelection(g.id)} />
                                            <Users size={16} /> {g.name}
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({g.members?.length || 0} thành viên)</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editing ? 'Cập nhật' : 'Tạo đề thi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
