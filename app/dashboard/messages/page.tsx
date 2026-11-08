'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Loader2, MessageSquare, School, Search, ShieldCheck } from 'lucide-react';
import { STAFF_ROOM } from '@/utils/chatSchool';
import { AppLayout } from '@/components/layout/AppLayout';
import { MessagesPage } from '@/components/messages/MessagesPage';
import adminAPI, { schoolImageSrc } from '@/app/API/admin';
import { normalizeSearch } from '@/components/ui/SearchableSelect';
import { useAdminTheme } from '@/utils/adminTheme';
import { t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';
import { cn } from '@/utils/cn';

interface SchoolRow {
  id: number;
  school_name: string;
  president_name: string;
  student_count: number;
  image_url?: string | null;
}

/** Admin / inspector chat: pick a school on the side, talk in its room without entering the school. */
export default function AdminMessagesPage() {
  const theme = useAdminTheme();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SchoolRow | null>(null);
  const staffRoom: SchoolRow = { id: STAFF_ROOM, school_name: t('المسؤول والمفتشون'), president_name: '', student_count: 0 };

  useEffect(() => {
    let active = true;
    adminAPI.getAllSchools()
      .then((data: { schools?: SchoolRow[] }) => { if (active) setSchools(data?.schools ?? []); })
      .catch((err: unknown) => { if (active) setError(describeError(err, t('فشل تحميل المدارس'))); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const shown = useMemo(() => {
    const q = normalizeSearch(query);
    return q ? schools.filter((s) => normalizeSearch(`${s.school_name} ${s.president_name}`).includes(q)) : schools;
  }, [schools, query]);

  return (
    <AppLayout title="المحادثات" breadcrumb="لوحة التحكم / المحادثات">
      <div className="mx-auto grid h-[calc(100dvh-140px)] max-w-7xl gap-4 sm:h-[calc(100dvh-170px)] lg:grid-cols-[18rem_1fr]">
        {/* School list (hidden on phones once a school is open) */}
        <aside className={cn('flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm', selected && 'hidden lg:flex')}>
          <div className="border-b border-gray-100 p-3">
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
              <MessageSquare size={16} style={{ color: theme.primary }} aria-hidden="true" /> {t('اختر مدرسة للتواصل معها')}
            </p>
            <label className="relative block">
              <span className="sr-only">{t('بحث')}</span>
              <Search size={15} className="pointer-events-none absolute inset-y-0 start-3 my-auto text-gray-400" aria-hidden="true" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('ابحث عن مدرسة...')}
                className="w-full rounded-lg border border-gray-200 py-2 pe-2 ps-8 text-sm focus:border-gray-400 focus:outline-none" />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {/* Staff room: the administrator and the inspectors only */}
            <button
              type="button"
              onClick={() => setSelected(staffRoom)}
              aria-current={selected?.id === STAFF_ROOM ? 'true' : undefined}
              className={cn('mb-2 flex w-full items-center gap-3 rounded-xl border p-2 text-start transition-colors',
                selected?.id === STAFF_ROOM ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50')}
            >
              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', selected?.id === STAFF_ROOM ? 'bg-white/20' : 'bg-indigo-600 text-white')}>
                <ShieldCheck size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className={cn('block truncate text-sm font-semibold', selected?.id === STAFF_ROOM ? 'text-white' : 'text-indigo-900')}>{t('المسؤول والمفتشون')}</span>
                <span className={cn('block truncate text-xs', selected?.id === STAFF_ROOM ? 'text-white/80' : 'text-indigo-700/80')}>{t('غرفة خاصة لا تراها المدارس')}</span>
              </span>
            </button>
            <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t('المدارس')}</p>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" size={22} /></div>
            ) : error ? (
              <p role="alert" className="p-3 text-sm text-red-700">{error}</p>
            ) : shown.length === 0 ? (
              <p className="p-3 text-center text-sm text-gray-500">{t('لا توجد نتائج مطابقة')}</p>
            ) : (
              <ul className="space-y-1">
                {shown.map((school) => {
                  const active = selected?.id === school.id;
                  return (
                    <li key={school.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(school)}
                        aria-current={active ? 'true' : undefined}
                        className={cn('flex w-full items-center gap-3 rounded-xl p-2 text-start transition-colors', active ? 'text-white' : 'hover:bg-gray-50')}
                        style={active ? { backgroundColor: theme.primary } : undefined}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                          {school.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element -- image served by the API
                            <img src={schoolImageSrc(school.image_url) ?? ''} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <School size={18} className="text-gray-400" aria-hidden="true" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className={cn('block truncate text-sm font-semibold', active ? 'text-white' : 'text-gray-900')}>{school.school_name}</span>
                          <span className={cn('block truncate text-xs', active ? 'text-white/80' : 'text-gray-500')}>{school.president_name}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Chat room of the selected school */}
        <section className={cn('flex min-h-0 flex-col', !selected && 'hidden lg:flex')}>
          {selected ? (
            <>
              <div className="mb-2 flex items-center gap-2">
                <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden" aria-label={t('رجوع')}>
                  <ArrowRight size={18} className="ltr:rotate-180" />
                </button>
                <p className="truncate text-sm font-semibold text-gray-800">
                  {selected.id === STAFF_ROOM ? t('غرفة المسؤول والمفتشين') : `${t('غرفة المحادثة')} · ${selected.school_name}`}
                </p>
              </div>
              <div className="min-h-0 flex-1">
                {/* key: a fresh room (history + socket) per school */}
                <MessagesPage key={selected.id} schoolId={selected.id} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
              <MessageSquare size={40} className="mb-3 text-gray-300" />
              <p className="font-medium text-gray-700">{t('اختر مدرسة من القائمة لعرض محادثتها')}</p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">{t('ترسل الرسائل باسمك إلى غرفة المحادثة الخاصة بالمدرسة، دون الحاجة إلى الدخول إليها.')}</p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
