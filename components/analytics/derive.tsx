/** Turns an AnalyticsData payload into chart inputs and table views (shared by dashboard and report). */
import React from 'react';
import { CircleAlert, CircleCheck, CircleMinus, CircleX } from 'lucide-react';
import type { AnalyticsData, AttendanceStatusKey, BreakdownRow } from '@/app/API/analytics';
import { t } from '@/i18n';
import type { ColumnSeries, LinePoint, SegmentPart, TableView } from './charts';
import {
  ACHIEVEMENT_COLORS, ACHIEVEMENT_LABELS, ACHIEVEMENT_ORDER, HEALTH_LABELS, STATUS_COLORS, STATUS_LABELS, STATUS_ORDER,
  formatBucket, formatDay, formatNumber, formatPercent,
} from './theme';
import { entityName } from './insights';

export function attendancePoints(data: AnalyticsData): LinePoint[] {
  return data.series.map((point) => ({
    label: formatBucket(point.bucket, data.period.granularity),
    longLabel: formatBucket(point.bucket, data.period.granularity, true),
    value: point.attendance_rate,
  }));
}

export function pagesColumns(data: AnalyticsData): { labels: string[]; longLabels: string[]; series: ColumnSeries[] } {
  return {
    labels: data.series.map((p) => formatBucket(p.bucket, data.period.granularity)),
    longLabels: data.series.map((p) => formatBucket(p.bucket, data.period.granularity, true)),
    series: ACHIEVEMENT_ORDER.map((kind) => ({
      key: kind,
      label: t(ACHIEVEMENT_LABELS[kind]),
      color: ACHIEVEMENT_COLORS[kind],
      values: data.series.map((p) => p[`pages_${kind}` as const]),
    })),
  };
}

const STATUS_ICONS: Record<AttendanceStatusKey, React.ReactNode> = {
  present: <CircleCheck size={14} />,
  late: <CircleAlert size={14} />,
  excused: <CircleMinus size={14} />,
  absent: <CircleX size={14} />,
};

export function statusParts(breakdown: Record<AttendanceStatusKey, number>): SegmentPart[] {
  return STATUS_ORDER.map((key) => ({
    key,
    label: t(STATUS_LABELS[key]),
    value: breakdown[key] ?? 0,
    color: STATUS_COLORS[key],
    textColor: key === 'late' ? '#0b0b0b' : '#ffffff',
    icon: STATUS_ICONS[key],
  }));
}

export function attendanceTable(data: AnalyticsData): TableView {
  return {
    columns: [t('الفترة'), t('نسبة الحضور'), ...STATUS_ORDER.map((s) => t(STATUS_LABELS[s]))],
    rows: data.series.map((p) => [
      formatBucket(p.bucket, data.period.granularity, true),
      formatPercent(p.attendance_rate),
      ...STATUS_ORDER.map((s) => formatNumber(p[s])),
    ]),
  };
}

export function pagesTable(data: AnalyticsData): TableView {
  return {
    columns: [t('الفترة'), t('مجموع الصفحات'), ...ACHIEVEMENT_ORDER.map((k) => t(ACHIEVEMENT_LABELS[k]))],
    rows: data.series.map((p) => [
      formatBucket(p.bucket, data.period.granularity, true),
      formatNumber(p.pages, 1),
      ...ACHIEVEMENT_ORDER.map((k) => formatNumber(p[`pages_${k}` as const], 1)),
    ]),
  };
}

export function statusTable(breakdown: Record<AttendanceStatusKey, number>): TableView {
  const total = STATUS_ORDER.reduce((sum, s) => sum + (breakdown[s] ?? 0), 0);
  return {
    columns: [t('الحالة'), t('العدد'), t('النسبة المئوية')],
    rows: STATUS_ORDER.map((s) => [t(STATUS_LABELS[s]), formatNumber(breakdown[s]), formatPercent(total ? (breakdown[s] / total) * 100 : null)]),
  };
}

export const BREAKDOWN_TITLES: Record<'school' | 'lecture' | 'student', string> = {
  school: 'المدارس',
  lecture: 'الحلقات',
  student: 'الطلاب',
};

export function breakdownTable(rows: BreakdownRow[], lang: string, level: 'school' | 'lecture' | 'student'): TableView {
  const columns = [t('الاسم'), t('الحالة'), t('نسبة الحضور'), t('الصفحات'), t('الإنجازات')];
  if (level !== 'student') columns.push(t('الطلاب'), t('النشطون'));
  columns.push(t('آخر نشاط'));
  return {
    columns,
    rows: rows.map((r) => {
      const row: (string | number)[] = [entityName(r, lang), t(HEALTH_LABELS[r.health]), formatPercent(r.attendance_rate), formatNumber(r.pages, 1), formatNumber(r.achievements)];
      if (level !== 'student') row.push(formatNumber(r.students), formatNumber(r.active_students));
      row.push(formatDay(r.last_activity));
      return row;
    }),
  };
}

export function periodLabel(data: AnalyticsData): string {
  return `${formatDay(data.period.from, 'long')} — ${formatDay(data.period.to, 'long')}`;
}

export function scopeTitle(data: AnalyticsData, lang: string): string {
  const { scope } = data;
  if (scope.student) return entityName(scope.student, lang);
  if (scope.lecture) return entityName(scope.lecture, lang);
  if (scope.school) return scope.school.name;
  return t('جميع المدارس');
}

export const LEVEL_LABELS: Record<AnalyticsData['level'], string> = {
  platform: 'المنصة',
  school: 'المدرسة',
  lecture: 'الحلقة',
  student: 'الطالب',
};
