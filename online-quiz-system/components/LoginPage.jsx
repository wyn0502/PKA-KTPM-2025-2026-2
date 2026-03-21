'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { GraduationCap, Mail, Lock, User, BookOpen, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) { setError('Vui lòng nhập email'); return; }
        if (!password.trim()) { setError('Vui lòng nhập mật khẩu'); return; }

        if (!isLogin) {
            if (!fullName.trim()) { setError('Vui lòng nhập họ tên'); return; }
            if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
        }

        setLoading(true);
        try {
            if (isLogin) {
                const result = await login(email, password);
                if (!result.success) setError(result.error);
            } else {
                const result = await register({
                    email,
                    password,
                    full_name: fullName,
                    student_id: studentId,
                });
                if (!result.success) setError(result.error);
            }
        } catch {
            setError('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
        setLoading(false);
    };

    const handleDemoLogin = async (demoEmail, demoPassword) => {
        setError('');
        setLoading(true);
        const result = await login(demoEmail, demoPassword);
        if (!result.success) setError(result.error);
        setLoading(false);
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setPassword('');
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <GraduationCap size={28} />
                </div>
                <h1 className="login-title">QuizPro</h1>
                <p className="login-subtitle">
                    {isLogin ? 'Đăng nhập vào hệ thống thi trắc nghiệm' : 'Tạo tài khoản sinh viên mới'}
                </p>

                {error && (
                    <div className="alert alert-error">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Họ và tên <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <div className="input-icon-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        className="form-input form-input-icon"
                                        placeholder="Nguyễn Văn A"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        autoComplete="name"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mã sinh viên</label>
                                <div className="input-icon-wrapper">
                                    <BookOpen size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        className="form-input form-input-icon"
                                        placeholder="SV001"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div className="input-icon-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                className="form-input form-input-icon"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div className="input-icon-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input form-input-icon"
                                style={{ paddingRight: 42 }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                required
                            />
                            <button
                                type="button"
                                className="input-icon-right"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {!isLogin && (
                            <p className="form-helper">Mật khẩu phải có ít nhất 6 ký tự</p>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
                    </button>
                </form>

                <p className="login-footer">
                    {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                    <span className="link" onClick={switchMode}>
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </span>
                </p>

                <div className="login-demo">
                    <p className="login-demo-title">Tài khoản Demo</p>
                    <div className="login-demo-accounts">
                        <button className="login-demo-btn" onClick={() => handleDemoLogin('admin@quiz.com', 'admin123')} disabled={loading}>
                            <ShieldCheck size={18} style={{ color: 'var(--primary-light)' }} />
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>admin@quiz.com</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mật khẩu: admin123</div>
                            </div>
                            <span className="badge badge-primary">Admin</span>
                        </button>
                        <button className="login-demo-btn" onClick={() => handleDemoLogin('student@quiz.com', 'student123')} disabled={loading}>
                            <GraduationCap size={18} style={{ color: 'var(--success)' }} />
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>student@quiz.com</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mật khẩu: student123</div>
                            </div>
                            <span className="badge badge-success">Student</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
