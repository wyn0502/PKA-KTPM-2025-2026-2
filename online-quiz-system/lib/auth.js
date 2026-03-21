'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { demoApi } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('quiz_user');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.id && parsed.email) {
                    setUser(parsed);
                } else {
                    localStorage.removeItem('quiz_user');
                }
            }
        } catch {
            localStorage.removeItem('quiz_user');
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        const result = demoApi.login(email, password);
        if (result.success) {
            setUser(result.user);
            localStorage.setItem('quiz_user', JSON.stringify(result.user));
        }
        return result;
    }, []);

    const register = useCallback(async (userData) => {
        const result = demoApi.register(userData);
        if (result.success) {
            setUser(result.user);
            localStorage.setItem('quiz_user', JSON.stringify(result.user));
        }
        return result;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('quiz_user');
    }, []);

    const updateProfile = useCallback((updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('quiz_user', JSON.stringify(updatedUser));
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
