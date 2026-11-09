'use client';

/**
 * Print-ready A4 report for the admin analytics (same query string as the dashboard).
 * The browser's print engine produces the PDF: vector text, correct Arabic shaping and
 * RTL, real page breaks. `?autoprint=0` disables the automatic print dialog.
 */
import { formatThumn } from '@/utils/thumn';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Loader2, Printer, X } from 'lucide-react';
import analyticsAPI, { AnalyticsData, AnalyticsQuery, Granularity } from '@/app/API/analytics';
import { DataTable, HealthBadge, LineChart, SegmentedBar, StackedColumns } from '@/components/analytics/charts';
import {
  BREAKDOWN_TITLES, LEVEL_LABELS, attendancePoints, thumnColumns, periodLabel, scopeTitle, statusParts, statusTable,
} from '@/components/analytics/derive';
import { buildInsights, entityName } from '@/components/analytics/insights';
import { InsightList } from '@/components/analytics/InsightList';
import {
  ACHIEVEMENT_LABELS, ACHIEVEMENT_ORDER, STATUS_LABELS, delta, formatDay, formatNumber, formatPercent,
} from '@/components/analytics/theme';
import { useLang } from '@/i18n/I18nProvider';
import { t } from '@/i18n';
import { useAuthStore } from '@/store/authStore';
import { describeError } from '@/utils/errorMessages';
import logo from '../../../../assets/logo.png';

const CHART_WIDTH = 680; // A4 content width (210mm - 2 x 14mm margins) at 96 dpi

