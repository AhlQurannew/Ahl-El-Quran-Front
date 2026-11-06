'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocale, t } from '@/i18n';
import { cn } from '@/utils/cn';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizes?: number[];
  className?: string;
}

/** Page numbers to show: first, last, the current page and its neighbours, with gaps as null. */
export const pageWindow = (page: number, pageCount: number): (number | null)[] => {
  const wanted = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...wanted].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(null);
    out.push(p);
  });
  return out;
};

/** "Show N per page", the visible range and page buttons. RTL aware (arrows follow the reading direction). */
export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizes = [10, 20, 50], className }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const number = (n: number) => n.toLocaleString(getLocale());
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav aria-label={t('ترقيم الصفحات')} className={cn('flex flex-col items-center justify-between gap-3 sm:flex-row', className)}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <label htmlFor="page-size">{t('عرض')}</label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
        >
          {pageSizes.map((size) => <option key={size} value={size}>{number(size)}</option>)}
        </select>
        <span>{t('في الصفحة')}</span>
        <span className="text-gray-400" aria-live="polite">
          · {t('{from}–{to} من {total}', { from: number(from), to: number(to), total: number(total) })}
        </span>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label={t('الصفحة السابقة')}
            className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight size={16} className="ltr:rotate-180" aria-hidden="true" />
          </button>
          {pageWindow(page, pageCount).map((p, i) => p === null ? (
            <span key={`gap-${i}`} className="px-1 text-gray-400" aria-hidden="true">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              aria-label={t('الصفحة {page}', { page: p })}
              className={cn('min-w-8 rounded-lg px-2 py-1 text-sm font-medium tabular-nums',
                p === page ? 'bg-emerald-600 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50')}
            >
              {number(p)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label={t('الصفحة التالية')}
            className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size={16} className="ltr:rotate-180" aria-hidden="true" />
          </button>
        </div>
      )}
    </nav>
  );
}
