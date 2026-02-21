'use client';

import { useState, useEffect } from 'react';
import { demoApi } from '@/lib/supabase';
import {
    Users, FileQuestion, ClipboardList, TrendingUp,
    CheckCircle2, BarChart3
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminHome() {
    const [stats, setStats] = useState(null);
    const [results, setResults] = useState([]);

    useEffect(() => {
        setStats(demoApi.getStats());
        setResults(demoApi.getAllResults());
    }, []);

    if (!stats) return <div className="loading-container"><div className="spinner" /></div>;

    // Prepare chart data
    const scoreDistribution = [
        { range: '0-2', count: results.filter(r => r.score <= 2).length },
        { range: '3-4', count: results.filter(r => r.score > 2 && r.score <= 4).length },
        { range: '5-6', count: results.filter(r => r.score > 4 && r.score <= 6).length },
        { range: '7-8', count: results.filter(r => r.score > 6 && r.score <= 8).length },
        { range: '9-10', count: results.filter(r => r.score > 8).length },
    ];

    const difficultyData = (() => {
        const questions = demoApi.getQuestions();
        return [
            { name: 'Dễ', value: questions.filter(q => q.difficulty === 'easy').length },
            { name: 'Trung bình', value: questions.filter(q => q.difficulty === 'medium').length },
            { name: 'Khó', value: questions.filter(q => q.difficulty === 'hard').length },
        ].filter(d => d.value > 0);
    })();

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
                    <div className="stat-icon primary">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-label">Sinh viên</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon secondary">
                        <FileQuestion size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.totalQuestions}</div>
                        <div className="stat-label">Câu hỏi</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <ClipboardList size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.totalExams}</div>
                        <div className="stat-label">Đề thi</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.activeExams}</div>
                        <div className="stat-label">Đang mở</div>
                    </div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart3 size={20} style={{ color: 'var(--primary-light)' }} />
                            Phân bố điểm số
                        </h3>
                    </div>
                    {results.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={scoreDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="range" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        color: 'var(--text)',
                                    }}
                                />
                                <Bar dataKey="count" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
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
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={difficultyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {difficultyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    ) : (
                        <div className="empty-state">
                            <p className="empty-state-text">Chưa có câu hỏi nào</p>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
                        {difficultyData.map((d, i) => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i] }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{d.name} ({d.value})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
