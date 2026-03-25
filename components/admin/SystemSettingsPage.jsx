'use client';

import { useState } from 'react';
import { useSettings } from '@/lib/settings';
import { api } from '@/lib/api';
import { Settings, Save, RefreshCw, Image, Type, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SystemSettingsPage() {
    const { settings, updateSettings } = useSettings();
    const [appName, setAppName] = useState(settings.appName || 'QuizPro');
    const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
    const [saved, setSaved] = useState(false);
    const [resetting, setResetting] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        if (!appName.trim()) return;
        updateSettings({ appName: appName.trim(), logoUrl: logoUrl.trim() });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = async () => {
        if (!confirm('Reset toàn bộ dữ liệu demo về mặc định? Hành động này không thể hoàn tác.')) return;
        setResetting(true);
        await api.resetData();
        setResetting(false);
        window.location.reload();
    };

    const handleResetSettings = () => {
        if (!confirm('Khôi phục tên và logo về mặc định?')) return;
        setAppName('QuizPro');
        setLogoUrl('');
        updateSettings({ appName: 'QuizPro', logoUrl: '' });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Cài đặt hệ thống</h1>
                    <p className="page-subtitle">Tùy chỉnh giao diện và dữ liệu hệ thống</p>
                </div>
            </div>

            <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
                {/* Branding settings */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Settings size={18} /> Thương hiệu
                        </h2>
                    </div>
                    <div className="card-body">
                        {saved && (
                            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <CheckCircle2 size={16} />
                                <span>Đã lưu cài đặt thành công!</span>
                            </div>
                        )}

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Type size={15} /> Tên hệ thống
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={appName}
                                    onChange={(e) => setAppName(e.target.value)}
                                    placeholder="QuizPro"
                                    maxLength={40}
                                    required
                                />
                                <p className="form-helper">Hiển thị trên thanh điều hướng và trang đăng nhập</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Image size={15} /> URL Logo (tùy chọn)
                                </label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                />
                                <p className="form-helper">Để trống để dùng icon mặc định. Nên dùng ảnh vuông (32×32px trở lên).</p>
                            </div>

                            {logoUrl && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Xem trước:</span>
                                    <img
                                        src={logoUrl}
                                        alt="Logo preview"
                                        style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, background: 'var(--primary)', padding: 4 }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{appName}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Save size={16} /> Lưu cài đặt
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleResetSettings}>
                                    Khôi phục mặc định
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Data management */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <RefreshCw size={18} /> Quản lý dữ liệu Demo
                        </h2>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: 'var(--warning-light)', borderRadius: 8, marginBottom: 16 }}>
                            <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Reset sẽ xóa toàn bộ dữ liệu hiện tại (môn học, câu hỏi, đề thi, kết quả) và khôi phục về dữ liệu mẫu ban đầu. Hành động này <strong>không thể hoàn tác</strong>.
                            </p>
                        </div>
                        <button
                            className="btn btn-danger"
                            onClick={handleReset}
                            disabled={resetting}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <RefreshCw size={16} className={resetting ? 'spin' : ''} />
                            {resetting ? 'Đang reset...' : 'Reset dữ liệu về mặc định'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
