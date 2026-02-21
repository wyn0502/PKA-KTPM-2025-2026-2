'use client';

import { useState, useEffect } from 'react';
import { demoApi } from '@/lib/supabase';
import { BookOpen, Plus, Pencil, Trash2, X } from 'lucide-react';

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });

    useEffect(() => { loadData(); }, []);

    const loadData = () => setSubjects(demoApi.getSubjects());

    const handleSave = () => {
        if (!form.name.trim()) return;
        if (editing) {
            demoApi.updateSubject(editing.id, form);
        } else {
            demoApi.addSubject(form);
        }
        setShowModal(false);
        setEditing(null);
        setForm({ name: '', description: '' });
        loadData();
    };

    const handleEdit = (subject) => {
        setEditing(subject);
        setForm({ name: subject.name, description: subject.description });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Bạn có chắc muốn xóa môn học này?')) {
            demoApi.deleteSubject(id);
            loadData();
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản lý Môn học</h1>
                    <p className="page-subtitle">Thêm, sửa, xóa các môn học trong hệ thống</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); }}>
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
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject, index) => (
                                <tr key={subject.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <BookOpen size={18} style={{ color: 'var(--primary-light)' }} />
                                            <strong>{subject.name}</strong>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{subject.description}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(subject)}>
                                                <Pencil size={14} /> Sửa
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(subject.id)}>
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
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Sửa môn học' : 'Thêm môn học mới'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Tên môn học</label>
                                <input className="form-input" placeholder="VD: Kỹ thuật phần mềm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mô tả</label>
                                <textarea className="form-textarea" placeholder="Mô tả ngắn về môn học" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
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
