/**
 * Chart color roles and formatters for the admin BI dashboard.
 *
 * Colors come from the validated reference palette (dataviz skill):
 * - achievement types = categorical slots 1-3 (validated; aqua is < 3:1 so charts carry
 *   visible labels / a table view),
 * - attendance statuses = the reserved status palette, always paired with an icon + label,
 * - single-series magnitude = slot 1 blue.
 * The app is light-only, so only light steps are defined.
 */
import type { AchievementTypeKey, AttendanceStatusKey, Granularity, Health } from '@/app/API/analytics';
import { getLocale, t } from '@/i18n';

export const INK = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  surface: '#fcfcfb',
  successText: '#006300',
  criticalText: '#b42318',
};

export const SERIES_1 = '#2a78d6';

export const ACHIEVEMENT_COLORS: Record<AchievementTypeKey, string> = {
  normal: '#2a78d6',
  small: '#eb6834',
  big: '#1baf7a',
};

export const STATUS_COLORS: Record<AttendanceStatusKey, string> = {
  present: '#0ca30c',
  late: '#fab219',
  excused: '#898781',
  absent: '#d03b3b',
};

export const HEALTH_COLORS: Record<Health, string> = {
  good: '#0ca30c',
  warning: '#fab219',
  critical: '#d03b3b',
  insufficient: '#c3c2b7',
};

// Arabic source labels, translated where rendered.
export const ACHIEVEMENT_LABELS: Record<AchievementTypeKey, string> = {
  normal: 'حفظ جديد',
  small: 'مراجعة صغرى',
  big: 'مراجعة كبرى',
};

export const STATUS_LABELS: Record<AttendanceStatusKey, string> = {
  present: 'حاضر',
  late: 'متأخر',
  excused: 'غائب بعذر',
  absent: 'غائب',
};

export const HEALTH_LABELS: Record<Health, string> = {
  good: 'جيد',
  warning: 'يحتاج متابعة',
  critical: 'حرج',
  insufficient: 'بيانات غير كافية',
};

export const STATUS_ORDER: AttendanceStatusKey[] = ['present', 'late', 'excused', 'absent'];
export const ACHIEVEMENT_ORDER: AchievementTypeKey[] = ['normal', 'small', 'big'];

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(getLocale(), { maximumFractionDigits: digits }).format(value);
}

/** Auto-compact for stat tiles and axes: 1,284 / 12.9K. */
export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  if (Math.abs(value) < 10000) return formatNumber(value, Math.abs(value) < 10 && value % 1 ? 1 : 0);
  return new Intl.NumberFormat(getLocale(), { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) return '—';
  return `${formatNumber(value, digits)}%`;
}

function parseDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDay(iso: string | null | undefined, style: 'short' | 'long' = 'short'): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(getLocale(), style === 'long'
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'short' }).format(parseDay(iso));
}

/** Axis / tooltip label for a time bucket at the given granularity. */
export function formatBucket(iso: string, granularity: Granularity, long = false): string {
  const date = parseDay(iso);
  if (granularity === 'month') {
    return new Intl.DateTimeFormat(getLocale(), { month: long ? 'long' : 'short', year: long ? 'numeric' : '2-digit' }).format(date);
  }
  const label = new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short', ...(long ? { year: 'numeric' } : {}) }).format(date);
  return granularity === 'week' && long ? t('أسبوع {date}', { date: label }) : label;
}

/** Signed delta between two values, with whether "up" is good for this measure. */
export function delta(current: number | null, previous: number | null, kind: 'points' | 'percent') {
  if (current === null || previous === null) return null;
  if (kind === 'points') return { value: current - previous, label: `${current - previous >= 0 ? '+' : '−'}${formatNumber(Math.abs(current - previous), 1)} ${t('نقطة')}` };
  if (previous === 0) return current === 0 ? { value: 0, label: '0%' } : null;
  const change = ((current - previous) / previous) * 100;
  return { value: change, label: `${change >= 0 ? '+' : '−'}${formatNumber(Math.abs(change), 0)}%` };
}
