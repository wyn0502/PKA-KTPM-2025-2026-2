'use client';

import { useState, useEffect } from 'react';
import { demoApi } from '@/lib/supabase';
import ImportWayground from './ImportWayground';
import {
    FileQuestion, Plus, Pencil, Trash2, X, Search,
    Filter, CircleDot, CheckCircle2, XCircle, Upload
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

    const [form, setForm] = useState({
        content: '', subject_id: '', difficulty: 'easy',
        answers: [
            { content: '', is_correct: true },
            { content: '', is_correct: false },
            { content: '', is_correct: false },
            { content: '', is_correct: false },
        ]
    });

    useEffect(() => { loadData(); }, []);

    const loadData = () => {
        setQuestions(demoApi.getQuestions());
        setSubjects(demoApi.getSubjects());
    };

    const filteredQuestions = questions.filter(q => {
        if (filterSubject && q.subject_id !== filterSubject) return false;
        if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
        if (searchQuery && !q.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleSave = () => {
        if (!form.content.trim() || !form.subject_id) return;
        const hasCorrect = form.answers.some(a => a.is_correct && a.content.trim());
        if (!hasCorrect) return;

        if (editing) {
            demoApi.updateQuestion(editing.id, form);
        } else {
            demoApi.addQuestion(form);
        }
        closeModal();
        loadData();
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({
            content: '', subject_id: subjects[0]?.id || '', difficulty: 'easy',
            answers: [
                { content: '', is_correct: true },
                { content: '', is_correct: false },
                { content: '', is_correct: false },
                { content: '', is_correct: false },
            ]
        });
    };

    const handleEdit = (question) => {
        setEditing(question);
        setForm({
            content: question.content,
            subject_id: question.subject_id,
            difficulty: question.difficulty,
            answers: question.answers.length > 0
                ? question.answers.map(a => ({ content: a.content, is_correct: a.is_correct }))
                : [{ content: '', is_correct: true }, { content: '', is_correct: false }, { content: '', is_correct: false }, { content: '', is_correct: false }]
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
            demoApi.deleteQuestion(id);
            loadData();
        }
    };

    const setCorrectAnswer = (index) => {
        setForm({
            ...form,
            answers: form.answers.map((a, i) => ({ ...a, is_correct: i === index }))
        });
    };

    const difficultyLabel = (d) => {
        const map = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
        return map[d] || d;
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Ngân hàng câu hỏi</h1>
                    <p className="page-subtitle">{filteredQuestions.length} câu hỏi</p>
                </div>
                <div className="btn-group">
                    <button className="btn btn-secondary" onClick={() => setShowImport(true)}>
                        <Upload size={18} /> Import Wayground
                    </button>
                    <button className="btn btn-primary" onClick={() => { setForm({ ...form, subject_id: subjects[0]?.id || '' }); setShowModal(true); }}>
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
                                    <label className="form-label">Môn học</label>
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
                                <label className="form-label">Nội dung câu hỏi</label>
                                <textarea className="form-textarea" placeholder="Nhập câu hỏi..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
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
                                <p className="form-helper">Click vào đáp án để chọn đáp án đúng (icon xanh ✓)</p>
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
                    onImported={() => { setShowImport(false); loadData(); }}
                    onClose={() => setShowImport(false)}
                />
            )}
        </div>
    );
}
