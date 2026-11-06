'use client';

import { CalendarClock, CheckCircle2, CircleDashed, PencilLine } from 'lucide-react';
import type { Exam, ExamAttendance, ExamType } from '@/app/API/exams';
import { getLocale, t } from '@/i18n';
import { cn } from '@/utils/cn';

/** Arabic source labels (translated at render). */
export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  monthly: 'شهري',
  term: 'فصلي',
  final: 'نهائي',
  tajwid: 'تجويد',
  other: 'آخر',
};

export const ATTENDANCE_LABELS: Record<ExamAttendance, string> = {
  present: 'حاضر',
  absent: 'غائب',
  excused: 'معذور',
};

export const EXAM_MANAGER_ROLES = ['PRESIDENT', 'CHIEF_SUPERVISOR', 'SUPERVISOR', 'ADMIN', 'TEACHER'];

export const formatMark = (value: number | null | undefined, digits = 2) =>
  value == null ? '—' : new Intl.NumberFormat(getLocale(), { maximumFractionDigits: digits }).format(value);

export const formatPct = (value: number | null | undefined) =>
  value == null ? '—' : `${new Intl.NumberFormat(getLocale(), { maximumFractionDigits: 1 }).format(value)}%`;

export const formatExamDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(y, m - 1, d));
};

export const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export type ExamPhase = 'upcoming' | 'pending' | 'done';

export const examPhase = (exam: Exam): ExamPhase => {
  if (exam.exam_date > todayIso()) return 'upcoming';
  if (exam.stats.total === 0 || exam.stats.pending > 0) return 'pending';
  return 'done';
};

/** Status chip: icon + label, never color alone. */
export function ExamPhaseBadge({ exam, className }: { exam: Exam; className?: string }) {
  const phase = examPhase(exam);
  const config = {
    upcoming: { icon: CalendarClock, label: 'قادم', cls: 'bg-sky-50 text-sky-800 ring-sky-200' },
    pending: { icon: PencilLine, label: 'بانتظار النقاط', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
    done: { icon: CheckCircle2, label: 'مكتمل', cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  }[phase];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset', config.cls, className)}>
      <Icon size={12} aria-hidden="true" />
      {t(config.label)}
    </span>
  );
}

export function ExamTypeBadge({ type }: { type: ExamType | null }) {
  if (!type) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
      <CircleDashed size={11} aria-hidden="true" />
      {t(EXAM_TYPE_LABELS[type])}
    </span>
  );
}

/** Thin horizontal meter for a 0-100 value, with the value printed beside it. */
export function PctBar({ value, label }: { value: number | null; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100" role="img" aria-label={label ? `${label}: ${formatPct(value)}` : formatPct(value)}>
        {value != null && <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />}
      </div>
      <span className="w-12 shrink-0 text-end text-xs font-semibold tabular-nums text-gray-800">{formatPct(value)}</span>
    </div>
  );
}

/** Rank pill: medal tint for the podium, plain for the rest. */
export function RankPill({ rank }: { rank: number | null }) {
  if (rank == null) return <span className="text-gray-400">—</span>;
  const tint = rank === 1 ? 'bg-amber-100 text-amber-900 ring-amber-300'
    : rank === 2 ? 'bg-slate-100 text-slate-800 ring-slate-300'
      : rank === 3 ? 'bg-orange-100 text-orange-900 ring-orange-300'
        : 'bg-white text-gray-700 ring-gray-200';
  return (
    <span className={cn('inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums ring-1 ring-inset', tint)}>
      {rank}
    </span>
  );
}
