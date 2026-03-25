'use client';

import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { SettingsProvider } from '@/lib/settings';
import AppRouter from '@/components/AppRouter';

export default function Home() {
    return (
        <SettingsProvider>
            <AuthProvider>
                <ToastProvider>
                    <AppRouter />
                </ToastProvider>
            </AuthProvider>
        </SettingsProvider>
    );
}
