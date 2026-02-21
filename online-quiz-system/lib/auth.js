'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { demoApi } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for saved session
        const saved = localStorage.getItem('quiz_user');
        if (saved) {
            try {
                setUser(JSON.parse(saved));
            } catch (e) {
                localStorage.removeItem('quiz_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const result = demoApi.login(email, password);
        if (result.success) {
            setUser(result.user);
            localStorage.setItem('quiz_user', JSON.stringify(result.user));
        }
        return result;
    };

    const register = async (userData) => {
        const result = demoApi.register(userData);
        if (result.success) {
            setUser(result.user);
            localStorage.setItem('quiz_user', JSON.stringify(result.user));
        }
        return result;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('quiz_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
