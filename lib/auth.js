'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, demoApi } from './supabase';

const AuthContext = createContext(null);
const isDemo = !supabase;

// Read cached user from localStorage synchronously (client-side only)
const CACHE_KEY = isDemo ? 'quiz_user' : '_qp';
function readCache() {
    try {
        const s = localStorage.getItem(CACHE_KEY);
        if (!s) return null;
        const p = JSON.parse(s);
        return (p?.id && p?.email) ? p : null;
    } catch { return null; }
}
function writeCache(p) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(p)); } catch {} }
function clearCache() { try { localStorage.removeItem(CACHE_KEY); } catch {} }

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // On first client render, immediately show cached user (no spinner)
    useEffect(() => {
        const cached = readCache();
        if (cached) setUser(cached);

        if (isDemo) return; // Demo: cache is the source of truth, no async check needed

        // Supabase: verify / refresh session in background
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                fetchProfile(session.user.email)
                    .then(p => {
                        if (p) { setUser(p); writeCache(p); }
                    })
                    .catch(() => {});
            } else if (event === 'SIGNED_OUT') {
                clearCache();
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
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
                writeCache(result.user);
            }
            return result;
        }

        try {
            const input = emailOrStudentId.trim();
            let loginEmail = input;

            if (!input.includes('@')) {
                const { data: found } = await supabase
                    .from('users').select('email').eq('student_id', input).maybeSingle();
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
            const profile = await fetchProfile(loginEmail).catch(() => null);
            if (!profile) return { success: false, message: 'Tài khoản không tồn tại trong hệ thống. Liên hệ admin để được hỗ trợ.' };
            writeCache(profile);
            setUser(profile);
            return { success: true, user: profile };
        } catch {
            return { success: false, message: 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.' };
        }
    }, []);

    const register = useCallback(async (userData) => {
        if (isDemo) {
            const result = demoApi.register(userData);
            if (result.success) { setUser(result.user); writeCache(result.user); }
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
        await supabase.from('users').insert({
            email: userData.email, full_name: userData.full_name, role: 'student',
            student_id: userData.student_id || null, department: userData.department || null,
            class_name: userData.class_name || null, academic_year: userData.academic_year || null,
            password_hash: '',
        });
        return { success: true, message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.' };
    }, []);

    const logout = useCallback(async () => {
        clearCache();
        setUser(null);
        if (!isDemo) await supabase.auth.signOut();
    }, []);

    const updateProfile = useCallback((updatedUser) => {
        setUser(updatedUser);
        writeCache(updatedUser);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading: false, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
