'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { t } from '@/i18n';

export interface SearchableOption {
  value: string | number;
  label: string;
  /** Extra text matched by the search (e.g. the Arabic name when the label is translated). */
  keywords?: string;
}

interface Props {
  options: SearchableOption[];
  value: string | number | null | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Accessible name when there is no visible <label htmlFor>. */
  ariaLabel?: string;
  invalid?: boolean;
  /** 'md' matches the form inputs, 'sm' the toolbar filters. */
  size?: 'sm' | 'md';
  className?: string;
}

/** Lower-case, drop Arabic diacritics/tatweel and unify common letter variants, so «احمد» finds «أحمد». */
export const normalizeSearch = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u0640\u0300-\u036f]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0649/g, '\u064A')
    .replace(/\s+/g, ' ')
    .trim();

/** A select with a search box: same look as the form selects, keyboard and screen-reader friendly. */
export function SearchableSelect({
  options, value, onValueChange, placeholder, disabled, id, ariaLabel, invalid, size = 'md', className,
}: Props) {
  const autoId = useId();
  const buttonId = id ?? `ss-${autoId}`;
  const listId = `${buttonId}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => String(o.value) === String(value ?? ''));
  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return options;
    return options.filter((o) => normalizeSearch(`${t(o.label)} ${o.label} ${o.keywords ?? ''}`).includes(q)
      || normalizeSearch(String(o.value)) === q);
  }, [options, query]);

  const close = (focusButton = false) => {
    setOpen(false);
    setQuery('');
    if (focusButton) document.getElementById(buttonId)?.focus();
  };

  const openList = () => {
    if (disabled) return;
    const index = options.findIndex((o) => String(o.value) === String(value ?? ''));
    setActive(Math.max(0, index));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the highlighted option visible while moving with the keyboard.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const choose = (option: SearchableOption) => {
    onValueChange(String(option.value));
    close(true);
  };

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'Tab') {
      close();
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn('relative', className)}
      // Keyboard users tabbing away (or focus moved by code) close the list too.
      onBlur={(e) => { if (open && !rootRef.current?.contains(e.relatedTarget as Node | null)) close(); }}
    >
      <button
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key) && !open) {
            e.preventDefault();
            openList();
          }
        }}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border bg-white/80 text-start text-gray-900 transition-all duration-200',
          'focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
          size === 'sm' ? 'px-3 py-2.5 text-sm' : 'px-4 py-2.5 text-sm',
          invalid
            ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-400/30'
            : 'border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:ring-emerald-400/30',
        )}
      >
        <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-gray-400')}>
          {selected ? t(selected.label) : (placeholder ?? t('اختر...'))}
        </span>
        <ChevronDown size={16} className={cn('shrink-0 text-gray-400 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute inset-x-0 z-50 mt-1 min-w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="relative border-b border-gray-100 p-2">
            <Search size={15} className="pointer-events-none absolute inset-y-0 start-4 my-auto text-gray-400" aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onSearchKey}
              placeholder={t('ابحث بالاسم...')}
              aria-label={t('ابحث بالاسم...')}
              aria-controls={listId}
              aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
              className="w-full rounded-lg border border-gray-200 py-2 pe-2 ps-8 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" aria-labelledby={buttonId} className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-center text-sm text-gray-500">{t('لا توجد نتائج مطابقة')}</li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = String(option.value) === String(value ?? '');
                return (
                  <li
                    key={`${option.value}`}
                    id={`${listId}-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(option)}
                    onMouseEnter={() => setActive(index)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm',
                      index === active ? 'bg-emerald-50 text-emerald-900' : 'text-gray-800',
                      isSelected && 'font-semibold',
                    )}
                  >
                    <span className="min-w-0 truncate">{t(option.label)}</span>
                    {isSelected && <Check size={15} className="shrink-0 text-emerald-600" aria-hidden="true" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
