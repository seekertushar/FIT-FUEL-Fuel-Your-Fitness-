import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Language } from '../types/fitfuel';
import { getNextLanguage, localizeDayShort, localizeEnum, translate } from '../utils/i18n';

const LANGUAGE_STORAGE_KEY = 'fitfuel_language_v1';

function readInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'hi' || stored === 'en') return stored;
    const savedUserRaw = window.localStorage.getItem('fitfuel_user_v1');
    if (savedUserRaw) {
      const parsed = JSON.parse(savedUserRaw);
      if (parsed?.language === 'hi' || parsed?.language === 'en') {
        return parsed.language;
      }
    }
  } catch {
    // fallback to English
  }
  return 'en';
}

export interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tx: (en: string, hi: string) => string;
  localize: (value: string) => string;
  dayShort: (day: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore storage quota errors
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => getNextLanguage(prev));
  }, []);

  const tFn = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(language, key, params),
    [language]
  );

  const txFn = useCallback(
    (en: string, hi: string) => (language === 'hi' ? hi : en),
    [language]
  );

  const localizeFn = useCallback(
    (value: string) => localizeEnum(language, value),
    [language]
  );

  const dayShortFn = useCallback(
    (day: string) => localizeDayShort(language, day),
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: tFn,
      tx: txFn,
      localize: localizeFn,
      dayShort: dayShortFn,
    }),
    [language, setLanguage, toggleLanguage, tFn, txFn, localizeFn, dayShortFn]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return ctx;
}
