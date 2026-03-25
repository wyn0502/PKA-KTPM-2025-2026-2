'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, demoApi } from './supabase';

const AuthContext = createContext(null);
const isDemo = !supabase;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isDemo) {
            try {
                const saved = localStorage.getItem('quiz_user');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed?.id && parsed?.email) setUser(parsed);
                    else localStorage.removeItem('quiz_user');
                }
            } catch { localStorage.removeItem('quiz_user'); }
            setLoading(false);
            return;
        }

        // Supabase mode — use onAuthStateChange as primary (handles F5 refresh via INITIAL_SESSION)
        let settled = false;
        const settle = () => { if (!settled) { settled = true; setLoading(false); } };

        // Safety fallback: never stay stuck longer than 6 seconds
        const timeout = setTimeout(settle, 6000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.email).catch(() => null);
                setUser(profile || null);
            } else {
                setUser(null);
            }
            settle();
        });

        return () => { subscription.unsubscribe(); clearTimeout(timeout); };
    }, []);

    async function fetchProfile(email) {
        const { data } = await supabase.from('users').select('*').eq('email', email).single();
        return data;
    }

    const login = useCallback(async (emailOrStudentId, password) => {
        if (isDemo) {
            const result = demoApi.login(emailOrStudentId, password);
            if (result.success) {
                setUser(result.user);
                localStorage.setItem('quiz_user', JSON.stringify(result.user));
            }
            return result;
        }

        const input = emailOrStudentId.trim();
        let loginEmail = input;

        // If input is not an email, look up student_id in users table
        if (!input.includes('@')) {
            const { data: found } = await supabase
                .from('users')
                .select('email')
                .eq('student_id', input)
                .single();
            if (!found) return { success: false, message: 'Không tìm thấy tài khoản với mã sinh viên này.' };
            loginEmail = found.email;
        }

        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) {
            let msg = error.message;
            if (msg.includes('Email not confirmed'))
                msg = 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư và nhấn link xác nhận trước khi đăng nhập.';
            else if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials'))
                msg = 'Thông tin đăng nhập hoặc mật khẩu không đúng.';
            else if (msg.includes('Too many requests'))
                msg = 'Quá nhiều lần thử. Vui lòng chờ một lúc rồi thử lại.';
            return { success: false, message: msg };
        }
        const profile = await fetchProfile(loginEmail);
        if (!profile) return { success: false, message: 'Tài khoản không tồn tại trong hệ thống. Liên hệ admin để được hỗ trợ.' };
        setUser(profile);
        return { success: true, user: profile };
    }, []);

    const register = useCallback(async (userData) => {
        if (isDemo) {
            const result = demoApi.register(userData);
            if (result.success) {
                setUser(result.user);
                localStorage.setItem('quiz_user', JSON.stringify(result.user));
            }
            return result;
        }
        const { error } = await supabase.auth.signUp({ email: userData.email, password: userData.password });
        if (error) {
            let msg = error.message;
            if (msg.includes('User already registered') || msg.includes('already been registered'))
                msg = 'Email này đã được đăng ký. Vui lòng đăng nhập.';
            else if (msg.includes('Password should be'))
                msg = 'Mật khẩu phải có ít nhất 6 ký tự.';
            return { success: false, message: msg };
        }
        // Insert profile (may fail if RLS requires confirmed email — non-blocking)
        await supabase.from('users').insert({
            email: userData.email,
            full_name: userData.full_name,
            role: 'student',
            student_id: userData.student_id || null,
            department: userData.department || null,
            class_name: userData.class_name || null,
            academic_year: userData.academic_year || null,
            password_hash: '',
        }).select().single();
        return { success: true, needsConfirmation: true, message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.' };
    }, []);

    const logout = useCallback(async () => {
        setUser(null);
        if (isDemo) {
            localStorage.removeItem('quiz_user');
            return;
        }
        await supabase.auth.signOut();
    }, []);

    const updateProfile = useCallback((updatedUser) => {
        setUser(updatedUser);
        if (isDemo) localStorage.setItem('quiz_user', JSON.stringify(updatedUser));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
