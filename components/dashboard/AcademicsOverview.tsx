'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, ClipboardList, Layers, Loader2, Percent, Trophy, UserCheck } from 'lucide-react';
import adminAPI, { type AcademicStatistics } from '@/app/API/admin';
import { PctBar, formatPct } from '@/components/exams/examUi';
import { getLocale, t } from '@/i18n';

/** Admin dashboard: specialities and exams across all schools, with a per-school table. */
export function AcademicsOverview() {
  const [data, setData] = useState<AcademicStatistics | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    adminAPI.getAcademicStatistics()
      .then((result) => { if (active) setData(result); })
      .catch((err: unknown) => {
        console.error('Error fetching academic statistics:', err);
        if (active) setFailed(true);
      });
    return () => { active = false; };
  }, []);

  const number = (value: number) => value.toLocaleString(getLocale());
  const totals = data?.totals;

  const tiles = totals ? [
    { label: 'الأقسام والتخصصات', value: number(totals.specialities), hint: t('{count} طالب مسجل في قسم/تخصص', { count: number(totals.students_with_speciality) }), icon: <Layers size={18} />, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'تغطية الأقسام والتخصصات', value: formatPct(totals.speciality_coverage), hint: t('من مجموع الطلاب'), icon: <Percent size={18} />, tone: 'bg-teal-50 text-teal-700' },
    { label: 'الامتحانات', value: number(totals.exams), hint: t('{count} خلال 90 يوماً', { count: number(totals.exams_90d) }), icon: <ClipboardList size={18} />, tone: 'bg-sky-50 text-sky-700' },
    { label: 'امتحانات قادمة', value: number(totals.upcoming_exams), icon: <CalendarClock size={18} />, tone: 'bg-violet-50 text-violet-700' },
    { label: 'متوسط النقاط', value: formatPct(totals.average_pct), hint: t('{count} نتيجة', { count: number(totals.graded_results) }), icon: <Trophy size={18} />, tone: 'bg-amber-50 text-amber-700' },
    { label: 'نسبة النجاح', value: formatPct(totals.pass_rate), icon: <Trophy size={18} />, tone: 'bg-green-50 text-green-700' },
    { label: 'الحضور في الامتحانات', value: formatPct(totals.exam_attendance_rate), icon: <UserCheck size={18} />, tone: 'bg-blue-50 text-blue-700' },
  ] : [];

  return (
    <section aria-labelledby="academics-heading" className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 id="academics-heading" className="text-lg font-bold text-gray-900">{t('الأقسام والتخصصات والامتحانات')}</h3>
        <p className="text-sm text-gray-500">{t('النتائج الأكاديمية لكل المدارس: الأقسام والتخصصات، الامتحانات، المعدلات ونسب النجاح')}</p>
      </div>

      {failed ? (
        <p className="py-6 text-center text-sm text-gray-400">{t('تعذر تحميل الإحصاءات')}</p>
      ) : !data ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="h-7 w-7 animate-spin" style={{ color: '#C8963E' }} /></div>
      ) : (
        <div className="space-y-5">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
            {tiles.map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-100 p-4">
                <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.tone}`} aria-hidden="true">{item.icon}</span>
                  {t(item.label)}
                </dt>
                <dd className="mt-2 text-2xl font-bold tabular-nums text-gray-900">{item.value}</dd>
                {item.hint && <dd className="text-xs text-gray-400">{item.hint}</dd>}
              </div>
            ))}
          </dl>

          {data.schools.length > 0 && (
            <div className="relative overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full min-w-[46rem] text-sm">
                <caption className="sr-only">{t('الأقسام والتخصصات والامتحانات حسب المدرسة')}</caption>
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-start font-medium">{t('المدرسة')}</th>
                    <th scope="col" className="px-3 py-2 text-end font-medium">{t('الأقسام والتخصصات')}</th>
                    <th scope="col" className="w-36 px-3 py-2 text-start font-medium">{t('تغطية الأقسام والتخصصات')}</th>
                    <th scope="col" className="px-3 py-2 text-end font-medium">{t('الامتحانات')}</th>
                    <th scope="col" className="w-36 px-3 py-2 text-start font-medium">{t('متوسط النقاط')}</th>
                    <th scope="col" className="w-36 px-3 py-2 text-start font-medium">{t('نسبة النجاح')}</th>
                    <th scope="col" className="px-3 py-2 text-end font-medium">{t('الحضور')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.schools.map((row) => (
                    <tr key={row.school_id} className="border-t border-gray-100">
                      <th scope="row" className="px-3 py-2.5 text-start font-medium text-gray-900">{row.school_name}</th>
                      <td className="px-3 py-2.5 text-end tabular-nums">{number(row.specialities)}</td>
                      <td className="px-3 py-2.5"><PctBar value={row.speciality_coverage} label={t('تغطية الأقسام والتخصصات')} /></td>
                      <td className="px-3 py-2.5 text-end tabular-nums">
                        {number(row.exams)}
                        {row.upcoming_exams > 0 && <span className="ms-1 text-xs text-gray-400">(+{number(row.upcoming_exams)} {t('قادم')})</span>}
                      </td>
                      <td className="px-3 py-2.5"><PctBar value={row.average_pct} label={t('متوسط النقاط')} /></td>
                      <td className="px-3 py-2.5"><PctBar value={row.pass_rate} label={t('نسبة النجاح')} /></td>
                      <td className="px-3 py-2.5 text-end tabular-nums">{formatPct(row.exam_attendance_rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
