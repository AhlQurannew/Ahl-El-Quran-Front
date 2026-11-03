'use client';

import React from 'react';
import {
  Activity,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  HeartHandshake,
  Loader2,
  MessageSquare,
  School,
  Trophy,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import type { PlatformStatistics } from '@/app/API/admin';
import { getLocale, t } from '@/i18n';

interface PlatformOverviewProps {
  stats: PlatformStatistics | null;
  isLoading: boolean;
}

interface Indicator {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone: string;
}

/** Platform-wide indicators an administrator checks first: reach, engagement and activity. */
export const PlatformOverview: React.FC<PlatformOverviewProps> = ({ stats, isLoading }) => {
  const number = (value: number) => value.toLocaleString(getLocale());

  const indicators: Indicator[] = stats
    ? [
        { label: t('الطلاب'), value: number(stats.students), icon: <Users size={18} />, tone: 'bg-emerald-50 text-emerald-700' },
        { label: t('المعلمين'), value: number(stats.teachers), icon: <GraduationCap size={18} />, tone: 'bg-sky-50 text-sky-700' },
        { label: t('المشرفين'), value: number(stats.supervisors), icon: <UserCheck size={18} />, tone: 'bg-rose-50 text-rose-700' },
        { label: t('أولياء الأمور'), value: number(stats.guardians), icon: <HeartHandshake size={18} />, tone: 'bg-violet-50 text-violet-700' },
        { label: t('الحلقات'), value: number(stats.lectures), icon: <BookOpen size={18} />, tone: 'bg-amber-50 text-amber-700' },
        {
          label: t('نسبة الحضور (30 يوماً)'),
          value: stats.attendance_rate_30d === null ? '—' : `${stats.attendance_rate_30d.toLocaleString(getLocale())}%`,
          hint: t('{count} سجل حضور', { count: number(stats.attendance_records_30d) }),
          icon: <CalendarCheck size={18} />,
          tone: 'bg-teal-50 text-teal-700',
        },
        { label: t('إنجازات مسجلة (30 يوماً)'), value: number(stats.achievements_30d), icon: <Activity size={18} />, tone: 'bg-green-50 text-green-700' },
        { label: t('رسائل (7 أيام)'), value: number(stats.messages_7d), icon: <MessageSquare size={18} />, tone: 'bg-blue-50 text-blue-700' },
        { label: t('مدارس جديدة (30 يوماً)'), value: number(stats.new_schools_30d), icon: <School size={18} />, tone: 'bg-orange-50 text-orange-700' },
        {
          label: t('حسابات غير نشطة'),
          value: number(stats.inactive_accounts),
          hint: t('بانتظار التفعيل أو معطّلة'),
          icon: <UserX size={18} />,
          tone: 'bg-gray-100 text-gray-600',
        },
      ]
    : [];

  return (
    <section aria-labelledby="platform-overview-heading" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="platform-overview-heading" className="text-lg font-bold text-gray-900">{t('نظرة عامة على المنصة')}</h3>
          <p className="text-sm text-gray-500">{t('مؤشرات جميع المدارس في مكان واحد')}</p>
        </div>
        {stats?.most_active_school && (
          <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <Trophy size={16} aria-hidden="true" />
            {t('المدرسة الأكثر نشاطاً: {name} ({count} إنجاز)', {
              name: stats.most_active_school.name,
              count: number(stats.most_active_school.achievements),
            })}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: '#C8963E' }} />
        </div>
      ) : !stats ? (
        <p className="py-6 text-center text-sm text-gray-400">{t('تعذر تحميل الإحصاءات')}</p>
      ) : (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {indicators.map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-100 p-4">
              <dt className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.tone}`} aria-hidden="true">{item.icon}</span>
                {item.label}
              </dt>
              <dd className="mt-2 text-2xl font-bold text-gray-900">{item.value}</dd>
              {item.hint && <dd className="text-xs text-gray-400">{item.hint}</dd>}
            </div>
          ))}
        </dl>
      )}
    </section>
  );
};
