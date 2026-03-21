'use client';

import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import AppRouter from '@/components/AppRouter';

export default function Home() {
    return (
        <AuthProvider>
            <ToastProvider>
                <AppRouter />
            </ToastProvider>
        </AuthProvider>
    );
}
