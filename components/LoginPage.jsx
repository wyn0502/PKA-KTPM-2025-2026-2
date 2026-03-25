'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSettings } from '@/lib/settings';
import { useToast } from '@/lib/toast';
import { GraduationCap, Mail, Lock, User, BookOpen, Eye, EyeOff, CheckCircle2, AtSign } from 'lucide-react';

export default function LoginPage() {
    const { login, register } = useAuth();
    const { settings } = useSettings();
    const toast = useToast();
    const [isLogin, setIsLogin] = useState(true);
    const [emailOrId, setEmailOrId] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!emailOrId.trim()) { setError('Vui lòng nhập email hoặc mã sinh viên'); return; }
        if (!password.trim()) { setError('Vui lòng nhập mật khẩu'); return; }

        if (!isLogin) {
            if (!fullName.trim()) { setError('Vui lòng nhập họ tên'); return; }
            if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
        }

        setLoading(true);
        try {
            if (isLogin) {
                const result = await login(emailOrId, password);
                if (!result.success) {
                    const msg = result.message || 'Đăng nhập thất bại';
                    setError(msg);
                    toast.error(msg);
                }
            } else {
                const result = await register({
                    email: emailOrId,
                    password,
                    full_name: fullName,
                    student_id: studentId,
                });
                if (!result.success) {
                    const msg = result.message || 'Đăng ký thất bại';
                    setError(msg);
                    toast.error(msg);
                } else {
                    setSuccessMsg(result.message);
                    toast.success(result.message);
                }
            }
        } catch {
            const msg = 'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError(msg);
            toast.error(msg);
        }
        setLoading(false);
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccessMsg('');
        setPassword('');
        setEmailOrId('');
    };

    const appName = settings?.appName || 'QuizPro';
    const logoUrl = settings?.logoUrl || '';

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    {logoUrl
                        ? <img src={logoUrl} alt={appName} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }} />
                        : <GraduationCap size={28} />
                    }
                </div>
                <h1 className="login-title">{appName}</h1>
                <p className="login-subtitle">
                    {isLogin ? 'Đăng nhập vào hệ thống thi trắc nghiệm' : 'Tạo tài khoản sinh viên mới'}
                </p>

                {error && (
                    <div className="alert alert-error">
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="alert alert-success" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{successMsg}</span>
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
                        <label className="form-label">
                            {isLogin ? 'Email hoặc Mã sinh viên' : 'Email'}
                            <span style={{ color: 'var(--danger)' }}> *</span>
                        </label>
                        <div className="input-icon-wrapper">
                            <AtSign size={18} className="input-icon" />
                            <input
                                type="text"
                                className="form-input form-input-icon"
                                placeholder={isLogin ? 'email@example.com hoặc SV001' : 'email@example.com'}
                                value={emailOrId}
                                onChange={(e) => setEmailOrId(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>
                        {isLogin && (
                            <p className="form-helper">Có thể đăng nhập bằng địa chỉ email hoặc mã sinh viên</p>
                        )}
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
            </div>
        </div>
    );
}
