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

        // Supabase mode
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.email);
                setUser(profile);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.email);
                setUser(profile);
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfile(email) {
        const { data } = await supabase.from('users').select('*').eq('email', email).single();
        return data;
    }

    const login = useCallback(async (email, password) => {
        if (isDemo) {
            const result = demoApi.login(email, password);
            if (result.success) {
                setUser(result.user);
                localStorage.setItem('quiz_user', JSON.stringify(result.user));
            }
            return result;
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, message: error.message };
        const profile = await fetchProfile(email);
        if (!profile) return { success: false, message: 'Không tìm thấy tài khoản' };
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
        if (error) return { success: false, message: error.message };
        // Insert profile into users table
        const { data, error: profileError } = await supabase.from('users').insert({
            email: userData.email,
            full_name: userData.full_name,
            role: 'student',
            student_id: userData.student_id,
            department: userData.department,
            class_name: userData.class_name,
            academic_year: userData.academic_year,
            password_hash: '',
        }).select().single();
        if (profileError) return { success: false, message: profileError.message };
        setUser(data);
        return { success: true, user: data };
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
