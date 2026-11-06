'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, ClipboardList, Layers, Loader2, Trophy } from 'lucide-react';
import examsAPI, { type Exam, type ExamOverview } from '@/app/API/exams';
import { ExamPhaseBadge, PctBar, RankPill, formatExamDate, formatMark, formatPct } from '@/components/exams/examUi';
import { useLang } from '@/i18n/I18nProvider';
import { t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';
import { useAuthStore } from '@/store/authStore';

/** Exams and specialities summary for the chief supervisor, supervisor and teacher dashboards. */
export function ExamsPanel() {
  const { lang } = useLang();
  const isTeacher = useAuthStore((state) => state.user?.role === 'TEACHER');
  const [overview, setOverview] = useState<ExamOverview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    examsAPI.getOverview()
      .then((data) => { if (active) setOverview(data); })
      .catch((err) => { if (active) setError(describeError(err, t('تعذر تحميل ملخص الامتحانات'))); });
    return () => { active = false; };
  }, []);

  const lectureName = (l: { lecture_name_ar: string; lecture_name_en?: string | null }) =>
    lang !== 'ar' && l.lecture_name_en ? l.lecture_name_en : l.lecture_name_ar;

  const examRow = (exam: Exam, showResult: boolean) => (
    <li key={exam.id}>
      <Link href={`/exams/${exam.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-gray-50">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{exam.title}</p>
          <p className="truncate text-xs text-gray-500">{formatExamDate(exam.exam_date)} · {lectureName(exam)}</p>
        </div>
        {showResult && exam.stats.graded > 0 ? (
          <div className="w-28 shrink-0"><PctBar value={exam.stats.average_pct} label={t('المعدل')} /></div>
        ) : (
          <ExamPhaseBadge exam={exam} className="shrink-0" />
        )}
      </Link>
    </li>
  );

  return (
    <section aria-labelledby="exams-panel-title">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 id="exams-panel-title" className="text-sm font-bold text-gray-500">{t('الامتحانات والتخصصات')}</h3>
        <Link href="/exams" className="text-xs font-semibold text-emerald-700 hover:underline">{t('كل الامتحانات')}</Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : !overview ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-10"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'الامتحانات', value: String(overview.exam_count), hint: t('{count} قادم', { count: overview.upcoming_count }), icon: ClipboardList },
              { label: 'متوسط النقاط', value: formatPct(overview.average_pct), hint: t('{count} نتيجة', { count: overview.graded_results }), icon: Trophy },
              { label: 'نسبة النجاح', value: formatPct(overview.pass_rate), hint: t('من الطلاب المنقطين'), icon: Trophy },
              { label: 'التخصصات', value: String(overview.speciality_count), hint: t('معدلات مرجحة بالمعاملات'), icon: Layers },
            ].map(({ label, value, hint, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>{t(label)}</span><Icon size={15} className="text-gray-400" aria-hidden="true" />
                </div>
                <p className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900">{value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <h4 className="mb-1 flex items-center gap-1.5 px-2 text-sm font-semibold text-gray-800"><CalendarClock size={15} aria-hidden="true" />{t('الامتحانات القادمة')}</h4>
              {overview.upcoming.length === 0
                ? <p className="px-2 py-3 text-sm text-gray-500">{t('لا توجد امتحانات قادمة.')}</p>
                : <ul>{overview.upcoming.map((exam) => examRow(exam, false))}</ul>}
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <h4 className="mb-1 flex items-center gap-1.5 px-2 text-sm font-semibold text-gray-800"><ClipboardList size={15} aria-hidden="true" />{t('آخر الامتحانات')}</h4>
              {overview.recent.length === 0
                ? <p className="px-2 py-3 text-sm text-gray-500">{t('لا توجد امتحانات بعد.')} <Link href="/exams" className="font-semibold text-emerald-700 underline">{t('إضافة امتحان')}</Link></p>
                : <ul>{overview.recent.map((exam) => examRow(exam, true))}</ul>}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800"><Layers size={15} aria-hidden="true" />{t('التخصصات')}</h4>
              <Link href="/specialities" className="text-xs font-semibold text-emerald-700 hover:underline">{isTeacher ? t('عرض التخصصات') : t('إدارة التخصصات')}</Link>
            </div>
            {overview.specialities.length === 0 ? (
              <p className="text-sm text-gray-500">{t('لا توجد تخصصات بعد')}</p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {overview.specialities.map((s) => (
                  <li key={s.speciality_id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-gray-900">{s.name}</p>
                      {s.is_common && <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">{t('جذع مشترك')}</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{t('{count} طالب', { count: s.student_count })} · {t('{count} حلقة', { count: s.circle_count })}</p>
                    <div className="mt-2"><PctBar value={s.average_pct} label={t('المعدل المرجح')} /></div>
                    {s.top.length > 0 && (
                      <ol className="mt-2 space-y-1">
                        {s.top.map((row) => (
                          <li key={row.student_id} className="flex items-center gap-2 text-xs">
                            <RankPill rank={row.rank} />
                            <span className="min-w-0 flex-1 truncate text-gray-800">{row.name}</span>
                            <span className="font-semibold tabular-nums text-gray-900">{formatMark(row.average_20)}/20</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
