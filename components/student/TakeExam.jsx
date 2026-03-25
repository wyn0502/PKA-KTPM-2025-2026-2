'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import {
    Clock, ChevronLeft, ChevronRight, Send, AlertTriangle,
    CheckCircle2, XCircle, ArrowLeft, Timer, Hash, Flag,
    ShieldAlert, Eye as EyeIcon, Copy, Maximize
} from 'lucide-react';

function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function TakeExam({ examId, onFinish, previewMode = false }) {
    const { user } = useAuth();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState(new Set());
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [cheatingWarnings, setCheatingWarnings] = useState(0);
    const [cheatingAlert, setCheatingAlert] = useState(null);
    const timerRef = useRef(null);
    const submitCalledRef = useRef(false);
    const cheatingCountRef = useRef(0);
    const startedAtRef = useRef(new Date().toISOString());

    // Load exam and shuffle
    useEffect(() => {
        const load = async () => {
            const examData = await api.getExamById(examId);
            if (!examData) return;
            setExam(examData);
            setTimeLeft(examData.duration_minutes * 60);

            let qs = [...examData.questions];
            if (examData.shuffle_questions) qs = shuffleArray(qs);
            if (examData.shuffle_answers) {
                qs = qs.map(q => ({ ...q, answers: shuffleArray(q.answers) }));
            }
            setQuestions(qs);
            // Register active session for monitoring
            if (!previewMode) {
                await api.registerSession({exam_id: examId, user_id: user.id, total_questions: qs.length});
            }
        };
        load();
    }, [examId, user]);

    // Log cheating event helper
    const logCheat = useCallback(async (type, detail) => {
        if (!user || isSubmitted) return;
        if (!previewMode) {
            await api.logCheating({exam_id: examId, user_id: user.id, type, detail});
        }
        cheatingCountRef.current += 1;
        setCheatingWarnings(cheatingCountRef.current);
        setCheatingAlert(detail);
        setTimeout(() => setCheatingAlert(null), 4000);
    }, [examId, user, isSubmitted]);

    // Cheating detection: tab visibility
    useEffect(() => {
        if (isSubmitted || !exam) return;
        const handleVisibility = () => {
            if (document.hidden) {
                logCheat('tab_switch', 'Chuyển tab/cửa sổ khác');
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [isSubmitted, exam, logCheat]);

    // Cheating detection: copy, paste, cut, right-click
    useEffect(() => {
        if (isSubmitted || !exam) return;
        const handleCopy = (e) => { e.preventDefault(); logCheat('copy', 'Cố gắng sao chép nội dung'); };
        const handlePaste = (e) => { e.preventDefault(); logCheat('paste', 'Cố gắng dán nội dung'); };
        const handleCut = (e) => { e.preventDefault(); logCheat('cut', 'Cố gắng cắt nội dung'); };
        const handleContextMenu = (e) => { e.preventDefault(); logCheat('right_click', 'Nhấn chuột phải'); };

        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('cut', handleCut);
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('cut', handleCut);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [isSubmitted, exam, logCheat]);

    // Cheating detection: fullscreen exit
    useEffect(() => {
        if (isSubmitted || !exam) return;

        // Try to enter fullscreen on exam start
        const enterFullscreen = async () => {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
            } catch {
                // Browser may block fullscreen without user gesture - that's ok
            }
        };
        enterFullscreen();

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !submitCalledRef.current) {
                logCheat('fullscreen_exit', 'Thoát chế độ toàn màn hình');
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            // Exit fullscreen when component unmounts
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        };
    }, [isSubmitted, exam, logCheat]);

    // Cheating detection: window blur (alt-tab, etc)
    useEffect(() => {
        if (isSubmitted || !exam) return;
        const handleBlur = () => {
            if (!document.hidden) {
                logCheat('tab_switch', 'Mất focus cửa sổ (Alt+Tab)');
            }
        };
        window.addEventListener('blur', handleBlur);
        return () => window.removeEventListener('blur', handleBlur);
    }, [isSubmitted, exam, logCheat]);

    // Cheating detection: keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+Shift+I, F12)
    useEffect(() => {
        if (isSubmitted || !exam) return;
        const handleKeyDown = (e) => {
            // Block Ctrl+C, Ctrl+V, Ctrl+X
            if (e.ctrlKey && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
            // Detect devtools shortcuts
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
                e.preventDefault();
                logCheat('devtools', 'Cố gắng mở DevTools');
            }
            // Detect Ctrl+U (view source)
            if (e.ctrlKey && e.key.toLowerCase() === 'u') {
                e.preventDefault();
                logCheat('devtools', 'Cố gắng xem mã nguồn');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSubmitted, exam, logCheat]);

    // Countdown timer
    useEffect(() => {
        if (isSubmitted || timeLeft <= 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [isSubmitted, exam]);

    const doSubmit = useCallback(async () => {
        if (submitCalledRef.current) return;
        submitCalledRef.current = true;
        clearInterval(timerRef.current);
        // Exit fullscreen before showing result
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        if (previewMode) {
            // Calculate result locally without saving
            let correctCount = 0;
            const answersDetail = [];
            questions.forEach(q => {
                const userAnswer = answers[q.id];
                const correctAnswer = q.answers.find(a => a.is_correct);
                const isCorrect = userAnswer === correctAnswer?.id;
                if (isCorrect) correctCount++;
                answersDetail.push({
                    question_id: q.id,
                    question_content: q.content,
                    user_answer_id: userAnswer || null,
                    correct_answer_id: correctAnswer?.id,
                    is_correct: isCorrect,
                    answers: q.answers,
                });
            });
            const totalQuestions = questions.length;
            const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) / 10 : 0;
            setResult({ score, total_questions: totalQuestions, correct_count: correctCount, answers_detail: answersDetail });
            setIsSubmitted(true);
            return;
        }
        // Calculate score (same logic as previewMode — api.submitExam needs full data)
        let correctCount = 0;
        const answersDetail = [];
        questions.forEach(q => {
            const userAnswer = answers[q.id];
            const correctAnswer = q.answers.find(a => a.is_correct);
            const isCorrect = userAnswer === correctAnswer?.id;
            if (isCorrect) correctCount++;
            answersDetail.push({
                question_id: q.id,
                question_content: q.content,
                user_answer_id: userAnswer || null,
                correct_answer_id: correctAnswer?.id,
                is_correct: isCorrect,
                answers: q.answers,
            });
        });
        const totalQuestions = questions.length;
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) / 10 : 0;

        const submitResult = await api.submitExam({
            exam_id: examId, user_id: user.id,
            score, total_questions: totalQuestions, correct_count: correctCount,
            answers_detail: answersDetail, started_at: startedAtRef.current,
        });
        if (submitResult.success) {
            await api.removeSession(examId, user.id);
            setResult(submitResult.result ?? { score, total_questions: totalQuestions, correct_count: correctCount, answers_detail: answersDetail });
            setIsSubmitted(true);
        }
    }, [answers, examId, user, previewMode, questions]);

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeLeft === 0 && !isSubmitted && exam) {
            doSubmit();
        }
    }, [timeLeft, isSubmitted, exam, doSubmit]);

    const handleSubmit = () => {
        const unanswered = questions.length - Object.keys(answers).length;
        let msg = 'Bạn có chắc muốn nộp bài?';
        if (unanswered > 0) {
            msg = `Bạn còn ${unanswered} câu chưa trả lời. Nộp bài ngay?`;
        }
        if (confirm(msg)) {
            doSubmit();
        }
    };

    const selectAnswer = async (questionId, answerId) => {
        if (isSubmitted) return;
        setAnswers(prev => {
            const next = { ...prev, [questionId]: answerId };
            if (!previewMode) {
                api.updateSession(examId, user.id, {answered_count: Object.keys(next).length, total_questions: questions.length});
            }
            return next;
        });
    };

    const toggleFlag = (questionId) => {
        setFlagged(prev => {
            const next = new Set(prev);
            if (next.has(questionId)) next.delete(questionId);
            else next.add(questionId);
            return next;
        });
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const getTimerClass = () => {
        if (timeLeft <= 60) return 'exam-timer danger';
        if (timeLeft <= 300) return 'exam-timer warning';
        return 'exam-timer';
    };

    const answeredCount = Object.keys(answers).length;
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    if (!exam) return <div className="loading-container"><div className="spinner" /></div>;

    // Show result screen
    if (isSubmitted && result) {
        const passed = result.score >= 5;

        return (
            <div className="exam-container" style={{ padding: '32px 16px' }}>
                <div className="card">
                    <div className="result-score">
                        <div className={`result-score-circle ${passed ? 'pass' : 'fail'}`}>
                            {result.score}
                        </div>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>
                            {passed ? 'Chúc mừng bạn đã đạt!' : 'Chưa đạt, cố gắng lần sau!'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>{exam.title}</p>

                        <div className="result-detail-grid">
                            <div className="result-detail-item">
                                <div className="result-detail-value" style={{ color: 'var(--success)' }}>{result.correct_count}</div>
                                <div className="result-detail-label">Câu đúng</div>
                            </div>
                            <div className="result-detail-item">
                                <div className="result-detail-value" style={{ color: 'var(--danger)' }}>{result.total_questions - result.correct_count}</div>
                                <div className="result-detail-label">Câu sai</div>
                            </div>
                            <div className="result-detail-item">
                                <div className="result-detail-value">{result.total_questions}</div>
                                <div className="result-detail-label">Tổng câu</div>
                            </div>
                            <div className="result-detail-item">
                                <div className="result-detail-value">{result.score}</div>
                                <div className="result-detail-label">Điểm / 10</div>
                            </div>
                        </div>

                        {cheatingWarnings > 0 && (
                            <div className="cheating-result-warning" style={{ marginTop: 16 }}>
                                <ShieldAlert size={18} />
                                <span>{cheatingWarnings} cảnh báo gian lận được ghi nhận</span>
                            </div>
                        )}
                    </div>
                </div>

                {exam.show_result && result.answers_detail && (
                    <div style={{ marginTop: 24 }}>
                        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle2 size={20} style={{ color: 'var(--primary-light)' }} />
                            Đáp án chi tiết
                        </h3>
                        {result.answers_detail.map((detail, index) => (
                            <div key={index} className="question-card">
                                <div className="question-number">
                                    <Hash size={14} /> Câu {index + 1}
                                    {detail.is_correct ? (
                                        <span className="badge badge-success"><CheckCircle2 size={12} /> Đúng</span>
                                    ) : (
                                        <span className="badge badge-danger"><XCircle size={12} /> Sai</span>
                                    )}
                                </div>
                                <p className="question-content">{detail.question_content}</p>
                                <div className="answer-options">
                                    {detail.answers?.map(a => {
                                        let className = 'answer-option';
                                        if (a.id === detail.correct_answer_id) className += ' correct';
                                        else if (a.id === detail.user_answer_id && !detail.is_correct) className += ' incorrect';

                                        return (
                                            <div key={a.id} className={className}>
                                                {a.is_correct ? <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> :
                                                    a.id === detail.user_answer_id ? <XCircle size={18} style={{ color: 'var(--danger)' }} /> :
                                                        <div className="answer-radio" />}
                                                <span>{a.content}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <button className="btn btn-primary btn-lg" onClick={onFinish}>
                        <ArrowLeft size={18} /> Quay lại
                    </button>
                </div>
            </div>
        );
    }

    // Exam in progress
    const currentQuestion = questions[currentIndex];

    return (
        <div className="exam-container" style={{ padding: '16px' }}>
            {previewMode && (
                <div style={{background:'var(--warning)', color:'#000', padding:'8px 16px', textAlign:'center', fontSize:'0.85rem', fontWeight:600}}>
                    👁 Chế độ xem trước (Giảng viên) — Kết quả sẽ không được lưu
                </div>
            )}
            {/* Cheating alert toast */}
            {cheatingAlert && (
                <div className="cheating-alert">
                    <ShieldAlert size={18} />
                    <span>{cheatingAlert} - Hành vi đã được ghi nhận!</span>
                </div>
            )}

            {/* Header with timer */}
            <div className="exam-header">
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>{exam.title}</h2>
                    <div className="exam-progress">
                        <span>{answeredCount}/{questions.length} đã trả lời</span>
                        <div className="exam-progress-bar">
                            <div className="exam-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {cheatingWarnings > 0 && (
                        <div className="cheating-counter" title={`${cheatingWarnings} cảnh báo gian lận`}>
                            <ShieldAlert size={16} />
                            <span>{cheatingWarnings}</span>
                        </div>
                    )}
                    <div className={getTimerClass()}>
                        <Timer size={22} />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Question */}
            {currentQuestion && (
                <div className="question-card">
                    <div className="question-number">
                        <span><Hash size={14} /> Câu {currentIndex + 1} / {questions.length}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={`badge badge-${currentQuestion.difficulty}`}>
                                {{ easy: 'Dễ', medium: 'TB', hard: 'Khó' }[currentQuestion.difficulty]}
                            </span>
                            <button
                                className={`btn btn-ghost btn-sm ${flagged.has(currentQuestion.id) ? 'flagged' : ''}`}
                                onClick={() => toggleFlag(currentQuestion.id)}
                                title={flagged.has(currentQuestion.id) ? 'Bỏ đánh dấu' : 'Đánh dấu xem lại'}
                                style={{ color: flagged.has(currentQuestion.id) ? 'var(--warning)' : 'var(--text-muted)' }}
                            >
                                <Flag size={16} />
                            </button>
                        </div>
                    </div>
                    <p className="question-content">{currentQuestion.content}</p>
                    <div className="answer-options">
                        {currentQuestion.answers.map((answer) => (
                            <div
                                key={answer.id}
                                className={`answer-option ${answers[currentQuestion.id] === answer.id ? 'selected' : ''}`}
                                onClick={() => selectAnswer(currentQuestion.id, answer.id)}
                            >
                                <div className="answer-radio" />
                                <span>{answer.content}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="exam-nav">
                <button className="btn btn-secondary" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
                    <ChevronLeft size={18} /> Trước
                </button>

                {currentIndex === questions.length - 1 ? (
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        <Send size={18} /> Nộp bài
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}>
                        Tiếp <ChevronRight size={18} />
                    </button>
                )}
            </div>

            {/* Question Navigator */}
            <div className="card" style={{ marginTop: 24, padding: 20 }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Danh sách câu hỏi
                </h4>
                <div className="question-nav-grid">
                    {questions.map((q, index) => (
                        <button
                            key={q.id}
                            className={`question-nav-btn ${answers[q.id] ? 'answered' : ''} ${currentIndex === index ? 'current' : ''} ${flagged.has(q.id) ? 'flagged' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                            title={`Câu ${index + 1}${flagged.has(q.id) ? ' (đánh dấu)' : ''}${answers[q.id] ? ' (đã trả lời)' : ''}`}
                        >
                            {index + 1}
                            {flagged.has(q.id) && <Flag size={8} className="flag-icon" />}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--primary)' }} /> Đang xem
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(99,102,241,0.15)', border: '1px solid var(--primary)' }} /> Đã trả lời
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--bg-input)', border: '1px solid var(--border)' }} /> Chưa trả lời
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Flag size={12} style={{ color: 'var(--warning)' }} /> Đánh dấu
                    </span>
                </div>
            </div>

            {timeLeft <= 300 && timeLeft > 0 && (
                <div className="alert alert-error" style={{ marginTop: 16 }}>
                    <AlertTriangle size={18} />
                    <span>
                        {timeLeft <= 60
                            ? `Chỉ còn ${timeLeft} giây! Bài thi sẽ tự động nộp khi hết giờ.`
                            : `Còn ${Math.ceil(timeLeft / 60)} phút. Hãy hoàn thành sớm!`}
                    </span>
                </div>
            )}
        </div>
    );
}
