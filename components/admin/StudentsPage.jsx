'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import * as XLSX from 'xlsx';
import {
    GraduationCap, Plus, Pencil, Trash2, X, Search,
    Mail, UserPlus, Upload, Download, FileSpreadsheet,
    Building2, BookOpen, CalendarDays, Filter, Users, Eye, EyeOff, KeyRound
} from 'lucide-react';

export default function StudentsPage() {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [classNames, setClassNames] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [form, setForm] = useState({ full_name: '', email: '', student_id: '', department: '', class_name: '', academic_year: '', password: '', role: 'student' });
    const [showPassword, setShowPassword] = useState(false);
    const [importData, setImportData] = useState(null);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);
    const toast = useToast();

    const loadData = async () => {
        const u = await api.getStudents();
        setUsers(u);
        // Derive filter options from student data
        setDepartments([...new Set(u.map(s => s.department).filter(Boolean))].sort());
        setClassNames([...new Set(u.map(s => s.class_name).filter(Boolean))].sort());
        setAcademicYears([...new Set(u.map(s => s.academic_year).filter(Boolean))].sort());
    };

    useEffect(() => { loadData(); }, []);

    const students = users.filter(u => u.role === 'student');
    const filtered = students.filter(s => {
        if (filterDept && s.department !== filterDept) return false;
        if (filterClass && s.class_name !== filterClass) return false;
        if (filterYear && s.academic_year !== filterYear) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            s.full_name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.student_id?.toLowerCase().includes(q)
        );
    });

    const handleSave = async () => {
        if (!form.full_name.trim()) { toast.error('Vui lòng nhập họ tên'); return; }
        if (!form.email.trim()) { toast.error('Vui lòng nhập email'); return; }

        if (editing) {
            const res = await api.updateStudent(editing.id, form);
            if (res?.success === false) { toast.error(res.error || 'Cập nhật thất bại'); return; }
            toast.success('Cập nhật thông tin thành công');
        } else {
            const result = await api.addStudent(form);
            if (!result.success) { toast.error(result.error || 'Thêm sinh viên thất bại'); return; }
            toast.success('Thêm sinh viên thành công');
        }
        closeModal();
        loadData();
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setShowPassword(false);
        setForm({ full_name: '', email: '', student_id: '', department: '', class_name: '', academic_year: '', password: '', role: 'student' });
    };

    const handleEdit = (user) => {
        setEditing(user);
        setForm({
            full_name: user.full_name,
            email: user.email,
            student_id: user.student_id || '',
            department: user.department || '',
            class_name: user.class_name || '',
            academic_year: user.academic_year || '',
            role: user.role,
        });
        setShowModal(true);
    };

    const handleDelete = async (user) => {
        if (['admin@quiz.com', 'student@quiz.com'].includes(user.email)) {
            toast.warning('Không thể xóa tài khoản demo');
            return;
        }
        if (confirm(`Xóa sinh viên "${user.full_name}"?`)) {
            await api.deleteStudent(user.id);
            toast.success('Đã xóa sinh viên');
            loadData();
        }
    };

    // Import Excel/CSV
    const handleFileImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const wb = XLSX.read(event.target.result, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    toast.error('File không có dữ liệu');
                    return;
                }

                setImportData(data);
                setImportResult(null);
                setShowImportModal(true);
            } catch (err) {
                toast.error('Không thể đọc file: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };

    const handleImportConfirm = async () => {
        if (!importData) return;
        const result = await api.importStudents(importData);
        setImportResult(result);
        if (result.imported > 0) {
            toast.success(`Đã import ${result.imported} sinh viên`);
            loadData();
        }
        if (result.skipped > 0) {
            toast.warning(`${result.skipped} dòng bị bỏ qua`);
        }
    };

    const downloadTemplate = () => {
        const template = [
            { 'Mã SV': 'SV001', 'Họ tên': 'Nguyễn Văn A', 'Email': 'sva@school.edu', 'Khoa': 'Công nghệ thông tin', 'Lớp': 'CNTT01', 'Khóa': 'K20' },
            { 'Mã SV': 'SV002', 'Họ tên': 'Trần Thị B', 'Email': 'svb@school.edu', 'Khoa': 'Hệ thống thông tin', 'Lớp': 'HTTT01', 'Khóa': 'K21' },
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách SV');
        ws['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 12 }, { wch: 10 }];
        XLSX.writeFile(wb, 'mau-danh-sach-sinh-vien.xlsx');
        toast.info('Đã tải file mẫu');
    };

    const clearFilters = () => {
        setFilterDept('');
        setFilterClass('');
        setFilterYear('');
        setSearchQuery('');
    };

    const hasFilters = filterDept || filterClass || filterYear || searchQuery;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản lý sinh viên</h1>
                    <p className="page-subtitle">{filtered.length} / {students.length} sinh viên</p>
                </div>
                <div className="btn-group">
                    <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={18} /> Import Excel
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <UserPlus size={18} /> Thêm sinh viên
                    </button>
                </div>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileImport} style={{ display: 'none' }} />
            </div>

            <div className="filter-bar" style={{ flexWrap: 'wrap' }}>
                <div className="search-input">
                    <Search size={18} />
                    <input placeholder="Tìm theo tên, email, mã SV..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                {departments.length > 0 && (
                    <select className="filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                        <option value="">Tất cả khoa</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                )}
                {classNames.length > 0 && (
                    <select className="filter-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                        <option value="">Tất cả lớp</option>
                        {classNames.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                )}
                {academicYears.length > 0 && (
                    <select className="filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                        <option value="">Tất cả khóa</option>
                        {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                )}
                {hasFilters && (
                    <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                        <X size={14} /> Xóa bộ lọc
                    </button>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><GraduationCap size={28} /></div>
                        <h3 className="empty-state-title">{hasFilters ? 'Không tìm thấy sinh viên' : 'Chưa có sinh viên nào'}</h3>
                        <p className="empty-state-text">{hasFilters ? 'Thử bộ lọc khác' : 'Thêm thủ công hoặc import từ Excel'}</p>
                        {!hasFilters && (
                            <div className="btn-group" style={{ justifyContent: 'center' }}>
                                <button className="btn btn-secondary btn-sm" onClick={downloadTemplate}>
                                    <Download size={16} /> Tải file mẫu Excel
                                </button>
                                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                                    <Plus size={16} /> Thêm thủ công
                                </button>
                            </div>
                        )}
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
                                <th>Khoa</th>
                                <th>Lớp</th>
                                <th>Khóa</th>
                                <th>Email</th>
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
                                        {user.department || <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>
                                        {user.class_name ? <span className="badge badge-warning">{user.class_name}</span> : '-'}
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>
                                        {user.academic_year ? <span className="badge badge-secondary">{user.academic_year}</span> : '-'}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Mail size={14} /> {user.email}
                                        </div>
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Sửa thông tin' : 'Thêm sinh viên mới'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Họ và tên <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <input className="form-input" placeholder="Nguyễn Văn A" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} autoFocus />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <input className="form-input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!!editing} />
                                    {editing && <p className="form-helper">Email không thể thay đổi</p>}
                                </div>
                            </div>

                            {!editing && (
                                <div className="form-group">
                                    <label className="form-label">
                                        <KeyRound size={14} style={{ marginRight: 4 }} />
                                        Mật khẩu <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(mặc định: student123)</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className="form-input"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="student123"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            style={{ paddingRight: 40 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => !p)}
                                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Sinh viên dùng mật khẩu này để đăng nhập</small>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Mã sinh viên</label>
                                    <input className="form-input" placeholder="SV001" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Khoa / Bộ môn</label>
                                    <input className="form-input" placeholder="Công nghệ thông tin" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} list="dept-list" />
                                    <datalist id="dept-list">
                                        {departments.map(d => <option key={d} value={d} />)}
                                    </datalist>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Lớp</label>
                                    <input className="form-input" placeholder="CNTT01" value={form.class_name} onChange={e => setForm({ ...form, class_name: e.target.value })} list="class-list" />
                                    <datalist id="class-list">
                                        {classNames.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Khóa</label>
                                    <input className="form-input" placeholder="K20" value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} list="year-list" />
                                    <datalist id="year-list">
                                        {academicYears.map(y => <option key={y} value={y} />)}
                                    </datalist>
                                </div>
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

            {/* Import Modal */}
            {showImportModal && (
                <div className="modal-overlay" onClick={() => { setShowImportModal(false); setImportData(null); setImportResult(null); }}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <FileSpreadsheet size={22} style={{ color: 'var(--success)' }} />
                                Import danh sách sinh viên
                            </h2>
                            <button className="modal-close" onClick={() => { setShowImportModal(false); setImportData(null); setImportResult(null); }}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            {importResult ? (
                                <div>
                                    <div className="stats-grid" style={{ marginBottom: 20 }}>
                                        <div className="stat-card">
                                            <div className="stat-icon success"><Users size={20} /></div>
                                            <div className="stat-info">
                                                <div className="stat-value">{importResult.imported}</div>
                                                <div className="stat-label">Đã import</div>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon warning"><X size={20} /></div>
                                            <div className="stat-info">
                                                <div className="stat-value">{importResult.skipped}</div>
                                                <div className="stat-label">Bỏ qua</div>
                                            </div>
                                        </div>
                                    </div>
                                    {importResult.errors.length > 0 && (
                                        <div style={{ maxHeight: 200, overflowY: 'auto', background: 'var(--bg-input)', borderRadius: 'var(--radius)', padding: 12, fontSize: '0.85rem' }}>
                                            <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--warning)' }}>Chi tiết lỗi:</p>
                                            {importResult.errors.map((err, i) => (
                                                <p key={i} style={{ color: 'var(--text-muted)', padding: '4px 0' }}>{err}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : importData ? (
                                <div>
                                    <div className="alert alert-success" style={{ marginBottom: 16 }}>
                                        <span>Đọc được <strong>{importData.length}</strong> dòng dữ liệu từ file</span>
                                    </div>

                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>Cột nhận diện: Mã SV, Họ tên, Email, Khoa, Lớp, Khóa</p>

                                    <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
                                        <table className="table" style={{ marginBottom: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    {Object.keys(importData[0]).slice(0, 6).map(key => (
                                                        <th key={key}>{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importData.slice(0, 20).map((row, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        {Object.values(row).slice(0, 6).map((val, j) => (
                                                            <td key={j}>{String(val || '')}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {importData.length > 20 && (
                                            <p style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)' }}>
                                                ... và {importData.length - 20} dòng nữa
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div className="modal-footer">
                            {importResult ? (
                                <button className="btn btn-primary" onClick={() => { setShowImportModal(false); setImportData(null); setImportResult(null); }}>
                                    Đóng
                                </button>
                            ) : (
                                <>
                                    <button className="btn btn-ghost btn-sm" onClick={downloadTemplate}>
                                        <Download size={16} /> Tải file mẫu
                                    </button>
                                    <div style={{ flex: 1 }} />
                                    <button className="btn btn-secondary" onClick={() => { setShowImportModal(false); setImportData(null); }}>Hủy</button>
                                    <button className="btn btn-primary" onClick={handleImportConfirm}>
                                        <Upload size={18} /> Import {importData?.length || 0} sinh viên
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
