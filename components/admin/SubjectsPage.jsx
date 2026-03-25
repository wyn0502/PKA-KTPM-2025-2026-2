'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { BookOpen, Plus, Pencil, Trash2, X, FileQuestion } from 'lucide-react';

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const toast = useToast();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [subjs, questions] = await Promise.all([
            api.getSubjects(),
            api.getQuestions(),
        ]);
        setSubjects(subjs.map(s => ({
            ...s,
            questionCount: questions.filter(q => q.subject_id === s.id).length,
        })));
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error('Vui lòng nhập tên môn học');
            return;
        }
        if (editing) {
            const res = await api.updateSubject(editing.id, form);
            if (res?.success === false) { toast.error(res.error || 'Cập nhật thất bại'); return; }
            toast.success('Cập nhật môn học thành công');
        } else {
            const res = await api.addSubject(form);
            if (res?.success === false) { toast.error(res.error || 'Thêm môn học thất bại'); return; }
            toast.success('Thêm môn học thành công');
        }
        closeModal();
        loadData();
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ name: '', description: '' });
    };

    const handleEdit = (subject) => {
        setEditing(subject);
        setForm({ name: subject.name, description: subject.description });
        setShowModal(true);
    };

    const handleDelete = async (subject) => {
        if (!confirm(`Xóa môn học "${subject.name}"? Tất cả câu hỏi thuộc môn này cũng sẽ bị xóa.`)) return;
        const result = await api.deleteSubject(subject.id);
        if (result?.success === false) {
            toast.error(result.error || 'Xóa thất bại');
            return;
        }
        toast.success('Đã xóa môn học');
        loadData();
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản lý Môn học</h1>
                    <p className="page-subtitle">{subjects.length} môn học</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setForm({ name: '', description: '' }); setShowModal(true); }}>
                    <Plus size={18} /> Thêm môn học
                </button>
            </div>

            {subjects.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><BookOpen size={28} /></div>
                        <h3 className="empty-state-title">Chưa có môn học nào</h3>
                        <p className="empty-state-text">Bắt đầu bằng cách thêm môn học đầu tiên</p>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Thêm môn học
                        </button>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên môn học</th>
                                <th>Mô tả</th>
                                <th style={{ textAlign: 'center' }}>Câu hỏi</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject, index) => (
                                <tr key={subject.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <BookOpen size={18} style={{ color: 'var(--primary-light)' }} />
                                            <strong>{subject.name}</strong>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{subject.description}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="badge badge-info">
                                            <FileQuestion size={12} /> {subject.questionCount}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(subject)}>
                                                <Pencil size={14} /> Sửa
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(subject)}>
                                                <Trash2 size={14} /> Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Sửa môn học' : 'Thêm môn học mới'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Tên môn học <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input className="form-input" placeholder="VD: Kỹ thuật phần mềm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mô tả</label>
                                <textarea className="form-textarea" placeholder="Mô tả ngắn về môn học" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editing ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
