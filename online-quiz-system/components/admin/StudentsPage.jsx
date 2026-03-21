'use client';

import { useState, useEffect } from 'react';
import { demoApi } from '@/lib/supabase';
import { useToast } from '@/lib/toast';
import {
    GraduationCap, Plus, Pencil, Trash2, X, Search,
    Mail, UserPlus, Download
} from 'lucide-react';

export default function StudentsPage() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [form, setForm] = useState({ full_name: '', email: '', student_id: '', role: 'student' });
    const toast = useToast();

    useEffect(() => { loadData(); }, []);

    const loadData = () => setUsers(demoApi.getUsers());

    const students = users.filter(u => u.role === 'student');
    const filtered = students.filter(s => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            s.full_name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.student_id?.toLowerCase().includes(q)
        );
    });

    const handleSave = () => {
        if (!form.full_name.trim()) { toast.error('Vui lòng nhập họ tên'); return; }
        if (!form.email.trim()) { toast.error('Vui lòng nhập email'); return; }

        if (editing) {
            demoApi.updateUser(editing.id, form);
            toast.success('Cập nhật thông tin thành công');
        } else {
            const result = demoApi.addUser(form);
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success('Thêm sinh viên thành công');
        }
        closeModal();
        loadData();
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ full_name: '', email: '', student_id: '', role: 'student' });
    };

    const handleEdit = (user) => {
        setEditing(user);
        setForm({
            full_name: user.full_name,
            email: user.email,
            student_id: user.student_id || '',
            role: user.role,
        });
        setShowModal(true);
    };

    const handleDelete = (user) => {
        if (['admin@quiz.com', 'student@quiz.com'].includes(user.email)) {
            toast.warning('Không thể xóa tài khoản demo');
            return;
        }
        if (confirm(`Xóa sinh viên "${user.full_name}"?`)) {
            demoApi.deleteUser(user.id);
            toast.success('Đã xóa sinh viên');
            loadData();
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản lý sinh viên</h1>
                    <p className="page-subtitle">{filtered.length} sinh viên</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <UserPlus size={18} /> Thêm sinh viên
                </button>
            </div>

            <div className="filter-bar">
                <div className="search-input">
                    <Search size={18} />
                    <input placeholder="Tìm theo tên, email, mã SV..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><GraduationCap size={28} /></div>
                        <h3 className="empty-state-title">{searchQuery ? 'Không tìm thấy sinh viên' : 'Chưa có sinh viên nào'}</h3>
                        <p className="empty-state-text">{searchQuery ? 'Thử từ khóa khác' : 'Thêm sinh viên mới'}</p>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Sinh viên</th>
                                <th>Mã SV</th>
                                <th>Email</th>
                                <th>Ngày tạo</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user, i) => (
                                <tr key={user.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="avatar-sm">
                                                {user.full_name?.split(' ').map(w => w[0]).join('').slice(-2)}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{user.full_name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-info">{user.student_id || '-'}</span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Mail size={14} /> {user.email}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(user)}>
                                                <Pencil size={16} />
                                            </button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(user)} style={{ color: 'var(--danger)' }}>
                                                <Trash2 size={16} />
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
                            <h2 className="modal-title">{editing ? 'Sửa thông tin' : 'Thêm sinh viên mới'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Họ và tên <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input className="form-input" placeholder="Nguyễn Văn A" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input className="form-input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!!editing} />
                                {editing && <p className="form-helper">Email không thể thay đổi sau khi tạo</p>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mã sinh viên</label>
                                <input className="form-input" placeholder="SV001" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editing ? 'Cập nhật' : 'Thêm sinh viên'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