function toInt(value: string | null): number | undefined {
  const n = value ? Number(value) : NaN;
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

function Section({ number, title, children, breakBefore }: { number: number; title: string; children: React.ReactNode; breakBefore?: boolean }) {
  return (
    <section className={breakBefore ? 'report-break-before' : undefined}>
      <h2 className="mb-3 flex items-baseline gap-2 border-b-2 border-[#C8963E] pb-1.5 text-lg font-bold text-gray-900">
        <span className="text-[#C8963E]">{number}.</span> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note?: string | null }) {
  return (
    <div className="report-avoid-break rounded-lg border border-gray-200 p-3">
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className="mt-0.5 text-xl font-semibold text-gray-900">{value}</p>
      {note && <p className="text-[10px] text-gray-500">{note}</p>}
    </div>
  );
}

export default function AnalyticsReportPage() {
  const params = useSearchParams();
  const { lang } = useLang();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const printed = useRef(false);

  const query: AnalyticsQuery = useMemo(() => ({
    date_from: params.get('date_from') ?? undefined,
    date_to: params.get('date_to') ?? undefined,
    granularity: (params.get('granularity') as Granularity) || undefined,
    school_id: toInt(params.get('school_id')),
    lecture_id: toInt(params.get('lecture_id')),
    student_id: toInt(params.get('student_id')),
  }), [params]);

  useEffect(() => {
    analyticsAPI.getAnalytics(query)
      .then(setData)
      .catch((err) => setError(describeError(err, t('تعذر تحميل التحليلات'))));
  }, [query]);

  // Name the saved PDF after the scope and period, then open the print dialog once.
  useEffect(() => {
    if (!data) return;
    const safe = (s: string) => s.replace(/[\\/:*?"<>|]+/g, ' ').trim();
    document.title = `${t('تقرير')} - ${safe(scopeTitle(data, lang))} - ${data.period.from}_${data.period.to}`;
    if (params.get('autoprint') !== '0' && !printed.current) {
      printed.current = true;
      const timer = window.setTimeout(() => window.print(), 900);
      return () => window.clearTimeout(timer);
    }
  }, [data, lang, params]);

  if (error) {
    return <p role="alert" className="m-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>;
  }
  if (!data) {
    return <div className="flex min-h-dvh items-center justify-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {t('جارٍ إعداد التقرير…')}</div>;
  }

  const k = data.kpis;
  const insights = buildInsights(data, lang);
  const cols = thumnColumns(data);
  const rateDelta = delta(k.attendance_rate, k.previous.attendance_rate, 'points');
  const thumnDelta = delta(k.thumn, k.previous.thumn, 'percent');
  const generated = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
  let section = 0;

  return (
    <div className="report-root min-h-dvh bg-gray-100 py-6 print:bg-white print:py-0">
      {/* Screen-only toolbar */}
      <div className="report-no-print mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4">
        <p className="text-sm text-gray-600">{t('لحفظ التقرير كملف PDF اختر «حفظ بتنسيق PDF» في نافذة الطباعة.')}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8963E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b5852f]">
            <Printer size={16} /> {t('تحميل / طباعة PDF')}
          </button>
          <button type="button" onClick={() => window.close()} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <X size={16} /> {t('إغلاق')}
          </button>
        </div>
      </div>

      <article className="report-sheet mx-auto max-w-[210mm] bg-white px-[14mm] py-[14mm] shadow-lg print:max-w-none print:p-0 print:shadow-none">
        {/* Cover */}
        <header className="report-cover flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <Image src={logo} alt="" width={52} height={52} className="rounded-xl" />
              <div>
                <p className="text-base font-bold text-gray-900">{t('أهل القرآن')}</p>
                <p className="text-xs text-gray-500">{t('منصة إدارة المدارس القرآنية')}</p>
              </div>
            </div>
            <p className="text-end text-xs text-gray-500">{t('سري — للاستخدام الداخلي')}</p>
          </div>

          <div className="py-16">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#C8963E]">{t('تقرير الأداء')}</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900">{t('تقرير حالة المدارس والطلاب')}</h1>
            <p className="mt-3 text-xl text-gray-700">{scopeTitle(data, lang)}</p>
            <dl className="mt-8 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-gray-500">{t('النطاق')}</dt><dd className="font-medium text-gray-900">{t(LEVEL_LABELS[data.level])}</dd>
              {data.scope.school && data.level !== 'school' && (<><dt className="text-gray-500">{t('المدرسة')}</dt><dd className="font-medium text-gray-900">{data.scope.school.name}</dd></>)}
              {data.scope.lecture && data.level === 'student' && (<><dt className="text-gray-500">{t('الحلقة')}</dt><dd className="font-medium text-gray-900">{entityName(data.scope.lecture, lang)}</dd></>)}
              <dt className="text-gray-500">{t('الفترة')}</dt><dd className="font-medium text-gray-900">{periodLabel(data)}</dd>
              <dt className="text-gray-500">{t('فترة المقارنة')}</dt><dd className="font-medium text-gray-900">{formatDay(data.period.previous_from, 'long')} — {formatDay(data.period.previous_to, 'long')}</dd>
              <dt className="text-gray-500">{t('تاريخ الإصدار')}</dt><dd className="font-medium text-gray-900">{generated}</dd>
              {user && (
                <>
                  <dt className="text-gray-500">{t('أعده')}</dt>
                  {/* Admin sessions store the placeholder name "الرئيس" at login; show the role instead. */}
                  <dd className="font-medium text-gray-900">
                    {user.firstname === 'الرئيس' || !`${user.firstname ?? ''}${user.lastname ?? ''}`.trim()
                      ? t('المسؤول')
                      : `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim()}
                  </dd>
                </>
              )}
            </dl>
          </div>

          <div className="rounded-xl bg-amber-50/70 p-4 text-xs leading-6 text-amber-900">
            {t('يقدم هذا التقرير صورة شاملة عن الحضور والإنجاز في النطاق والفترة المحددين، مع مقارنة بالفترة السابقة المماثلة في المدة وتحديد النقاط التي تحتاج إلى متابعة.')}
          </div>
        </header>

        <div className="report-break-before space-y-8">
          <Section number={++section} title={t('الملخص التنفيذي')}>
            <InsightList insights={insights} columns={1} />
            <div className="grid grid-cols-3 gap-2">
              <Kpi label={t('نسبة الحضور')} value={formatPercent(k.attendance_rate)} note={rateDelta && `${rateDelta.label} ${t('مقارنة بالفترة السابقة')}`} />
              <Kpi label={t('المقدار المنجز')} value={formatThumn(k.thumn)} note={thumnDelta && `${thumnDelta.label} ${t('مقارنة بالفترة السابقة')}`} />
              <Kpi label={t('الإنجازات المسجلة')} value={formatNumber(k.achievements)} />
              {data.level !== 'student' ? (
                <>
                  <Kpi label={t('الطلاب النشطون')} value={`${formatNumber(k.active_students)} / ${formatNumber(k.students)}`}
                    note={formatPercent(k.students ? (k.active_students / k.students) * 100 : null, 0)} />
                  {data.level === 'platform'
                    ? <Kpi label={t('المدارس')} value={formatNumber(k.schools)} note={t('{count} حلقة', { count: formatNumber(k.lectures) })} />
                    : <Kpi label={t('الحلقات')} value={formatNumber(k.lectures)} />}
                  <Kpi label={t('المعلمين')} value={formatNumber(k.teachers ?? 0)} />
                </>
              ) : (
                <>
                  <Kpi label={t('سجلات الحضور')} value={formatNumber(k.attendance_records)} />
                  <Kpi label={t('الحلقات')} value={formatNumber(k.lectures)} />
                  <Kpi label={t('تاريخ التسجيل')} value={formatDay(data.student?.enrollment_date, 'long')} />
                </>
              )}
            </div>
          </Section>

          <Section number={++section} title={t('الحضور والمواظبة')}>
            <div className="report-avoid-break">
              <h3 className="mb-1 text-sm font-semibold text-gray-800">{t('تطور نسبة الحضور')}</h3>
              <p className="mb-2 text-xs text-gray-500">{t('نسبة الحاضرين والمتأخرين من مجموع سجلات الحضور')}</p>
              <LineChart points={attendancePoints(data)} seriesLabel={t('نسبة الحضور')} formatValue={(v) => formatPercent(v)} yMax={100} staticMode fixedWidth={CHART_WIDTH} height={200} />
            </div>
            <div className="report-avoid-break">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">{t('توزيع حالات الحضور')}</h3>
              <SegmentedBar parts={statusParts(k.status_breakdown)} staticMode />
              <div className="mt-3"><DataTable dense table={statusTable(k.status_breakdown)} /></div>
            </div>
          </Section>

          <Section number={++section} title={t('الحفظ والمراجعة')} breakBefore>
            <div className="report-avoid-break">
              <h3 className="mb-1 text-sm font-semibold text-gray-800">{t('المقدار المنجز حسب النوع')}</h3>
              <p className="mb-2 text-xs text-gray-500">{t('{amount} خلال الفترة', { amount: formatThumn(k.thumn) })}</p>
              <StackedColumns labels={cols.labels} longLabels={cols.longLabels} series={cols.series} staticMode fixedWidth={CHART_WIDTH} height={210}
                formatValue={(v) => formatThumn(v)} totalLabel={t('المجموع')} />
            </div>
            <DataTable dense table={{
              columns: [t('النوع'), t('المقدار'), t('الفترة السابقة'), t('التغير')],
              rows: ACHIEVEMENT_ORDER.map((kind) => {
                const change = delta(k.thumn_by_type[kind], k.previous.thumn_by_type[kind], 'percent');
                return [t(ACHIEVEMENT_LABELS[kind]), formatThumn(k.thumn_by_type[kind]), formatThumn(k.previous.thumn_by_type[kind]), change?.label ?? '—'];
              }),
            }} />
          </Section>

          {data.breakdown.level && data.breakdown.rows.length > 0 && (
            <Section number={++section} title={t('تفاصيل {entities}', { entities: t(BREAKDOWN_TITLES[data.breakdown.level]) })} breakBefore>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-300 text-gray-600">
                    <th className="px-1.5 py-1.5 text-start">{t('الاسم')}</th>
                    <th className="px-1.5 py-1.5 text-start">{t('الحالة')}</th>
                    <th className="px-1.5 py-1.5 text-start">{t('نسبة الحضور')}</th>
                    <th className="px-1.5 py-1.5 text-start">{t('المقدار')}</th>
                    <th className="px-1.5 py-1.5 text-start">{t('الإنجازات')}</th>
                    {data.breakdown.level !== 'student' && <th className="px-1.5 py-1.5 text-start">{t('النشطون')}</th>}
                    <th className="px-1.5 py-1.5 text-start">{t('آخر نشاط')}</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {[...data.breakdown.rows]
                    .sort((a, b) => (b.attendance_rate ?? -1) - (a.attendance_rate ?? -1))
                    .map((row) => (
                      <tr key={row.id} className="report-avoid-break border-b border-gray-100">
                        <td className="px-1.5 py-1.5 font-medium text-gray-900">{entityName(row, lang)}</td>
                        <td className="px-1.5 py-1.5"><HealthBadge health={row.health} /></td>
                        <td className="px-1.5 py-1.5">{formatPercent(row.attendance_rate)}</td>
                        <td className="px-1.5 py-1.5">{formatThumn(row.thumn)}</td>
                        <td className="px-1.5 py-1.5">{formatNumber(row.achievements)}</td>
                        {data.breakdown.level !== 'student' && <td className="px-1.5 py-1.5">{formatNumber(row.active_students)} / {formatNumber(row.students)}</td>}
                        <td className="px-1.5 py-1.5 text-gray-600">{formatDay(row.last_activity)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Section>
          )}

          {data.top_students?.some((s) => s.internal.length + s.external.length > 0) && (
            <Section number={++section} title={t('الطلبة المتميزون')}>
              <p className="text-xs text-gray-500">{t('أفضل 5 طلبة في كل مدرسة حسب نظام الدراسة. النتيجة = 35% الحضور + 35% الحفظ (مقارنة بأفضل طالب في نفس الفئة) + 30% معدل الامتحانات، خلال الفترة المحددة.')}</p>
              <DataTable dense table={{
                columns: [t('المدرسة'), t('نظام الدراسة'), t('الترتيب'), t('الطالب'), t('النتيجة'), t('نسبة الحضور'), t('المقدار'), t('معدل الامتحانات')],
                rows: data.top_students.flatMap((school) => (['internal', 'external'] as const).flatMap((mode) => school[mode].map((s) => [
                  school.school ?? '—',
                  mode === 'internal' ? t('داخلي (دوام كامل)') : t('خارجي (دوام جزئي)'),
                  formatNumber(s.rank),
                  entityName(s, lang),
                  formatNumber(s.score, 1),
                  formatPercent(s.attendance_rate),
                  formatThumn(s.thumn),
                  formatPercent(s.exam_average),
                ]))),
              }} />
            </Section>
          )}

          {data.level === 'student' && data.student && (
            <Section number={++section} title={t('سجل الطالب')} breakBefore>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">{t('سجل الحضور')}</h3>
                  <DataTable dense table={{
                    columns: [t('التاريخ'), t('الحالة')],
                    rows: data.student.attendance.slice(0, 40).map((a) => [formatDay(a.day, 'long'), t(STATUS_LABELS[a.status])]),
                  }} />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">{t('سجل الإنجازات')}</h3>
                  <DataTable dense table={{
                    columns: [t('التاريخ'), t('النوع'), t('المقدار')],
                    rows: data.student.achievements.slice(0, 40).map((a) => [formatDay(a.day, 'long'), t(ACHIEVEMENT_LABELS[a.type]), formatThumn(a.thumn)]),
                  }} />
                </div>
              </div>
            </Section>
          )}

          <Section number={++section} title={t('المنهجية والتعريفات')}>
            <ul className="list-disc space-y-1.5 ps-5 text-xs leading-6 text-gray-700">
              <li>{t('نسبة الحضور = (الحاضرون + المتأخرون) ÷ مجموع سجلات الحضور خلال الفترة.')}</li>
              <li>{t('تُحسب الأثمان حسب تقسيم المصحف المحمدي برواية ورش (60 حزباً، 480 ثمناً) انطلاقاً من السورة والآية المسجلتين في كل إنجاز. مصدر التقسيم: nuralhifz-data، برخصة CC BY 4.0.')}</li>
              <li>{t('الطالب النشط هو من سُجل له حضور أو إنجاز واحد على الأقل خلال الفترة.')}</li>
              <li>{t('الحالة: جيد ≥ 85%، يحتاج متابعة بين 70% و85%، حرج أقل من 70%، وبيانات غير كافية إذا كانت السجلات أقل من 3.')}</li>
              <li>{t('فترة المقارنة هي الفترة السابقة مباشرة وبالمدة نفسها.')}</li>
            </ul>
          </Section>
        </div>

        <footer className="mt-10 border-t border-gray-200 pt-3 text-center text-[10px] text-gray-400">
          {t('أهل القرآن')} · {t('تقرير حالة المدارس والطلاب')} · {generated}
        </footer>
      </article>
    </div>
  );
}
