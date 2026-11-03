'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { changeLanguage, LANGUAGES, Lang, t } from '@/i18n';
import { useLang } from '@/i18n/I18nProvider';
import { cn } from '@/utils/cn';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { lang } = useLang();

  return (
    <label
      className={cn(
        'flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 hover:border-gray-300',
        className
      )}
    >
      <Languages size={16} aria-hidden="true" />
      <span className="sr-only">{t('اللغة')}</span>
      <select
        value={lang}
        onChange={(event) => changeLanguage(event.target.value as Lang)}
        className="cursor-pointer bg-transparent font-medium outline-none"
        aria-label={t('اللغة')}
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
};
