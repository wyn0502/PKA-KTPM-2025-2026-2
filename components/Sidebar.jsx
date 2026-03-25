'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import {
    LayoutDashboard, BookOpen, FileQuestion, ClipboardList,
    Users, LogOut, Menu, X, GraduationCap, BarChart3,
    FileText, History, Settings, RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';

export default function Sidebar({ activePage, setActivePage, role }) {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const adminLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'subjects', label: 'Môn học', icon: BookOpen },
        { id: 'students', label: 'Quản lý sinh viên', icon: GraduationCap },
        { id: 'questions', label: 'Ngân hàng câu hỏi', icon: FileQuestion },
        { id: 'exams', label: 'Quản lý đề thi', icon: ClipboardList },
        { id: 'groups', label: 'Nhóm thi', icon: Users },
        { id: 'results', label: 'Kết quả thi', icon: BarChart3 },
    ];

    const studentLinks = [
        { id: 'exams', label: 'Bài thi của tôi', icon: FileText },
        { id: 'results', label: 'Lịch sử & Kết quả', icon: History },
    ];

    const links = role === 'admin' ? adminLinks : studentLinks;

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').slice(-2).toUpperCase();
    };

    const handleNavClick = (pageId) => {
        setActivePage(pageId);
        setMobileOpen(false);
    };

    const handleResetData = async () => {
        if (confirm('Reset toàn bộ dữ liệu demo về mặc định? Hành động này không thể hoàn tác.')) {
            await api.resetData();
            window.location.reload();
        }
    };

    return (
        <>
            <div className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="sidebar-logo" style={{ width: 34, height: 34, fontSize: '0.9rem' }}>
                        <GraduationCap size={18} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>QuizPro</span>
                </div>
                <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {mobileOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            )}

            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <GraduationCap size={22} />
                    </div>
                    <div>
                        <div className="sidebar-title">QuizPro</div>
                        <div className="sidebar-subtitle">
                            {role === 'admin' ? 'Quản trị hệ thống' : 'Sinh viên'}
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <span className="sidebar-section-label">
                        {role === 'admin' ? 'Quản lý' : 'Menu'}
                    </span>
                    {links.map(link => (
                        <button
                            key={link.id}
                            className={`sidebar-link ${activePage === link.id ? 'active' : ''}`}
                            onClick={() => handleNavClick(link.id)}
                        >
                            <link.icon size={20} />
                            <span>{link.label}</span>
                        </button>
                    ))}

                    {role === 'admin' && (
                        <>
                            <span className="sidebar-section-label" style={{ marginTop: 16 }}>Hệ thống</span>
                            <button className="sidebar-link" onClick={handleResetData}>
                                <RefreshCw size={20} />
                                <span>Reset dữ liệu demo</span>
                            </button>
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">
                            {getInitials(user?.full_name)}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.full_name}</div>
                            <div className="sidebar-user-role">{user?.role === 'admin' ? 'Giảng viên' : 'Sinh viên'}</div>
                        </div>
                        <button className="btn btn-ghost" onClick={logout} title="Đăng xuất">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
