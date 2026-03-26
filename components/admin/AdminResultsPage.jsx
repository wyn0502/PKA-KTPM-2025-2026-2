'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { BarChart3, Search, User, Trophy, Calendar, Download, ShieldAlert, Trash2, RotateCcw, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminResultsPage() {
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterExam, setFilterExam] = useState('');
    const toast = useToast();

    useEffect(() => {
        const load = async () => {
            const [r, e] = await Promise.all([
                api.getAllResults(),
                api.getExams(),
            ]);
            setResults(r);
            setExams(e);
        };
        load();
    }, []);

    const filtered = results.filter(r => {
        if (filterExam && r.exam_id !== filterExam) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            r.user_name?.toLowerCase().includes(q) ||
            r.exam_title?.toLowerCase().includes(q) ||
            r.student_id?.toLowerCase().includes(q)
        );
    });

    const avg = filtered.length > 0
        ? (filtered.reduce((sum, r) => sum + r.score, 0) / filtered.length).toFixed(1)
        : '0';

    const passRate = filtered.length > 0
        ? Math.round((filtered.filter(r => r.score >= 5).length / filtered.length) * 100)
        : 0;

    const loadResults = async () => {
        const r = await api.getAllResults();
        setResults(r);
    };

    const handleRegrade = async (result) => {
        if (!confirm(`Chấm điểm lại bài thi của "${result.user_name}" cho đề "${result.exam_title}"?`)) return;
        const res = await api.regradeResult(result.id);
        if (res.success) {
            toast.success(`Đã chấm lại: ${res.score}/10 (${res.correct_count} câu đúng)`);
            loadResults();
        } else {
            toast.error('Không thể chấm lại bài thi này');
        }
    };

    const handleAllowRetake = async (result) => {
        if (!confirm(`Xóa bài thi của "${result.user_name}" để cho phép làm lại đề "${result.exam_title}"?`)) return;
        const res = await api.allowRetake(result.exam_id, result.user_id);
        if (res.success) {
            toast.success('Đã xóa kết quả, sinh viên có thể làm lại bài thi');
            loadResults();
        } else {
            toast.error('Không thể thực hiện thao tác này');
        }
    };

    const handleDelete = async (result) => {
        if (!confirm(`Xóa vĩnh viễn bài thi của "${result.user_name}" cho đề "${result.exam_title}"?`)) return;
        const res = await api.deleteResult(result.id);
        if (res.success) {
            toast.success('Đã xóa bài thi');
            loadResults();
        } else {
            toast.error('Không thể xóa bài thi này');
        }
    };

    const handleExport = () => {
        if (filtered.length === 0) {
            toast.warning('Không có dữ liệu để xuất');
            return;
        }
        const data = filtered.map(r => ({
            'Họ tên': r.user_name || '',
            'Mã SV': r.student_id || '',
            'Email': r.user_email || '',
            'Đề thi': r.exam_title || '',
            'Điểm': r.score,
            'Câu đúng': r.correct_count,
            'Tổng câu': r.total_questions,
            'Vi phạm gian lận': r.cheating_count ?? 0,
            'Thời gian nộp': new Date(r.submitted_at).toLocaleString('vi-VN'),
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Kết quả thi');
        ws['!cols'] = Object.keys(data[0]).map(key => ({
            wch: Math.max(key.length, ...data.map(row => String(row[key] ?? '').length)) + 2
        }));
        const examTitle = exams.find(e => e.id === filterExam)?.title;
        const fileName = examTitle
            ? `ket-qua-${examTitle.replace(/[^a-zA-Z0-9]/g, '-')}.xlsx`
            : 'ket-qua-thi-tat-ca.xlsx';
        XLSX.writeFile(wb, fileName);
        toast.success(`Đã xuất ${data.length} kết quả ra file Excel`);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Kết quả thi</h1>
                    <p className="page-subtitle">{filtered.length} kết quả</p>
                </div>
                {results.length > 0 && (
                    <button className="btn btn-secondary" onClick={handleExport}>
                        <Download size={18} /> Xuất Excel
                    </button>
                )}
            </div>

            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon primary"><BarChart3 size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{filtered.length}</div>
                        <div className="stat-label">Tổng lượt thi</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success"><Trophy size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{avg}</div>
                        <div className="stat-label">Điểm TB</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning"><User size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{passRate}%</div>
                        <div className="stat-label">Tỷ lệ đạt</div>
                    </div>
                </div>
            </div>

            <div className="filter-bar">
                <div className="search-input">
                    <Search size={18} />
                    <input placeholder="Tìm theo tên, mã SV, đề thi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="filter-select" value={filterExam} onChange={e => setFilterExam(e.target.value)}>
                    <option value="">Tất cả đề thi</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
            </div>

            {filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><BarChart3 size={28} /></div>
                        <h3 className="empty-state-title">Chưa có kết quả nào</h3>
                        <p className="empty-state-text">Kết quả sẽ hiển thị khi sinh viên nộp bài</p>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Sinh viên</th>
                                <th>Đề thi</th>
                                <th style={{ textAlign: 'center' }}>Điểm</th>
                                <th style={{ textAlign: 'center' }}>Đúng</th>
                                <th style={{ textAlign: 'center' }}>Gian lận</th>
                                <th>Thời gian nộp</th>
                                <th style={{ textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r, i) => {
                                const cheatingCount = r.cheating_count ?? 0;
                                return (
                                    <tr key={r.id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="avatar-sm">
                                                    {r.user_name?.split(' ').map(w => w[0]).join('').slice(-2)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{r.user_name}</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.student_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{r.exam_title}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`badge ${r.score >= 5 ? 'badge-success' : 'badge-danger'}`}>
                                                {r.score}/10
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            {r.correct_count}/{r.total_questions}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {cheatingCount > 0 ? (
                                                <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <ShieldAlert size={12} /> {cheatingCount}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>0</span>
                                            )}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Calendar size={14} />
                                                {new Date(r.submitted_at).toLocaleString('vi-VN', { hour12: false })}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-sm btn-info"
                                                    title="Chấm điểm lại"
                                                    onClick={() => handleRegrade(r)}
                                                >
                                                    <RefreshCw size={13} /> Chấm lại
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-warning"
                                                    title="Cho sinh viên làm lại bài thi"
                                                    onClick={() => handleAllowRetake(r)}
                                                >
                                                    <RotateCcw size={13} /> Làm lại
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    title="Xóa bài thi"
                                                    onClick={() => handleDelete(r)}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
