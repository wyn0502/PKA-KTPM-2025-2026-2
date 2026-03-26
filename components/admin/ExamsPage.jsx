'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import {
    ClipboardList, Plus, Pencil, Trash2, X, Play, Pause,
    Clock, Shuffle, Eye, Users, CheckSquare, AlertCircle,
    Calendar, Monitor
} from 'lucide-react';

export default function ExamsPage({ onMonitorExam }) {
    const [exams, setExams] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const toast = useToast();

    const emptyForm = {
        title: '', subject_id: '', duration_minutes: 30,
        shuffle_questions: true, shuffle_answers: true, show_result: true,
        status: 'draft', question_ids: [], group_ids: [],
        start_time: '', end_time: '',
    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [e, q, s, g] = await Promise.all([
            api.getExams(),
            api.getQuestions(),
            api.getSubjects(),
            api.getGroups(),
        ]);
        setExams(e);
        setQuestions(q);
        setSubjects(s);
        setGroups(g);
    };

    const handleSave = async () => {
        if (!form.title.trim()) { toast.error('Vui lòng nhập tên đề thi'); return; }
        if (!form.subject_id) { toast.error('Vui lòng chọn môn học'); return; }
        if (form.question_ids.length === 0) { toast.warning('Chưa chọn câu hỏi nào cho đề thi'); }
        if (form.start_time && form.end_time && new Date(form.start_time) >= new Date(form.end_time)) {
            toast.error('Thời gian bắt đầu phải trước thời gian kết thúc');
            return;
        }

        const saveData = {
            ...form,
            start_time: form.start_time || null,
            end_time: form.end_time || null,
        };

        if (editing) {
            await api.updateExam(editing.id, saveData);
            toast.success('Cập nhật đề thi thành công');
        } else {
            await api.addExam(saveData);
            toast.success('Tạo đề thi thành công');
        }
        closeModal();
        loadData();
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const handleEdit = (exam) => {
        setEditing(exam);
        setForm({
            title: exam.title, subject_id: exam.subject_id, duration_minutes: exam.duration_minutes,
            shuffle_questions: exam.shuffle_questions, shuffle_answers: exam.shuffle_answers,
            show_result: exam.show_result, status: exam.status,
            question_ids: exam.question_ids || [],
            group_ids: exam.group_ids || [],
            start_time: exam.start_time ? exam.start_time.slice(0, 16) : '',
            end_time: exam.end_time ? exam.end_time.slice(0, 16) : '',
        });
        setShowModal(true);
    };

    const toggleStatus = async (exam) => {
        const newStatus = exam.status === 'active' ? 'closed' : 'active';
        await api.updateExam(exam.id, { ...exam, status: newStatus });
        toast.info(newStatus === 'active' ? 'Đã mở đề thi' : 'Đã đóng đề thi');
        loadData();
    };

    const handleDelete = async (exam) => {
        if (exam.result_count > 0) {
            if (!confirm(`Đề thi "${exam.title}" đã có ${exam.result_count} lượt thi. Xóa sẽ mất toàn bộ kết quả. Tiếp tục?`)) return;
        } else {
            if (!confirm(`Xóa đề thi "${exam.title}"?`)) return;
        }
        await api.deleteExam(exam.id);
        toast.success('Đã xóa đề thi');
        loadData();
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

    const formatDateTime = (dt) => {
        if (!dt) return null;
        return new Date(dt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const getTimeWindowStatus = (exam) => {
        if (!exam.start_time && !exam.end_time) return null;
        const now = new Date();
        if (exam.start_time && now < new Date(exam.start_time)) return { label: 'Chưa mở', cls: 'badge-warning' };
        if (exam.end_time && now > new Date(exam.end_time)) return { label: 'Hết hạn', cls: 'badge-danger' };
        return { label: 'Trong thời gian', cls: 'badge-success' };
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
                    {exams.map(exam => {
                        const timeStatus = getTimeWindowStatus(exam);
                        return (
                            <div key={exam.id} className="card" style={{ padding: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{exam.title}</h3>
                                            <span className={`badge ${statusInfo[exam.status]?.badge}`}>
                                                {statusInfo[exam.status]?.label}
                                            </span>
                                            {timeStatus && (
                                                <span className={`badge ${timeStatus.cls}`}>
                                                    <Calendar size={12} /> {timeStatus.label}
                                                </span>
                                            )}
                                            {exam.result_count > 0 && (
                                                <span className="badge badge-info">{exam.result_count} lượt thi</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {exam.subject_name && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <AlertCircle size={14} /> {exam.subject_name}
                                                </span>
                                            )}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Clock size={14} /> {exam.duration_minutes} phút
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <CheckSquare size={14} /> {exam.question_ids?.length || 0} câu
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Users size={14} /> {exam.group_ids?.length > 0 ? exam.group_ids.map(gId => groups.find(g => g.id === gId)?.name).filter(Boolean).join(', ') : 'Chưa gán nhóm'}
                                            </span>
                                            {exam.shuffle_questions && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <Shuffle size={14} /> Trộn đề
                                                </span>
                                            )}
                                            {exam.show_result && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <Eye size={14} /> Hiện KQ
                                                </span>
                                            )}
                                        </div>
                                        {(exam.start_time || exam.end_time) && (
                                            <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                                {exam.start_time && (
                                                    <span>Bắt đầu: {formatDateTime(exam.start_time)}</span>
                                                )}
                                                {exam.end_time && (
                                                    <span>Kết thúc: {formatDateTime(exam.end_time)}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="btn-group">
                                        {exam.status === 'active' && onMonitorExam && (
                                            <button className="btn btn-sm btn-info" onClick={() => onMonitorExam(exam.id)} title="Giám sát trực tiếp">
                                                <Monitor size={14} /> Giám sát
                                            </button>
                                        )}
                                        <button className={`btn btn-sm ${exam.status === 'active' ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleStatus(exam)}>
                                            {exam.status === 'active' ? <><Pause size={14} /> Đóng</> : <><Play size={14} /> Mở</>}
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(exam)}>
                                            <Pencil size={14} />
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exam)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
                                <label className="form-label">Tên đề thi <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input className="form-input" placeholder="VD: Kiểm tra giữa kỳ" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Môn học <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <select className="form-select" value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value, question_ids: [] })}>
                                        <option value="">Chọn môn học...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Thời gian làm bài (phút)</label>
                                    <input type="number" className="form-input" min="1" max="300" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 30 })} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Thời gian mở bài thi</label>
                                    <input type="datetime-local" className="form-input" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Để trống nếu không giới hạn</small>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Thời gian đóng bài thi</label>
                                    <input type="datetime-local" className="form-input" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Để trống nếu không giới hạn</small>
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
                                                setForm(prev => ({ ...prev, question_ids: allSelected ? [] : allIds }));
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
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa có nhóm thi nào. Tạo nhóm thi trước.</p>
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
