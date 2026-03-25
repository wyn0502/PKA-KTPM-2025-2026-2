'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'quizpro_system_settings';

const defaultSettings = {
    appName: 'QuizPro',
    logoUrl: '',
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (saved) setSettings({ ...defaultSettings, ...JSON.parse(saved) });
        } catch {}
    }, []);

    const updateSettings = useCallback((updates) => {
        setSettings(prev => {
            const next = { ...prev, ...updates };
            try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
            return next;
        });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
}
