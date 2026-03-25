'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { Users, Plus, Pencil, Trash2, X } from 'lucide-react';

export default function GroupsPage() {
    const [groups, setGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', member_ids: [] });
    const toast = useToast();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [g, users] = await Promise.all([
            api.getGroups(),
            api.getUsers(),
        ]);
        setGroups(g);
        setStudents(users.filter(u => u.role === 'student'));
    };

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error('Vui lòng nhập tên nhóm'); return; }
        if (editing) {
            await api.updateGroup(editing.id, form);
            toast.success('Cập nhật nhóm thành công');
        } else {
            await api.addGroup(form);
            toast.success('Tạo nhóm thành công');
        }
        closeModal();
        loadData();
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ name: '', description: '', member_ids: [] });
    };

    const handleEdit = (group) => {
        setEditing(group);
        setForm({
            name: group.name,
            description: group.description,
            member_ids: group.members?.map(m => m.id) || [],
        });
        setShowModal(true);
    };

    const handleDelete = async (group) => {
        if (confirm(`Xóa nhóm "${group.name}"?`)) {
            await api.deleteGroup(group.id);
            toast.success('Đã xóa nhóm');
            loadData();
        }
    };

    const toggleMember = (userId) => {
        setForm(prev => ({
            ...prev,
            member_ids: prev.member_ids.includes(userId)
                ? prev.member_ids.filter(id => id !== userId)
                : [...prev.member_ids, userId]
        }));
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Nhóm thi</h1>
                    <p className="page-subtitle">Quản lý nhóm và phân công sinh viên</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Tạo nhóm
                </button>
            </div>

            {groups.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><Users size={28} /></div>
                        <h3 className="empty-state-title">Chưa có nhóm thi nào</h3>
                        <p className="empty-state-text">Tạo nhóm để phân công bài thi cho sinh viên</p>
                    </div>
                </div>
            ) : (
                <div className="grid-2">
                    {groups.map(group => (
                        <div key={group.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Users size={18} style={{ color: 'var(--primary-light)' }} />
                                        {group.name}
                                    </h3>
                                    {group.description && (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>{group.description}</p>
                                    )}
                                </div>
                                <div className="btn-group">
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(group)}><Pencil size={16} /></button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(group)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                    Thành viên ({group.members?.length || 0})
                                </p>
                                {group.members?.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {group.members.map(member => (
                                            <div key={member.id} style={{
                                                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                                                background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem'
                                            }}>
                                                <div className="avatar-xs">
                                                    {member.full_name?.split(' ').map(w => w[0]).join('').slice(-2)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 500 }}>{member.full_name}</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{member.student_id}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa có thành viên</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Sửa nhóm' : 'Tạo nhóm mới'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Tên nhóm <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <input className="form-input" placeholder="VD: CNTT K20 - Nhóm 1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mô tả</label>
                                <input className="form-input" placeholder="Mô tả nhóm..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Thành viên ({form.member_ids.length} đã chọn)</label>
                                <div style={{ maxHeight: 250, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 8 }}>
                                    {students.length === 0 ? (
                                        <p style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có sinh viên. Thêm sinh viên trước.</p>
                                    ) : students.map(s => (
                                        <label key={s.id} className="form-checkbox" style={{ padding: '8px 12px' }}>
                                            <input type="checkbox" checked={form.member_ids.includes(s.id)} onChange={() => toggleMember(s.id)} />
                                            <span>{s.full_name}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 'auto' }}>{s.student_id}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editing ? 'Cập nhật' : 'Tạo nhóm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
