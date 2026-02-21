'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { GraduationCap, Mail, Lock, User, BookOpen, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const result = await login(email, password);
                if (!result.success) setError(result.error);
            } else {
                if (!fullName.trim()) { setError('Vui lòng nhập họ tên'); setLoading(false); return; }
                const result = await register({ email, full_name: fullName, student_id: studentId });
                if (!result.success) setError(result.error);
            }
        } catch (err) {
            setError('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
        setLoading(false);
    };

    const handleDemoLogin = (demoEmail) => {
        setEmail(demoEmail);
        setPassword('demo');
        login(demoEmail, 'demo');
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <GraduationCap size={28} />
                </div>
                <h1 className="login-title">QuizPro</h1>
                <p className="login-subtitle">
                    {isLogin ? 'Đăng nhập vào hệ thống thi trắc nghiệm' : 'Tạo tài khoản mới'}
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
                                <label className="form-label">Họ và tên</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ paddingLeft: 42 }}
                                        placeholder="Nguyễn Văn A"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mã sinh viên</label>
                                <div style={{ position: 'relative' }}>
                                    <BookOpen size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ paddingLeft: 42 }}
                                        placeholder="SV001"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                className="form-input"
                                style={{ paddingLeft: 42 }}
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                className="form-input"
                                style={{ paddingLeft: 42 }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
                    </button>
                </form>

                <p className="login-footer">
                    {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                    <span className="link" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </span>
                </p>

                <div className="login-demo">
                    <p className="login-demo-title">Tài khoản Demo</p>
                    <div className="login-demo-accounts">
                        <button className="login-demo-btn" onClick={() => handleDemoLogin('admin@quiz.com')}>
                            <ShieldCheck size={18} style={{ color: 'var(--primary-light)' }} />
                            <span>admin@quiz.com</span>
                            <span className="demo-role badge badge-primary">Admin</span>
                        </button>
                        <button className="login-demo-btn" onClick={() => handleDemoLogin('student@quiz.com')}>
                            <GraduationCap size={18} style={{ color: 'var(--success)' }} />
                            <span>student@quiz.com</span>
                            <span className="demo-role badge badge-success">Student</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
