/**
 * Lightweight i18n for Arabic (source language), English and French.
 *
 * - The Arabic UI text IS the translation key: `t('تسجيل الدخول')`. When a key
 *   has no translation the Arabic text is shown, so nothing ever renders blank.
 * - Placeholders use `{name}`: `t('تم حذف {count} طالب', { count })`.
 * - The language lives in the `lang` cookie so the server renders the right
 *   `<html lang dir>` (see app/layout.tsx). Switching reloads the page.
 * - `t()` is a plain function (usable in event handlers and utils), but do NOT
 *   call it at module scope: module constants are evaluated once and would not
 *   follow the user's language. Keep Arabic in constants and call `t(value)`
 *   where the value is rendered.
 */
import en from './locales/en';
import fr from './locales/fr';

export type Lang = 'ar' | 'en' | 'fr';

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
];

export const DEFAULT_LANG: Lang = 'ar';
export const LANG_COOKIE = 'lang';

const dictionaries: Record<Exclude<Lang, 'ar'>, Record<string, string>> = { en, fr };

const LOCALES: Record<Lang, string> = { ar: 'ar-DZ', en: 'en-GB', fr: 'fr-FR' };

export function normalizeLang(value: string | null | undefined): Lang {
  return value === 'en' || value === 'fr' || value === 'ar' ? value : DEFAULT_LANG;
}

// On the client the server-rendered <html lang> is the source of truth.
let currentLang: Lang =
  typeof document !== 'undefined' ? normalizeLang(document.documentElement.lang) : DEFAULT_LANG;

/** Called by I18nProvider during render so SSR output uses the request's language. */
export function setCurrentLang(lang: Lang): void {
  currentLang = lang;
}

export function getLang(): Lang {
  return currentLang;
}

export function getDir(lang: Lang = currentLang): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/** BCP-47 locale for Intl / toLocale*String formatting. */
export function getLocale(lang: Lang = currentLang): string {
  return LOCALES[lang];
}

function interpolate(text: string, vars?: Record<string, string | number | null | undefined>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined || value === null ? match : String(value);
  });
}

export function t(text: string, vars?: Record<string, string | number | null | undefined>): string {
  if (typeof text !== 'string' || !text) return text;
  const translated = currentLang === 'ar' ? text : dictionaries[currentLang][text.trim()];
  return interpolate(translated ?? text, vars);
}

export function changeLanguage(lang: Lang): void {
  if (typeof document === 'undefined' || lang === currentLang) return;
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  window.location.reload();
}
