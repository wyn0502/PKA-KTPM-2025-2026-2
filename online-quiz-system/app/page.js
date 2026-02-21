'use client';

import { AuthProvider } from '@/lib/auth';
import AppRouter from '@/components/AppRouter';

export default function Home() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
