import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  getLanguageDefinition,
  LANGUAGE_STORAGE_KEY,
  WORLD_LANGUAGES,
  type LanguageDefinition,
} from '@/i18n/languages';
import { translateMessage, type MessageKey } from '@/i18n/messages';
import { clearTranslateArtifacts } from '@/lib/clearTranslateArtifacts';

type LanguageContextType = {
  language: string;
  languages: LanguageDefinition[];
  direction: 'rtl' | 'ltr';
  setLanguage: (code: string) => void;
  t: (key: MessageKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function readStoredLanguage(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && WORLD_LANGUAGES.some((language) => language.code === stored)) {
    return stored;
  }

  return DEFAULT_LANGUAGE;
}

function applyDocumentLanguage(code: string) {
  const definition = getLanguageDefinition(code);
  document.documentElement.lang = code.split('-')[0];
  document.documentElement.dir = definition.dir;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  const direction = useMemo(() => getLanguageDefinition(language).dir, [language]);

  useEffect(() => {
    clearTranslateArtifacts();
    applyDocumentLanguage(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((code: string) => {
    if (!WORLD_LANGUAGES.some((entry) => entry.code === code)) {
      return;
    }
    setLanguageState(code);
  }, []);

  const t = useCallback((key: MessageKey) => translateMessage(language, key), [language]);

  const value = useMemo(
    () => ({
      language,
      languages: WORLD_LANGUAGES,
      direction,
      setLanguage,
      t,
    }),
    [direction, language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
