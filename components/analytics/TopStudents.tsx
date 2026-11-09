'use client';

import { formatThumn } from '@/utils/thumn';
import { useState } from 'react';
import { Award } from 'lucide-react';
import type { SchoolTopStudents, TopStudent } from '@/app/API/analytics';
import { RankPill } from '@/components/exams/examUi';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';
import { entityName } from './insights';
import { formatNumber, formatPercent } from './theme';

const MODES = [
  { key: 'internal', label: 'داخلي (دوام كامل)', tone: 'border-emerald-200 bg-emerald-50/50', bar: 'bg-emerald-600', head: 'text-emerald-900' },
  { key: 'external', label: 'خارجي (دوام جزئي)', tone: 'border-sky-200 bg-sky-50/50', bar: 'bg-sky-600', head: 'text-sky-900' },
] as const;

type SexFilter = 'all' | 'male' | 'female';
const SEX_OPTIONS: [SexFilter, string][] = [['all', 'الكل'], ['male', 'ذكور'], ['female', 'إناث']];

/** Top students of each school, split by schooling mode; clicking a student opens their analytics. */
export function TopStudents({ schools, lang, onSelect }: {
  schools: SchoolTopStudents[];
  lang: string;
  onSelect: (studentId: number) => void;
}) {
  const [sex, setSex] = useState<SexFilter>('all');
  const listFor = (school: SchoolTopStudents, mode: 'internal' | 'external'): TopStudent[] =>
    sex === 'all' ? school[mode] : school[sex]?.[mode] ?? [];

  return (
    <section aria-labelledby="top-heading" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="top-heading" className="flex items-center gap-2 text-sm font-bold text-gray-900 sm:text-base">
          <Award size={18} className="text-amber-500" aria-hidden="true" />
          {t('الطلبة المتميزون')}
        </h2>
        <div role="radiogroup" aria-label={t('الجنس')} className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
          {SEX_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={sex === value}
              onClick={() => setSex(value)}
              className={cn('rounded-lg px-3 py-1 text-xs font-semibold transition-colors',
                sex === value ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50')}
            >
              {t(label)}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-4 mt-1 text-xs text-gray-500">
        {t('أفضل 5 طلبة في كل مدرسة حسب نظام الدراسة. النتيجة = 35% الحضور + 35% الحفظ (مقارنة بأفضل طالب في نفس الفئة) + 30% معدل الامتحانات، خلال الفترة المحددة.')}
      </p>
      <div className="space-y-4">
        {schools.map((school) => (
          <article key={school.school_id} className="min-w-0 rounded-xl border border-gray-100 p-2 sm:p-4">
            {schools.length > 1 && <h3 className="mb-3 text-sm font-semibold text-gray-800">{school.school ?? '—'}</h3>}
            <div className="grid gap-3 lg:grid-cols-2">
              {MODES.map((mode) => {
                const list: TopStudent[] = listFor(school, mode.key);
                return (
                  <div key={mode.key} className={cn('min-w-0 rounded-xl border p-2.5 sm:p-3', mode.tone)}>
                    <p className={cn('mb-2 text-xs font-bold', mode.head)}>{t(mode.label)}</p>
                    {list.length === 0 ? (
                      <p className="py-3 text-center text-xs text-gray-500">{t('لا توجد بيانات كافية')}</p>
                    ) : (
                      <ol className="space-y-1.5">
                        {list.map((s) => (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => onSelect(s.id)}
                              className="flex w-full min-w-0 items-center gap-2 rounded-lg bg-white px-2 py-2 text-start shadow-sm ring-1 ring-gray-100 hover:ring-gray-300 sm:gap-2.5 sm:px-2.5"
                            >
                              <RankPill rank={s.rank} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-gray-900">{entityName(s, lang)}</span>
                                <span className="block truncate text-[11px] text-gray-500">
                                  {t('حضور {rate}', { rate: formatPercent(s.attendance_rate) })}
                                  {' · '}{formatThumn(s.thumn)}
                                  {' · '}{s.exam_average == null ? t('بدون امتحانات') : t('امتحانات {avg}', { avg: formatPercent(s.exam_average) })}
                                </span>
                              </span>
                              <span className="flex w-14 shrink-0 flex-col items-end gap-1 sm:w-20">
                                <span className="text-sm font-bold tabular-nums text-gray-900">{formatNumber(s.score, 1)}</span>
                                <span className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                                  <span className={cn('block h-full rounded-full', mode.bar)} style={{ width: `${Math.min(100, s.score)}%` }} />
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
