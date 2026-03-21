'use client';

import { useState, useEffect } from 'react';
import { demoApi } from '@/lib/supabase';
import {
    Users, FileQuestion, ClipboardList, TrendingUp,
    CheckCircle2, BarChart3, BookOpen, Activity
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const DIFFICULTY_COLORS = { 'Dễ': '#10b981', 'Trung bình': '#f59e0b', 'Khó': '#ef4444' };

export default function AdminHome() {
    const [stats, setStats] = useState(null);
    const [results, setResults] = useState([]);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        setStats(demoApi.getStats());
        setResults(demoApi.getAllResults());
        setQuestions(demoApi.getQuestions());
    }, []);

    if (!stats) return <div className="loading-container"><div className="spinner" /></div>;

    const scoreDistribution = [
        { range: '0-2', count: results.filter(r => r.score <= 2).length, fill: '#ef4444' },
        { range: '3-4', count: results.filter(r => r.score > 2 && r.score <= 4).length, fill: '#f59e0b' },
        { range: '5-6', count: results.filter(r => r.score > 4 && r.score <= 6).length, fill: '#06b6d4' },
        { range: '7-8', count: results.filter(r => r.score > 6 && r.score <= 8).length, fill: '#6366f1' },
        { range: '9-10', count: results.filter(r => r.score > 8).length, fill: '#10b981' },
    ];

    const difficultyData = [
        { name: 'Dễ', value: questions.filter(q => q.difficulty === 'easy').length },
        { name: 'Trung bình', value: questions.filter(q => q.difficulty === 'medium').length },
        { name: 'Khó', value: questions.filter(q => q.difficulty === 'hard').length },
    ].filter(d => d.value > 0);

    const avgScore = results.length > 0
        ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)
        : '0';

    const passRate = results.length > 0
        ? Math.round((results.filter(r => r.score >= 5).length / results.length) * 100)
        : 0;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Tổng quan hệ thống thi trắc nghiệm</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary"><Users size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-label">Sinh viên</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon secondary"><FileQuestion size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.totalQuestions}</div>
                        <div className="stat-label">Câu hỏi</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success"><ClipboardList size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.totalExams}</div>
                        <div className="stat-label">Đề thi</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning"><CheckCircle2 size={24} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.activeExams}</div>
                        <div className="stat-label">Đang mở</div>
                    </div>
                </div>
            </div>

            {results.length > 0 && (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 0 }}>
                    <div className="stat-card">
                        <div className="stat-icon primary"><Activity size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{results.length}</div>
                            <div className="stat-label">Lượt thi</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon success"><TrendingUp size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{avgScore}</div>
                            <div className="stat-label">Điểm TB</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon warning"><BarChart3 size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{passRate}%</div>
                            <div className="stat-label">Tỷ lệ đạt</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart3 size={20} style={{ color: 'var(--primary-light)' }} />
                            Phân bố điểm số
                        </h3>
                    </div>
                    {results.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={scoreDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="range" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        color: 'var(--text)',
                                    }}
                                    formatter={(value) => [value, 'Số lượng']}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {scoreDistribution.map((entry, index) => (
                                        <Cell key={index} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">
                            <p className="empty-state-text">Chưa có kết quả thi nào</p>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp size={20} style={{ color: 'var(--secondary)' }} />
                            Độ khó câu hỏi
                        </h3>
                    </div>
                    {difficultyData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={difficultyData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {difficultyData.map((entry) => (
                                            <Cell key={entry.name} fill={DIFFICULTY_COLORS[entry.name]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius)',
                                            color: 'var(--text)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
                                {difficultyData.map((d) => (
                                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: DIFFICULTY_COLORS[d.name] }} />
                                        <span style={{ color: 'var(--text-secondary)' }}>{d.name} ({d.value})</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <p className="empty-state-text">Chưa có câu hỏi nào</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Subject overview */}
            <div className="card" style={{ marginTop: 24 }}>
                <div className="card-header">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={20} style={{ color: 'var(--success)' }} />
                        Thống kê theo môn học
                    </h3>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Môn học</th>
                                <th style={{ textAlign: 'center' }}>Câu hỏi</th>
                                <th style={{ textAlign: 'center' }}>Đề thi</th>
                                <th style={{ textAlign: 'center' }}>Lượt thi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {demoApi.getSubjects().map(subject => {
                                const qCount = questions.filter(q => q.subject_id === subject.id).length;
                                const exams = demoApi.getExams().filter(e => e.subject_id === subject.id);
                                const examIds = exams.map(e => e.id);
                                const rCount = results.filter(r => examIds.includes(r.exam_id)).length;
                                return (
                                    <tr key={subject.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <BookOpen size={16} style={{ color: 'var(--primary-light)' }} />
                                                <strong>{subject.name}</strong>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{qCount}</td>
                                        <td style={{ textAlign: 'center' }}>{exams.length}</td>
                                        <td style={{ textAlign: 'center' }}>{rCount}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
