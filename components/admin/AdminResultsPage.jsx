'use client';

import { useState, useEffect } from 'react';
import { demoApi } from '@/lib/supabase';
import { useToast } from '@/lib/toast';
import { BarChart3, Search, User, Trophy, Calendar, Download, ShieldAlert } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminResultsPage() {
    const [results, setResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterExam, setFilterExam] = useState('');
    const toast = useToast();

    useEffect(() => {
        setResults(demoApi.getAllResults());
    }, []);

    const exams = demoApi.getExams();

    const filtered = results.filter(r => {
        if (filterExam && r.exam_id !== filterExam) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            r.user?.full_name?.toLowerCase().includes(q) ||
            r.exam?.title?.toLowerCase().includes(q) ||
            r.user?.student_id?.toLowerCase().includes(q)
        );
    });

    const avg = filtered.length > 0
        ? (filtered.reduce((sum, r) => sum + r.score, 0) / filtered.length).toFixed(1)
        : '0';

    const passRate = filtered.length > 0
        ? Math.round((filtered.filter(r => r.score >= 5).length / filtered.length) * 100)
        : 0;

    const handleExport = () => {
        const data = demoApi.getExamResultsForExport(filterExam || null);
        if (data.length === 0) {
            toast.warning('Không có dữ liệu để xuất');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Kết quả thi');

        const colWidths = Object.keys(data[0]).map(key => ({
            wch: Math.max(key.length, ...data.map(row => String(row[key]).length)) + 2
        }));
        ws['!cols'] = colWidths;

        const fileName = filterExam
            ? `ket-qua-thi-${exams.find(e => e.id === filterExam)?.title || 'all'}.xlsx`
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
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r, i) => {
                                const cheatingCount = demoApi.getCheatingCountForResult(r.exam_id, r.user_id);
                                return (
                                    <tr key={r.id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="avatar-sm">
                                                    {r.user?.full_name?.split(' ').map(w => w[0]).join('').slice(-2)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{r.user?.full_name}</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.user?.student_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{r.exam?.title}</td>
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
                                                {new Date(r.submitted_at).toLocaleString('vi-VN')}
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
