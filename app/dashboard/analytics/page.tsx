'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpDown, ChevronLeft, FileDown, Loader2, RefreshCw,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import analyticsAPI, { AnalyticsData, AnalyticsQuery, BreakdownRow, Granularity } from '@/app/API/analytics';
import {
  ChartCard, DataTable, HealthBadge, LineChart, RankedBars, SegmentedBar, StackedColumns, StatTile,
} from '@/components/analytics/charts';
import {
  BREAKDOWN_TITLES, LEVEL_LABELS, attendancePoints, attendanceTable, breakdownTable, pagesColumns, pagesTable,
  periodLabel, statusParts, statusTable,
} from '@/components/analytics/derive';
import { buildInsights, entityName, Insight } from '@/components/analytics/insights';
import { InsightList } from '@/components/analytics/InsightList';
import { TopStudents } from '@/components/analytics/TopStudents';
import {
  ACHIEVEMENT_LABELS, STATUS_LABELS, delta, formatCompact, formatDay, formatNumber, formatPercent,
} from '@/components/analytics/theme';
import { useLang } from '@/i18n/I18nProvider';
import { t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';
import { cn } from '@/utils/cn';

const PRESETS: { key: string; label: string; days?: number }[] = [
  { key: '7', label: '7 أيام', days: 7 },
  { key: '30', label: '30 يوماً', days: 30 },
  { key: '90', label: '90 يوماً', days: 90 },
  { key: '365', label: '12 شهراً', days: 365 },
  { key: 'ytd', label: 'منذ بداية السنة' },
];

const GRANULARITIES: { key: Granularity | ''; label: string }[] = [
  { key: '', label: 'تلقائي' },
  { key: 'day', label: 'يومي' },
  { key: 'week', label: 'أسبوعي' },
  { key: 'month', label: 'شهري' },
];

type SortKey = 'name' | 'attendance_rate' | 'pages' | 'achievements' | 'students' | 'last_activity';

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function presetRange(key: string): { from: string; to: string } {
  const end = new Date();
  const start = new Date(end);
  if (key === 'ytd') start.setMonth(0, 1);
  else start.setDate(end.getDate() - (Number(key) - 1));
  return { from: iso(start), to: iso(end) };
}

function toInt(value: string | null): number | undefined {
  const n = value ? Number(value) : NaN;
  return Number.isInteger(n) && n > 0 ? n : undefined;
}


export default function AnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { lang } = useLang();

  const preset = params.get('preset') ?? (params.get('from') ? 'custom' : '90');
  const range = preset === 'custom'
    ? { from: params.get('from') ?? presetRange('90').from, to: params.get('to') ?? presetRange('90').to }
    : presetRange(preset);
  const query: AnalyticsQuery = useMemo(() => ({
    date_from: range.from,
    date_to: range.to,
    granularity: (params.get('g') as Granularity) || undefined,
    school_id: toInt(params.get('school')),
    lecture_id: toInt(params.get('lecture')),
    student_id: toInt(params.get('student')),
  }), [range.from, range.to, params]);

  const [data, setData] = useState<AnalyticsData | null>(null);
  // Request bookkeeping: `loading` is derived (request key not settled yet), never set in the effect.
  const [reloadToken, setReloadToken] = useState(0);
  const [settled, setSettled] = useState<{ key: string; error: string | null } | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'attendance_rate', dir: -1 });
  const [rankMetric, setRankMetric] = useState<'attendance_rate' | 'pages'>('attendance_rate');

  const queryKey = JSON.stringify(query);
  const requestKey = `${queryKey}#${reloadToken}`;
  const loading = settled?.key !== requestKey;
  const error = loading ? null : settled?.error ?? null;
  const load = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    analyticsAPI.getAnalytics(JSON.parse(queryKey) as AnalyticsQuery)
      .then((result) => {
        if (!active) return;
        setData(result);
        setSettled({ key: requestKey, error: null });
      })
      .catch((err) => {
        if (active) setSettled({ key: requestKey, error: describeError(err, t('تعذر تحميل التحليلات')) });
      });
    return () => { active = false; };
  }, [queryKey, requestKey]);

  /** Update the URL (the single source of truth for filters). */
  const navigate = (changes: Record<string, string | number | undefined | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') next.delete(key);
      else next.set(key, String(value));
    });
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const drill = (id: number) => {
    if (!data?.breakdown.level) return;
    if (data.breakdown.level === 'school') navigate({ school: id, lecture: null, student: null });
    if (data.breakdown.level === 'lecture') navigate({ lecture: id, student: null });
    if (data.breakdown.level === 'student') navigate({ student: id });
  };

  const reportHref = `/dashboard/analytics/report?${new URLSearchParams(
    Object.entries({ ...query, preset: undefined }).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString()}`;

  const sortedRows = useMemo(() => {
    const rows = [...(data?.breakdown.rows ?? [])];
    return rows.sort((a, b) => {
      const av = sort.key === 'name' ? entityName(a, lang) : a[sort.key];
      const bv = sort.key === 'name' ? entityName(b, lang) : b[sort.key];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
    });
  }, [data, sort, lang]);

  const insights: Insight[] = data ? buildInsights(data, lang) : [];
  const k = data?.kpis;
  const rateDelta = k ? delta(k.attendance_rate, k.previous.attendance_rate, 'points') : null;
  const pagesDelta = k ? delta(k.pages, k.previous.pages, 'percent') : null;
  const achDelta = k ? delta(k.achievements, k.previous.achievements, 'percent') : null;
  const rankRows = (data?.breakdown.rows ?? [])
    .filter((r) => (rankMetric === 'pages' ? true : r.attendance_rate !== null))
    .sort((a, b) => ((b[rankMetric] ?? -1) as number) - ((a[rankMetric] ?? -1) as number))
    .slice(0, 10)
    .map((r) => ({
      id: r.id,
      label: entityName(r, lang),
      value: r[rankMetric],
      display: rankMetric === 'pages' ? formatNumber(r.pages, 0) : formatPercent(r.attendance_rate),
      hint: rankMetric === 'pages'
        ? t('{count} إنجاز', { count: formatNumber(r.achievements) })
        : t('{count} سجل حضور', { count: formatNumber(r.attendance_records) }),
      health: r.health,
    }));

  const header = (key: SortKey, label: string) => (
    <th
      scope="col"
      className="whitespace-nowrap px-3 py-2 text-start"
      aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }))}
        className="inline-flex items-center gap-1 font-semibold hover:text-gray-900"
      >
        {label}
        <ArrowUpDown size={12} className={sort.key === key ? 'text-gray-800' : 'text-gray-300'} aria-hidden="true" />
      </button>
    </th>
  );

  return (
    <AppLayout title="لوحة التحليلات" breadcrumb="لوحة التحكم / التحليلات">
      <div className="mx-auto max-w-7xl space-y-4 pb-10 sm:space-y-5">
        {/* Filters: one row above everything they scope */}
        <section aria-label={t('عوامل التصفية')} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">{t('الفترة')}</p>
              <div className="flex flex-wrap gap-1" role="group" aria-label={t('الفترة')}>
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => navigate({ preset: p.key, from: null, to: null })}
                    aria-pressed={preset === p.key}
                    className={cn(
                      'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                      preset === p.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {t(p.label)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <label className="text-xs font-medium text-gray-500">
                {t('من')}
                <input type="date" value={range.from} max={range.to}
                  onChange={(e) => e.target.value && navigate({ preset: 'custom', from: e.target.value, to: range.to })}
                  className="mt-1 block rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-800" />
              </label>
              <label className="text-xs font-medium text-gray-500">
                {t('إلى')}
                <input type="date" value={range.to} min={range.from}
                  onChange={(e) => e.target.value && navigate({ preset: 'custom', from: range.from, to: e.target.value })}
                  className="mt-1 block rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-800" />
              </label>
            </div>
            <label className="text-xs font-medium text-gray-500">
              {t('التفصيل الزمني')}
              <select value={params.get('g') ?? ''} onChange={(e) => navigate({ g: e.target.value })}
                className="mt-1 block rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800">
                {GRANULARITIES.map((g) => <option key={g.key} value={g.key}>{t(g.label)}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {t('تحديث')}
            </button>
            <a href={reportHref} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8963E] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#b5852f]">
              <FileDown size={14} /> {t('تحميل التقرير (PDF)')}
            </a>
          </div>
        </section>

        {/* Drill-down path */}
        <nav aria-label={t('مسار التصفح')} className="flex flex-wrap items-center gap-1 text-sm">
          {[
            { key: 'platform', label: t('جميع المدارس'), onClick: () => navigate({ school: null, lecture: null, student: null }) },
            data?.scope.school && { key: 'school', label: data.scope.school.name, onClick: () => navigate({ lecture: null, student: null }) },
            data?.scope.lecture && { key: 'lecture', label: entityName(data.scope.lecture, lang), onClick: () => navigate({ student: null }) },
            data?.scope.student && { key: 'student', label: entityName(data.scope.student, lang), onClick: undefined },
          ].filter(Boolean).map((crumb, index, all) => {
            const c = crumb as { key: string; label: string; onClick?: () => void };
            const last = index === all.length - 1;
            return (
              <span key={c.key} className="flex items-center gap-1">
                {index > 0 && <ChevronLeft size={14} className="ltr:-scale-x-100 text-gray-300" aria-hidden="true" />}
                {last ? (
                  <span className="rounded-lg bg-amber-50 px-2 py-1 font-semibold text-amber-800" aria-current="page">{c.label}</span>
                ) : (
                  <button type="button" onClick={c.onClick} className="rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900">{c.label}</button>
                )}
              </span>
            );
          })}
          {data && <span className="ms-auto text-xs text-gray-400">{periodLabel(data)}</span>}
        </nav>

        {error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
            <button type="button" onClick={load} className="font-semibold underline">{t('إعادة المحاولة')}</button>
          </div>
        )}

        {!data && loading && (
          <div className="flex min-h-64 items-center justify-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {t('جارٍ التحميل…')}</div>
        )}

        {data && k && (
          // Refetch keeps the frame: previous render stays at reduced opacity.
          <div className={cn('space-y-4 transition-opacity sm:space-y-5', loading && 'opacity-50')} aria-busy={loading}>
            {/* Executive summary */}
            <section aria-labelledby="insights-heading" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 id="insights-heading" className="mb-3 text-sm font-bold text-gray-900 sm:text-base">
                {t('الملخص التنفيذي')} · <span className="font-normal text-gray-500">{t(LEVEL_LABELS[data.level])}</span>
              </h2>
              <InsightList insights={insights} />
            </section>

            {/* KPI row */}
            <section aria-label={t('المؤشرات الرئيسية')} className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              <StatTile label={t('نسبة الحضور')} value={formatPercent(k.attendance_rate)}
                deltaLabel={rateDelta?.label} deltaDirection={rateDelta?.value} deltaGood={rateDelta ? rateDelta.value >= 0 : null}
                hint={t('{count} سجل حضور', { count: formatCompact(k.attendance_records) })}
                trend={data.series.map((p) => p.attendance_rate)} />
              <StatTile label={t('الصفحات المنجزة')} value={formatCompact(k.pages)}
                deltaLabel={pagesDelta?.label} deltaDirection={pagesDelta?.value} deltaGood={pagesDelta ? pagesDelta.value >= 0 : null}
                trend={data.series.map((p) => p.pages)} />
              <StatTile label={t('الإنجازات المسجلة')} value={formatCompact(k.achievements)}
                deltaLabel={achDelta?.label} deltaDirection={achDelta?.value} deltaGood={achDelta ? achDelta.value >= 0 : null}
                trend={data.series.map((p) => p.achievements)} />
              {data.level !== 'student' ? (
                <>
                  <StatTile label={t('الطلاب النشطون')} value={formatCompact(k.active_students)}
                    hint={t('من أصل {total} ({share})', { total: formatCompact(k.students), share: formatPercent(k.students ? (k.active_students / k.students) * 100 : null, 0) })} />
                  {data.level === 'platform' && <StatTile label={t('المدارس')} value={formatCompact(k.schools)} hint={t('{count} حلقة', { count: formatCompact(k.lectures) })} />}
                  {data.level === 'school' && <StatTile label={t('الحلقات')} value={formatCompact(k.lectures)} />}
                  {data.level === 'lecture' && <StatTile label={t('الطلاب المسجلون')} value={formatCompact(k.students)} />}
                  <StatTile label={t('المعلمين')} value={formatCompact(k.teachers ?? 0)} />
                </>
              ) : (
                <>
                  <StatTile label={t('سجلات الحضور')} value={formatCompact(k.attendance_records)} />
                  <StatTile label={t('الحلقات')} value={formatCompact(k.lectures)} />
                  <StatTile label={t('تاريخ التسجيل')} value={formatDay(data.student?.enrollment_date)} />
                </>
              )}
            </section>

            {/* Attendance trend + status split */}
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
              <ChartCard className="lg:col-span-2" title={t('تطور نسبة الحضور')}
                subtitle={t('نسبة الحاضرين والمتأخرين من مجموع سجلات الحضور')} table={attendanceTable(data)}>
                <LineChart points={attendancePoints(data)} seriesLabel={t('نسبة الحضور')} formatValue={(v) => formatPercent(v)} yMax={100} />
              </ChartCard>
              <ChartCard title={t('توزيع حالات الحضور')} subtitle={t('{count} سجل خلال الفترة', { count: formatNumber(k.attendance_records) })}
                table={statusTable(k.status_breakdown)}>
                <SegmentedBar parts={statusParts(k.status_breakdown)} />
                <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs">
                  {(['present', 'absent'] as const).map((s) => (
                    <div key={s}>
                      <dt className="text-gray-500">{t(STATUS_LABELS[s])}</dt>
                      <dd className="font-semibold tabular-nums text-gray-900">
                        {formatPercent(k.attendance_records ? (k.status_breakdown[s] / k.attendance_records) * 100 : null)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </ChartCard>
            </div>

            {/* Pages over time + ranking */}
            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
              <ChartCard title={t('الصفحات المنجزة حسب النوع')} subtitle={t('{count} صفحة خلال الفترة', { count: formatNumber(k.pages) })}
                table={pagesTable(data)}>
                {(() => {
                  const cols = pagesColumns(data);
                  return <StackedColumns labels={cols.labels} longLabels={cols.longLabels} series={cols.series}
                    formatValue={(v) => t('{count} صفحة', { count: formatNumber(v, 1) })} totalLabel={t('مجموع الصفحات')} />;
                })()}
              </ChartCard>

              {data.breakdown.level && (
                <ChartCard
                  title={t('ترتيب {entities}', { entities: t(BREAKDOWN_TITLES[data.breakdown.level]) })}
                  subtitle={t('انقر على عنصر للتعمق في تفاصيله')}
                  table={breakdownTable(data.breakdown.rows, lang, data.breakdown.level)}
                  actions={
                    <select value={rankMetric} onChange={(e) => setRankMetric(e.target.value as 'attendance_rate' | 'pages')}
                      aria-label={t('المؤشر')} className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700">
                      <option value="attendance_rate">{t('نسبة الحضور')}</option>
                      <option value="pages">{t('الصفحات')}</option>
                    </select>
                  }
                >
                  <RankedBars rows={rankRows} max={rankMetric === 'attendance_rate' ? 100 : undefined} onSelect={drill}
                    emptyLabel={t('لا توجد بيانات للفترة المحددة')} />
                </ChartCard>
              )}

              {data.level === 'student' && data.student && (
                <ChartCard title={t('التقدم التراكمي في الحفظ')} subtitle={t('مجموع الصفحات المنجزة منذ بداية الفترة')}
                  table={{ columns: [t('التاريخ'), t('مجموع الصفحات')], rows: data.student.cumulative_pages.map((p) => [formatDay(p.day, 'long'), formatNumber(p.pages, 1)]) }}>
                  <LineChart
                    points={data.student.cumulative_pages.map((p) => ({ label: formatDay(p.day), longLabel: formatDay(p.day, 'long'), value: p.pages }))}
                    seriesLabel={t('مجموع الصفحات')} formatValue={(v) => t('{count} صفحة', { count: formatNumber(v, 1) })} />
                </ChartCard>
              )}
            </div>

            {/* Detailed breakdown table */}
            {data.breakdown.level && (
              <section aria-labelledby="breakdown-heading" className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3 sm:px-5">
                  <h2 id="breakdown-heading" className="text-sm font-bold text-gray-900 sm:text-base">
                    {t('تفاصيل {entities}', { entities: t(BREAKDOWN_TITLES[data.breakdown.level]) })}
                  </h2>
                  <span className="text-xs text-gray-400">{t('{count} عنصر', { count: formatNumber(sortedRows.length) })}</span>
                </div>
                {/* relative: keeps the absolutely positioned sr-only header text inside the scroll area (RTL page overflow) */}
                <div className="relative overflow-x-auto">
                  <table className="w-full min-w-[44rem] text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500">
                      <tr>
                        {header('name', t('الاسم'))}
                        <th scope="col" className="px-3 py-2 text-start font-semibold">{t('الحالة')}</th>
                        {header('attendance_rate', t('نسبة الحضور'))}
                        {header('pages', t('الصفحات'))}
                        {header('achievements', t('الإنجازات'))}
                        {data.breakdown.level !== 'student' && header('students', t('الطلاب'))}
                        {header('last_activity', t('آخر نشاط'))}
                        <th scope="col" className="px-3 py-2"><span className="sr-only">{t('تفاصيل')}</span></th>
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      {sortedRows.map((row: BreakdownRow) => (
                        <tr key={row.id} className="border-t border-gray-100 hover:bg-sky-50/40">
                          <td className="px-3 py-2.5 font-medium text-gray-900">{entityName(row, lang)}</td>
                          <td className="px-3 py-2.5"><HealthBadge health={row.health} /></td>
                          <td className="px-3 py-2.5">
                            <span className="flex items-center gap-2">
                              <span className="w-12 font-semibold">{formatPercent(row.attendance_rate)}</span>
                              <span className="hidden h-1.5 w-20 rounded-full bg-[#cde2fb] sm:block" aria-hidden="true">
                                <span className="block h-full rounded-full bg-[#2a78d6]" style={{ width: `${row.attendance_rate ?? 0}%` }} />
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-2.5">{formatNumber(row.pages, 0)}</td>
                          <td className="px-3 py-2.5">{formatNumber(row.achievements)}</td>
                          {data.breakdown.level !== 'student' && (
                            <td className="px-3 py-2.5">{formatNumber(row.active_students)} / {formatNumber(row.students)}</td>
                          )}
                          <td className="px-3 py-2.5 text-gray-500">{formatDay(row.last_activity)}</td>
                          <td className="px-3 py-2.5 text-end">
                            <button type="button" onClick={() => drill(row.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100">
                              {t('تفاصيل')} <ChevronLeft size={13} className="ltr:-scale-x-100" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!sortedRows.length && <p className="py-8 text-center text-sm text-gray-400">{t('لا توجد بيانات للفترة المحددة')}</p>}
                </div>
              </section>
            )}

            {/* Top students per school, full time and part time */}
            {data.top_students?.some((s) => s.internal.length + s.external.length > 0) && (
              <TopStudents schools={data.top_students} lang={lang} onSelect={(id) => navigate({ student: id })} />
            )}

            {/* Student detail */}
            {data.level === 'student' && data.student && (
              <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                <ChartCard title={t('سجل الحضور')} subtitle={t('{count} سجل', { count: formatNumber(data.student.attendance.length) })}>
                  <div className="max-h-80 overflow-y-auto">
                    <DataTable dense table={{
                      columns: [t('التاريخ'), t('الحالة'), t('الحلقة')],
                      rows: data.student.attendance.map((a) => [formatDay(a.day, 'long'), t(STATUS_LABELS[a.status]), a.lecture ?? '—']),
                    }} />
                  </div>
                </ChartCard>
                <ChartCard title={t('سجل الإنجازات')} subtitle={t('{count} إنجاز', { count: formatNumber(data.student.achievements.length) })}>
                  <div className="max-h-80 overflow-y-auto">
                    <DataTable dense table={{
                      columns: [t('التاريخ'), t('النوع'), t('الصفحات')],
                      rows: data.student.achievements.map((a) => [formatDay(a.day, 'long'), t(ACHIEVEMENT_LABELS[a.type]), formatNumber(a.pages, 1)]),
                    }} />
                  </div>
                </ChartCard>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
