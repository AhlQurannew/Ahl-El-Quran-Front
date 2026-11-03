'use client';

import React, { createContext, useContext } from 'react';
import { getDir, Lang, setCurrentLang } from '@/i18n';

const LangContext = createContext<Lang>('ar');

interface I18nProviderProps {
  lang: Lang;
  children: React.ReactNode;
}

export function I18nProvider({ lang, children }: I18nProviderProps) {
  // Set synchronously so every t() call below this point (including SSR) uses `lang`.
  setCurrentLang(lang);
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Current language and text direction, for components that lay out by direction. */
export function useLang(): { lang: Lang; dir: 'rtl' | 'ltr' } {
  const lang = useContext(LangContext);
  return { lang, dir: getDir(lang) };
}
