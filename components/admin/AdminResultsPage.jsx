'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { BarChart3, Search, User, Trophy, Calendar, Download, ShieldAlert, Trash2, RotateCcw, RefreshCw, X, Pencil, Eye, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminResultsPage() {
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterExam, setFilterExam] = useState('');
    const [regradeTarget, setRegradeTarget] = useState(null);
    const [manualScore, setManualScore] = useState('');
    const [detailTarget, setDetailTarget] = useState(null);   // result for cheat detail modal
    const [detailLogs, setDetailLogs] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
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

    const CHEAT_LABELS = {
        tab_switch: 'Chuyển tab / cửa sổ',
        copy: 'Sao chép nội dung',
        paste: 'Dán nội dung',
        cut: 'Cắt nội dung',
        right_click: 'Nhấp chuột phải',
        fullscreen_exit: 'Thoát toàn màn hình',
        devtools: 'Mở DevTools / Xem nguồn',
    };

    const isBannedResult = (r) => Array.isArray(r.answers_detail) && r.answers_detail[0]?.banned === true;

    const openDetailModal = async (result) => {
        setDetailTarget(result);
        setDetailLogs([]);
        setDetailLoading(true);
        const logs = await api.getCheatingLogsByUser(result.exam_id, result.user_id);
        setDetailLogs(logs);
        setDetailLoading(false);
    };

    const openRegradeModal = (result) => {
        setRegradeTarget(result);
        setManualScore(String(result.score));
    };

    const handleAutoRegrade = async () => {
        const res = await api.regradeResult(regradeTarget.id);
        if (res.success) {
            toast.success(`Đã chấm lại tự động: ${res.score}/10 (${res.correct_count} câu đúng)`);
            setRegradeTarget(null);
            loadResults();
        } else {
            toast.error('Không thể chấm lại bài thi này');
        }
    };

    const handleManualScore = async () => {
        const score = parseFloat(manualScore);
        if (isNaN(score) || score < 0 || score > 10) {
            toast.error('Điểm phải từ 0 đến 10');
            return;
        }
        const rounded = Math.round(score * 10) / 10;
        const res = await api.updateScore(regradeTarget.id, rounded);
        if (res.success) {
            toast.success(`Đã cập nhật điểm: ${rounded}/10`);
            setRegradeTarget(null);
            loadResults();
        } else {
            toast.error('Không thể cập nhật điểm');
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
                                const banned = isBannedResult(r);
                                return (
                                    <tr key={r.id} style={{ background: banned ? 'rgba(239,68,68,0.06)' : undefined }}>
                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="avatar-sm" style={{ background: banned ? 'var(--danger)' : undefined }}>
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
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                                <span className={`badge ${r.score >= 5 ? 'badge-success' : 'badge-danger'}`}>
                                                    {r.score}/10
                                                </span>
                                                {banned && (
                                                    <span className="badge badge-danger" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                                        🚫 Bị cấm thi
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            {banned ? <span style={{ color: 'var(--text-muted)' }}>—</span> : `${r.correct_count}/${r.total_questions}`}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {cheatingCount > 0 ? (
                                                <button
                                                    className="badge badge-danger"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', border: 'none', background: 'var(--danger)' }}
                                                    onClick={() => openDetailModal(r)}
                                                    title="Xem chi tiết vi phạm"
                                                >
                                                    <ShieldAlert size={12} /> {cheatingCount} vi phạm
                                                </button>
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
                                                {(cheatingCount > 0 || banned) && (
                                                    <button className="btn btn-sm btn-danger" title="Chi tiết vi phạm" onClick={() => openDetailModal(r)}>
                                                        <Eye size={13} /> Vi phạm
                                                    </button>
                                                )}
                                                <button className="btn btn-sm btn-info" title="Chấm điểm lại" onClick={() => openRegradeModal(r)}>
                                                    <Pencil size={13} /> Chấm lại
                                                </button>
                                                <button className="btn btn-sm btn-warning" title="Cho sinh viên làm lại bài thi" onClick={() => handleAllowRetake(r)}>
                                                    <RotateCcw size={13} /> Làm lại
                                                </button>
                                                <button className="btn btn-sm btn-danger" title="Xóa bài thi" onClick={() => handleDelete(r)}>
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

            {/* Cheat detail modal */}
            {detailTarget && (
                <div className="modal-overlay" onClick={() => setDetailTarget(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}>
                                <ShieldAlert size={20} /> Chi tiết vi phạm gian lận
                            </h2>
                            <button className="modal-close" onClick={() => setDetailTarget(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            {/* Student + exam info */}
                            <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: 180 }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 2 }}>Sinh viên</div>
                                    <div style={{ fontWeight: 600 }}>{detailTarget.user_name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{detailTarget.student_id}</div>
                                </div>
                                <div style={{ flex: 1, minWidth: 180 }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 2 }}>Đề thi</div>
                                    <div style={{ fontWeight: 600 }}>{detailTarget.exam_title}</div>
                                </div>
                                <div style={{ minWidth: 120 }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 2 }}>Kết quả</div>
                                    <span className="badge badge-danger" style={{ fontSize: '1rem' }}>{detailTarget.score}/10</span>
                                    {isBannedResult(detailTarget) && (
                                        <div style={{ marginTop: 4 }}>
                                            <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>🚫 Bị cấm thi</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ minWidth: 100 }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 2 }}>Thời gian nộp</div>
                                    <div style={{ fontSize: '0.82rem' }}>{new Date(detailTarget.submitted_at).toLocaleString('vi-VN', { hour12: false })}</div>
                                </div>
                            </div>

                            {/* Ban reason */}
                            {isBannedResult(detailTarget) && (
                                <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.9rem' }}>Lý do bị cấm thi</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                                            {detailTarget.answers_detail[0]?.reason || 'Vi phạm gian lận quá nhiều lần'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cheating logs */}
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <ShieldAlert size={15} style={{ color: 'var(--danger)' }} />
                                Nhật ký vi phạm ({detailLogs.length} sự kiện)
                            </div>

                            {detailLoading ? (
                                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>Đang tải...</div>
                            ) : detailLogs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                    Không có nhật ký vi phạm nào được ghi lại
                                </div>
                            ) : (
                                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                                    <table className="table" style={{ marginBottom: 0 }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: 30 }}>#</th>
                                                <th>Thời điểm</th>
                                                <th>Loại vi phạm</th>
                                                <th>Nội dung chi tiết</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailLogs.map((log, idx) => (
                                                <tr key={log.id}>
                                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{idx + 1}</td>
                                                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                                                        {new Date(log.timestamp).toLocaleString('vi-VN', { hour12: false })}
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
                                                            <ShieldAlert size={11} />
                                                            {CHEAT_LABELS[log.type] || log.type}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.detail}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setDetailTarget(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Regrade modal */}
            {regradeTarget && (
                <div className="modal-overlay" onClick={() => setRegradeTarget(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Chấm điểm lại</h2>
                            <button className="modal-close" onClick={() => setRegradeTarget(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', fontSize: '0.88rem' }}>
                                <div><span style={{ color: 'var(--text-muted)' }}>Sinh viên: </span><strong>{regradeTarget.user_name}</strong></div>
                                <div><span style={{ color: 'var(--text-muted)' }}>Đề thi: </span><strong>{regradeTarget.exam_title}</strong></div>
                                <div style={{ marginTop: 4 }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Điểm hiện tại: </span>
                                    <span className={`badge ${regradeTarget.score >= 5 ? 'badge-success' : 'badge-danger'}`}>{regradeTarget.score}/10</span>
                                    <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>({regradeTarget.correct_count}/{regradeTarget.total_questions} câu đúng)</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nhập điểm mới (0 – 10)</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={manualScore}
                                    onChange={e => setManualScore(e.target.value)}
                                    autoFocus
                                    style={{ fontSize: '1.2rem', textAlign: 'center', fontWeight: 600 }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ gap: 8 }}>
                            <button className="btn btn-secondary" onClick={() => setRegradeTarget(null)}>Hủy</button>
                            <button className="btn btn-secondary" onClick={handleAutoRegrade} title="Tính lại từ đáp án đã lưu">
                                <RefreshCw size={15} /> Tính lại tự động
                            </button>
                            <button className="btn btn-primary" onClick={handleManualScore}>
                                <Pencil size={15} /> Lưu điểm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
