'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import {
    ArrowLeft, Monitor, Users, CheckCircle2, Clock,
    ShieldAlert, RefreshCw, BarChart3, AlertTriangle, X
} from 'lucide-react';

const CHEAT_TYPE_LABEL = {
    tab_switch:     'Chuyển tab / cửa sổ',
    copy:           'Sao chép nội dung',
    paste:          'Dán nội dung',
    cut:            'Cắt nội dung',
    right_click:    'Nhấp chuột phải',
    fullscreen_exit:'Thoát toàn màn hình',
    devtools:       'Mở DevTools / Xem nguồn',
};

export default function ExamMonitor({ examId, onBack }) {
    const [data, setData] = useState(null);
    const [cheatingLogs, setCheatingLogs] = useState([]);
    const [liveAlert, setLiveAlert] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const intervalRef = useRef(null);
    const prevLogCountRef = useRef(0);
    const alertTimerRef = useRef(null);

    const loadData = useCallback(async () => {
        const [exam, sessions, results, logs] = await Promise.all([
            api.getExamById(examId),
            api.getActiveSessions(examId),
            api.getResultsByExam(examId),
            api.getCheatingLogs(examId),
        ]);
        if (!exam) return;

        // Detect new cheating events for live alert
        if (logs.length > prevLogCountRef.current && prevLogCountRef.current >= 0) {
            const newest = logs[0];
            if (newest) {
                clearTimeout(alertTimerRef.current);
                setLiveAlert(newest);
                alertTimerRef.current = setTimeout(() => setLiveAlert(null), 6000);
            }
        }
        prevLogCountRef.current = logs.length;
        setCheatingLogs(logs);

        const totalAssigned = new Set([
            ...sessions.map(s => s.user_id),
            ...results.map(r => r.user_id),
        ]).size;
        setData({ exam, activeSessions: sessions, completedCount: results.length, totalAssigned, completedResults: results });
    }, [examId]);

    useEffect(() => {
        prevLogCountRef.current = -1;
        loadData();
        if (!autoRefresh) return;
        intervalRef.current = setInterval(loadData, 3000);
        return () => clearInterval(intervalRef.current);
    }, [examId, autoRefresh, loadData]);

    if (!data) return <div className="loading-container"><div className="spinner" /></div>;

    const { exam, activeSessions, completedCount, totalAssigned, completedResults } = data;
    const totalCheating = cheatingLogs.length;

    return (
        <div>
            {/* Live cheating alert banner */}
            {liveAlert && (
                <div style={{
                    position: 'fixed', top: 16, right: 16, zIndex: 2000,
                    background: 'var(--danger)', color: '#fff',
                    borderRadius: 'var(--radius)', padding: '12px 16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    maxWidth: 360, animation: 'slideIn 0.3s ease',
                }}>
                    <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>
                            Phát hiện gian lận!
                        </div>
                        <div style={{ fontSize: '0.82rem', opacity: 0.92 }}>
                            <strong>{liveAlert.user_name}</strong> — {CHEAT_TYPE_LABEL[liveAlert.type] || liveAlert.type}
                        </div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: 2 }}>
                            {liveAlert.detail}
                        </div>
                    </div>
                    <button onClick={() => setLiveAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0 }}>
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="btn btn-ghost" onClick={onBack}><ArrowLeft size={18} /></button>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Monitor size={22} /> Giám sát: {exam.title}
                        </h1>
                        <p className="page-subtitle">Cập nhật {autoRefresh ? 'tự động mỗi 3 giây' : 'thủ công'}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={loadData}>
                        <RefreshCw size={14} /> Làm mới
                    </button>
                    <button
                        className={`btn btn-sm ${autoRefresh ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? 'Auto ON' : 'Auto OFF'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon primary"><Users size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{activeSessions.length}</div>
                        <div className="stat-label">Đang làm bài</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success"><CheckCircle2 size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{completedCount}</div>
                        <div className="stat-label">Đã nộp</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning"><Clock size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{exam.duration_minutes}p</div>
                        <div className="stat-label">Thời gian</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon info"><BarChart3 size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{totalAssigned}</div>
                        <div className="stat-label">Tổng tham gia</div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderColor: totalCheating > 0 ? 'var(--danger)' : undefined }}>
                    <div className="stat-icon danger"><ShieldAlert size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value" style={{ color: totalCheating > 0 ? 'var(--danger)' : undefined }}>{totalCheating}</div>
                        <div className="stat-label">Vi phạm</div>
                    </div>
                </div>
            </div>

            {/* Active sessions */}
            {activeSessions.length > 0 && (
                <>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="pulse-dot" /> Đang làm bài ({activeSessions.length})
                    </h3>
                    <div className="table-container" style={{ marginBottom: 24 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Sinh viên</th>
                                    <th style={{ textAlign: 'center' }}>Tiến độ</th>
                                    <th style={{ textAlign: 'center' }}>Đã trả lời</th>
                                    <th style={{ textAlign: 'center' }}>Gian lận</th>
                                    <th>Bắt đầu lúc</th>
                                    <th>Hoạt động gần nhất</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeSessions.map(s => {
                                    const progressPct = s.total_questions > 0 ? Math.round((s.answered_count / s.total_questions) * 100) : 0;
                                    const startedMinAgo = Math.round((Date.now() - new Date(s.started_at).getTime()) / 60000);
                                    const lastActiveAgo = Math.round((Date.now() - new Date(s.last_activity).getTime()) / 1000);
                                    const userLogs = cheatingLogs.filter(l => l.user_id === s.user_id);

                                    return (
                                        <tr key={s.id} style={{ background: s.cheating_count > 0 ? 'rgba(var(--danger-rgb, 239,68,68), 0.05)' : undefined }}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="avatar-sm" style={{ background: 'var(--gradient-primary)' }}>
                                                        {s.user_name?.split(' ').map(w => w[0]).join('').slice(-2)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.user_name}</div>
                                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{s.student_id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                                    <div className="monitor-progress-bar">
                                                        <div className="monitor-progress-fill" style={{ width: `${progressPct}%` }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: 35 }}>{progressPct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 500 }}>{s.answered_count}/{s.total_questions}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {s.cheating_count > 0 ? (
                                                    <div>
                                                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                            <ShieldAlert size={12} /> {s.cheating_count} vi phạm
                                                        </span>
                                                        {userLogs.length > 0 && (
                                                            <div style={{ marginTop: 4, fontSize: '0.75rem', color: 'var(--danger)', textAlign: 'left' }}>
                                                                {userLogs.slice(0, 2).map((l, i) => (
                                                                    <div key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                                                                        • {CHEAT_TYPE_LABEL[l.type] || l.type}
                                                                    </div>
                                                                ))}
                                                                {userLogs.length > 2 && <div style={{ color: 'var(--text-muted)' }}>+{userLogs.length - 2} sự kiện nữa</div>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>OK</span>
                                                )}
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{startedMinAgo} phút trước</td>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                <span style={{ color: lastActiveAgo < 10 ? 'var(--success)' : lastActiveAgo < 60 ? 'var(--warning)' : 'var(--danger)' }}>
                                                    {lastActiveAgo < 5 ? 'Vừa xong' : lastActiveAgo < 60 ? `${lastActiveAgo}s trước` : `${Math.round(lastActiveAgo / 60)}p trước`}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Completed results */}
            {completedResults.length > 0 && (
                <>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Đã nộp bài ({completedResults.length})
                    </h3>
                    <div className="table-container" style={{ marginBottom: 24 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Sinh viên</th>
                                    <th style={{ textAlign: 'center' }}>Điểm</th>
                                    <th style={{ textAlign: 'center' }}>Đúng</th>
                                    <th style={{ textAlign: 'center' }}>Gian lận</th>
                                    <th>Thời gian nộp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {completedResults.map(r => {
                                    const userLogs = cheatingLogs.filter(l => l.user_id === r.user_id);
                                    return (
                                        <tr key={r.id} style={{ background: userLogs.length > 0 ? 'rgba(var(--danger-rgb, 239,68,68), 0.05)' : undefined }}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="avatar-sm">{r.user_name?.split(' ').map(w => w[0]).join('').slice(-2)}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{r.user_name}</div>
                                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.student_id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`badge ${r.score >= 5 ? 'badge-success' : 'badge-danger'}`}>{r.score}/10</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{r.correct_count}/{r.total_questions}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {userLogs.length > 0 ? (
                                                    <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                        <ShieldAlert size={12} /> {userLogs.length}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>0</span>
                                                )}
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                {new Date(r.submitted_at).toLocaleString('vi-VN', { hour12: false })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Cheating log detail */}
            {cheatingLogs.length > 0 && (
                <>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--danger)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={16} /> Nhật ký vi phạm ({cheatingLogs.length})
                    </h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Sinh viên</th>
                                    <th>Loại vi phạm</th>
                                    <th>Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cheatingLogs.map(l => (
                                    <tr key={l.id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                            {new Date(l.timestamp).toLocaleString('vi-VN', { hour12: false })}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{l.user_name}</div>
                                            {l.student_id && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{l.student_id}</div>}
                                        </td>
                                        <td>
                                            <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
                                                <ShieldAlert size={11} />
                                                {CHEAT_TYPE_LABEL[l.type] || l.type}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{l.detail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeSessions.length === 0 && completedResults.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><Monitor size={28} /></div>
                        <h3 className="empty-state-title">Chưa có sinh viên nào tham gia</h3>
                        <p className="empty-state-text">Dữ liệu sẽ hiển thị khi sinh viên bắt đầu làm bài</p>
                    </div>
                </div>
            )}
        </div>
    );
}
