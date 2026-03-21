'use client';

import { useAuth } from '@/lib/auth';
import LoginPage from './LoginPage';
import AdminDashboard from './admin/AdminDashboard';
import StudentDashboard from './student/StudentDashboard';

export default function AppRouter() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: '0.9rem' }}>Đang tải...</p>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    if (user.role === 'admin') {
        return <AdminDashboard />;
    }

    return <StudentDashboard />;
}
