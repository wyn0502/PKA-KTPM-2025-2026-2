'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import {
    History, Trophy, Calendar, CheckCircle2, XCircle,
    Eye, EyeOff, BarChart3, Search
} from 'lucide-react';

export default function StudentResults() {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
            if (user) {
                const data = await api.getResults(user.id);
                setResults(data);
            }
        };
        load();
    }, [user]);

    const filtered = results.filter(r => {
        if (!searchQuery) return true;
        return r.exam?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const avg = results.length > 0
        ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)
        : '0';

    const passCount = results.filter(r => r.score >= 5).length;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Lịch sử & Kết quả</h1>
                    <p className="page-subtitle">{results.length} bài thi đã hoàn thành</p>
                </div>
            </div>

            {results.length > 0 && (
                <div className="stats-grid" style={{ marginBottom: 24 }}>
                    <div className="stat-card">
                        <div className="stat-icon primary"><BarChart3 size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{results.length}</div>
                            <div className="stat-label">Bài đã thi</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon success"><Trophy size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{avg}</div>
                            <div className="stat-label">Điểm trung bình</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon warning"><CheckCircle2 size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{passCount}/{results.length}</div>
                            <div className="stat-label">Bài đạt</div>
                        </div>
                    </div>
                </div>
            )}

            {results.length > 1 && (
                <div className="filter-bar">
                    <div className="search-input">
                        <Search size={18} />
                        <input placeholder="Tìm theo tên bài thi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><History size={28} /></div>
                        <h3 className="empty-state-title">{searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có kết quả nào'}</h3>
                        <p className="empty-state-text">{searchQuery ? 'Thử từ khóa khác' : 'Hãy hoàn thành một bài thi để xem kết quả'}</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map(r => (
                        <div key={r.id} className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>
                                        {r.exam?.title || 'Bài thi'}
                                    </h3>
                                    <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Calendar size={14} />
                                            {new Date(r.submitted_at).toLocaleString('vi-VN')}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                                            {r.correct_count}/{r.total_questions} đúng
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span className={`badge ${r.score >= 5 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '8px 16px' }}>
                                        {r.score}/10
                                    </span>
                                    {r.answers_detail && (
                                        <button className="btn btn-ghost btn-sm" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} title="Xem chi tiết">
                                            {expandedId === r.id ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {expandedId === r.id && r.answers_detail && (
                                <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                                    {r.answers_detail.map((detail, index) => (
                                        <div key={index} style={{
                                            padding: '12px 0',
                                            borderBottom: index < r.answers_detail.length - 1 ? '1px solid var(--border)' : 'none',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Câu {index + 1}</span>
                                                {detail.is_correct ? (
                                                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                                                ) : (
                                                    <XCircle size={16} style={{ color: 'var(--danger)' }} />
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 8 }}>{detail.question_content}</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {detail.answers?.map(a => (
                                                    <div key={a.id} style={{
                                                        fontSize: '0.85rem', padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                                                        background: a.is_correct ? 'rgba(16,185,129,0.08)' : a.id === detail.user_answer_id && !detail.is_correct ? 'rgba(239,68,68,0.08)' : 'transparent',
                                                        color: a.is_correct ? 'var(--success)' : a.id === detail.user_answer_id && !detail.is_correct ? 'var(--danger)' : 'var(--text-secondary)',
                                                        display: 'flex', alignItems: 'center', gap: 8,
                                                    }}>
                                                        {a.is_correct ? <CheckCircle2 size={14} /> : a.id === detail.user_answer_id ? <XCircle size={14} /> : <span style={{ width: 14 }} />}
                                                        {a.content}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
