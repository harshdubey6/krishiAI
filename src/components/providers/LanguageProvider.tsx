'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppLanguage = 'en' | 'hi' | 'mr';

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (english: string, hindi: string, marathi?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'krishiai_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>('en');

  useEffect(() => {
    const storedLanguage = typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) as AppLanguage | null)
      : null;

    if (storedLanguage === 'en' || storedLanguage === 'hi' || storedLanguage === 'mr') {
      setLanguage(storedLanguage);
      return;
    }

    const browserLanguage = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en';
    if (browserLanguage.startsWith('mr')) {
      setLanguage('mr');
      return;
    }
    setLanguage(browserLanguage.startsWith('hi') ? 'hi' : 'en');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, language);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage((prev) => (prev === 'en' ? 'hi' : prev === 'hi' ? 'mr' : 'en')),
    t: (english, hindi, marathi) => {
      if (language === 'hi') return hindi;
      if (language === 'mr') return marathi ?? hindi;
      return english;
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}
