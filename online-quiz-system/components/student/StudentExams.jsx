'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { demoApi } from '@/lib/supabase';
import {
    FileText, Clock, CheckSquare, Play, CheckCircle2,
    AlertCircle, Shuffle, CalendarClock
} from 'lucide-react';

export default function StudentExams({ onStartExam }) {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);

    useEffect(() => {
        if (user) setExams(demoApi.getExamsForStudent(user.id));
    }, [user]);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bài thi của tôi</h1>
                    <p className="page-subtitle">Danh sách các bài thi được gán cho bạn</p>
                </div>
            </div>

            {exams.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><FileText size={28} /></div>
                        <h3 className="empty-state-title">Không có bài thi nào</h3>
                        <p className="empty-state-text">Hiện tại bạn chưa được gán bài thi nào. Vui lòng liên hệ giảng viên.</p>
                    </div>
                </div>
            ) : (
                <div className="grid-2">
                    {exams.map(exam => (
                        <div key={exam.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                    {exam.subject && <span className="badge badge-info">{exam.subject.name}</span>}
                                    {exam.hasSubmitted && <span className="badge badge-success"><CheckCircle2 size={12} /> Đã nộp</span>}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-heading)' }}>
                                    {exam.title}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Clock size={16} style={{ color: 'var(--warning)' }} />
                                        <span>Thời gian: <strong>{exam.duration_minutes} phút</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <CheckSquare size={16} style={{ color: 'var(--primary-light)' }} />
                                        <span>Số câu hỏi: <strong>{exam.total_questions}</strong></span>
                                    </div>
                                    {exam.shuffle_questions && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Shuffle size={16} style={{ color: 'var(--secondary)' }} />
                                            <span>Trộn đề thi</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ marginTop: 20 }}>
                                {exam.hasSubmitted ? (
                                    <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                                        <CheckCircle2 size={18} /> Đã hoàn thành
                                    </button>
                                ) : (
                                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                                        if (confirm(`Bắt đầu bài thi "${exam.title}"? Bạn có ${exam.duration_minutes} phút để hoàn thành.`)) {
                                            onStartExam(exam.id);
                                        }
                                    }}>
                                        <Play size={18} /> Bắt đầu thi
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
