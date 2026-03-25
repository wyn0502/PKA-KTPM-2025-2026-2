'use client';

import { useState, useEffect, useRef } from 'react';
import { demoApi } from '@/lib/supabase';
import {
    ArrowLeft, Monitor, Users, CheckCircle2, Clock,
    ShieldAlert, RefreshCw, UserCheck, UserX, BarChart3
} from 'lucide-react';

export default function ExamMonitor({ examId, onBack }) {
    const [data, setData] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const intervalRef = useRef(null);

    const loadData = () => {
        const monitorData = demoApi.getExamMonitorData(examId);
        setData(monitorData);
    };

    useEffect(() => {
        loadData();
        if (autoRefresh) {
            intervalRef.current = setInterval(loadData, 3000);
        }
        return () => clearInterval(intervalRef.current);
    }, [examId, autoRefresh]);

    if (!data) return <div className="loading-container"><div className="spinner" /></div>;

    const { exam, activeSessions, completedCount, totalAssigned, completedResults } = data;

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="btn btn-ghost" onClick={onBack}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Monitor size={22} /> Giám sát: {exam.title}
                        </h1>
                        <p className="page-subtitle">
                            Cập nhật {autoRefresh ? 'tự động mỗi 3 giây' : 'thủ công'}
                        </p>
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

                                    return (
                                        <tr key={s.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="avatar-sm" style={{ background: 'var(--gradient-primary)' }}>
                                                        {s.user?.full_name?.split(' ').map(w => w[0]).join('').slice(-2)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.user?.full_name}</div>
                                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{s.user?.student_id}</div>
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
                                            <td style={{ textAlign: 'center', fontWeight: 500 }}>
                                                {s.answered_count}/{s.total_questions}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {s.cheating_count > 0 ? (
                                                    <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                        <ShieldAlert size={12} /> {s.cheating_count}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>OK</span>
                                                )}
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                {startedMinAgo} phút trước
                                            </td>
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
                    <div className="table-container">
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
                                {completedResults.map(r => (
                                    <tr key={r.id}>
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
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`badge ${r.score >= 5 ? 'badge-success' : 'badge-danger'}`}>
                                                {r.score}/10
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{r.correct_count}/{r.total_questions}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            {r.cheating_count > 0 ? (
                                                <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <ShieldAlert size={12} /> {r.cheating_count}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>0</span>
                                            )}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {new Date(r.submitted_at).toLocaleString('vi-VN')}
                                        </td>
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
