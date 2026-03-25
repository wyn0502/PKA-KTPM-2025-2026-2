'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import ImportWayground from './ImportWayground';
import {
    FileQuestion, Plus, Pencil, Trash2, X, Search,
    CircleDot, CheckCircle2, Upload
} from 'lucide-react';

export default function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [filterSubject, setFilterSubject] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showImport, setShowImport] = useState(false);
    const toast = useToast();

    const emptyForm = {
        content: '', subject_id: '', difficulty: 'easy',
        answers: [
            { content: '', is_correct: true },
            { content: '', is_correct: false },
            { content: '', is_correct: false },
            { content: '', is_correct: false },
        ]
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [q, s] = await Promise.all([
            api.getQuestions(),
            api.getSubjects(),
        ]);
        setQuestions(q);
        setSubjects(s);
    };

    const filteredQuestions = questions.filter(q => {
        if (filterSubject && q.subject_id !== filterSubject) return false;
        if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
        if (searchQuery && !q.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleSave = async () => {
        if (!form.content.trim()) { toast.error('Vui lòng nhập nội dung câu hỏi'); return; }
        if (!form.subject_id) { toast.error('Vui lòng chọn môn học'); return; }

        const filledAnswers = form.answers.filter(a => a.content.trim());
        if (filledAnswers.length < 2) { toast.error('Cần ít nhất 2 đáp án'); return; }

        const hasCorrect = filledAnswers.some(a => a.is_correct);
        if (!hasCorrect) { toast.error('Phải có ít nhất 1 đáp án đúng'); return; }

        if (editing) {
            const res = await api.updateQuestion(editing.id, { ...form, answers: filledAnswers });
            if (res?.success === false) { toast.error(res.error || 'Cập nhật thất bại'); return; }
            toast.success('Cập nhật câu hỏi thành công');
        } else {
            const res = await api.addQuestion({ ...form, answers: filledAnswers });
            if (res?.success === false) { toast.error(res.error || 'Thêm câu hỏi thất bại'); return; }
            toast.success('Thêm câu hỏi thành công');
        }
        closeModal();
        loadData();
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ ...emptyForm, subject_id: subjects[0]?.id || '', answers: emptyForm.answers.map(a => ({ ...a })) });
    };

    const handleEdit = (question) => {
        setEditing(question);
        setForm({
            content: question.content,
            subject_id: question.subject_id,
            difficulty: question.difficulty,
            answers: question.answers.length > 0
                ? question.answers.map(a => ({ content: a.content, is_correct: a.is_correct }))
                : emptyForm.answers.map(a => ({ ...a }))
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa câu hỏi này? Câu hỏi sẽ bị xóa khỏi các đề thi liên quan.')) return;
        const res = await api.deleteQuestion(id);
        if (res?.success === false) { toast.error('Xóa thất bại'); return; }
        toast.success('Đã xóa câu hỏi');
        loadData();
    };

    const setCorrectAnswer = (index) => {
        setForm({
            ...form,
            answers: form.answers.map((a, i) => ({ ...a, is_correct: i === index }))
        });
    };

    const difficultyLabel = (d) => ({ easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' }[d] || d);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Ngân hàng câu hỏi</h1>
                    <p className="page-subtitle">{filteredQuestions.length} câu hỏi</p>
                </div>
                <div className="btn-group">
                    <button className="btn btn-secondary" onClick={() => setShowImport(true)}>
                        <Upload size={18} /> Import
                    </button>
                    <button className="btn btn-primary" onClick={() => { setForm({ ...emptyForm, subject_id: subjects[0]?.id || '', answers: emptyForm.answers.map(a => ({ ...a })) }); setShowModal(true); }}>
                        <Plus size={18} /> Thêm câu hỏi
                    </button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="search-input">
                    <Search size={18} />
                    <input placeholder="Tìm kiếm câu hỏi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="filter-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                    <option value="">Tất cả môn học</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select className="filter-select" value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
                    <option value="">Tất cả độ khó</option>
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                </select>
            </div>

            {filteredQuestions.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><FileQuestion size={28} /></div>
                        <h3 className="empty-state-title">Không tìm thấy câu hỏi</h3>
                        <p className="empty-state-text">Thêm câu hỏi mới hoặc thay đổi bộ lọc</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filteredQuestions.map((q, index) => (
                        <div key={q.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>#{index + 1}</span>
                                        <span className={`badge badge-${q.difficulty}`}>{difficultyLabel(q.difficulty)}</span>
                                        {q.subject && <span className="badge badge-info">{q.subject.name}</span>}
                                    </div>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-heading)', marginBottom: 12 }}>{q.content}</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 6 }}>
                                        {q.answers.map((a, i) => (
                                            <div key={i} style={{
                                                display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem',
                                                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                                                background: a.is_correct ? 'rgba(16,185,129,0.08)' : 'transparent',
                                                color: a.is_correct ? 'var(--success)' : 'var(--text-secondary)',
                                            }}>
                                                {a.is_correct ? <CheckCircle2 size={14} /> : <CircleDot size={14} />}
                                                {a.content}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="btn-group">
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(q)}><Pencil size={16} /></button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(q.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
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
                            <h2 className="modal-title">{editing ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Môn học <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <select className="form-select" value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                                        <option value="">Chọn môn học...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Độ khó</label>
                                    <select className="form-select" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                                        <option value="easy">Dễ</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="hard">Khó</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nội dung câu hỏi <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <textarea className="form-textarea" placeholder="Nhập câu hỏi..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Đáp án (click để chọn đáp án đúng)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {form.answers.map((answer, index) => (
                                        <div key={index} style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 14px', borderRadius: 'var(--radius)',
                                            border: `2px solid ${answer.is_correct ? 'var(--success)' : 'var(--border)'}`,
                                            background: answer.is_correct ? 'rgba(16,185,129,0.05)' : 'var(--bg-input)',
                                            cursor: 'pointer',
                                        }} onClick={() => setCorrectAnswer(index)}>
                                            <div style={{
                                                width: 22, height: 22, borderRadius: '50%',
                                                border: `2px solid ${answer.is_correct ? 'var(--success)' : 'var(--border-light)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                {answer.is_correct && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                                            </div>
                                            <input
                                                className="form-input"
                                                style={{ border: 'none', background: 'transparent', padding: '4px 0' }}
                                                placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                                                value={answer.content}
                                                onClick={e => e.stopPropagation()}
                                                onChange={e => {
                                                    const newAnswers = [...form.answers];
                                                    newAnswers[index] = { ...newAnswers[index], content: e.target.value };
                                                    setForm({ ...form, answers: newAnswers });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="form-helper">Click vào đáp án để chọn đáp án đúng</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editing ? 'Cập nhật' : 'Thêm câu hỏi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showImport && (
                <ImportWayground
                    subjects={subjects}
                    onImported={() => { setShowImport(false); loadData(); toast.success('Import câu hỏi thành công'); }}
                    onClose={() => setShowImport(false)}
                />
            )}
        </div>
    );
}
