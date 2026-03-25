'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import {
    FileText, Clock, CheckSquare, Play, CheckCircle2,
    Shuffle, BookOpen, Calendar, Lock
} from 'lucide-react';

export default function StudentExams({ onStartExam }) {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);

    useEffect(() => {
        const load = async () => {
            if (user) {
                const data = await api.getAvailableExams(user.id);
                setExams(data);
            }
        };
        load();
    }, [user]);

    const activeExams = exams.filter(e => !e.already_done);
    const completedExams = exams.filter(e => e.already_done);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bài thi của tôi</h1>
                    <p className="page-subtitle">
                        {activeExams.length} bài thi chờ làm
                        {completedExams.length > 0 && ` | ${completedExams.length} đã hoàn thành`}
                    </p>
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
                <>
                    {activeExams.length > 0 && (
                        <>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                Chờ làm bài ({activeExams.length})
                            </h3>
                            <div className="grid-2" style={{ marginBottom: 24 }}>
                                {activeExams.map(exam => (
                                    <ExamCard key={exam.id} exam={exam} onStart={onStartExam} />
                                ))}
                            </div>
                        </>
                    )}

                    {completedExams.length > 0 && (
                        <>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                Đã hoàn thành ({completedExams.length})
                            </h3>
                            <div className="grid-2">
                                {completedExams.map(exam => (
                                    <ExamCard key={exam.id} exam={exam} completed />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

function ExamCard({ exam, onStart, completed }) {
    const now = new Date();
    const notYetOpen = exam.start_time && now < new Date(exam.start_time);
    const expired = exam.end_time && now > new Date(exam.end_time);
    const isLocked = notYetOpen || expired;

    const formatDT = (dt) => new Date(dt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', opacity: completed || isLocked ? 0.75 : 1 }}>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {(exam.subject_name || exam.subjects?.name) && (
                        <span className="badge badge-info">
                            <BookOpen size={12} /> {exam.subject_name || exam.subjects?.name}
                        </span>
                    )}
                    {completed && (
                        <span className="badge badge-success"><CheckCircle2 size={12} /> Đã nộp</span>
                    )}
                    {notYetOpen && (
                        <span className="badge badge-warning"><Lock size={12} /> Chưa mở</span>
                    )}
                    {expired && (
                        <span className="badge badge-danger"><Lock size={12} /> Hết hạn</span>
                    )}
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
                    {(exam.start_time || exam.end_time) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Calendar size={16} style={{ color: 'var(--info)' }} />
                            <span>
                                {exam.start_time && `Mở: ${formatDT(exam.start_time)}`}
                                {exam.start_time && exam.end_time && ' — '}
                                {exam.end_time && `Đóng: ${formatDT(exam.end_time)}`}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div style={{ marginTop: 20 }}>
                {completed ? (
                    <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                        <CheckCircle2 size={18} /> Đã hoàn thành
                    </button>
                ) : isLocked ? (
                    <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                        <Lock size={18} /> {notYetOpen ? 'Chưa đến giờ thi' : 'Đã hết hạn thi'}
                    </button>
                ) : (
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                        if (confirm(`Bắt đầu bài thi "${exam.title}"?\nThời gian: ${exam.duration_minutes} phút\nSố câu: ${exam.total_questions}\n\nBài thi sẽ tự động nộp khi hết giờ.\nHệ thống chống gian lận sẽ được kích hoạt.`)) {
                            onStart(exam.id);
                        }
                    }}>
                        <Play size={18} /> Bắt đầu thi
                    </button>
                )}
            </div>
        </div>
    );
}
