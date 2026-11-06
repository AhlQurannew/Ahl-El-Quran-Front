'use client';

import { SearchableSelect, normalizeSearch } from '@/components/ui/SearchableSelect';
import { Pagination } from '@/components/ui/Pagination';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, ClipboardList, Layers, Loader2, Plus, Search, Trophy, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { ExamFormModal } from '@/components/exams/ExamFormModal';
import { ExamPhaseBadge, ExamTypeBadge, PctBar, RankPill, EXAM_TYPE_LABELS, examPhase, formatExamDate, formatMark, formatPct, type ExamPhase } from '@/components/exams/examUi';
import examsAPI, { type Exam, type ExamLecture, type ExamType, type ExamOverview, type SpecialityStanding } from '@/app/API/exams';
import { useLang } from '@/i18n/I18nProvider';
import { t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';
import { cn } from '@/utils/cn';

type Tab = 'exams' | 'specialities';
type SortKey = 'date_desc' | 'date_asc' | 'avg_desc' | 'avg_asc';

export default function ExamsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const [tab, setTab] = useState<Tab>('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [lectures, setLectures] = useState<ExamLecture[]>([]);
  const [overview, setOverview] = useState<ExamOverview | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [loadedToken, setLoadedToken] = useState(-1);
  const loading = loadedToken === -1;
  const [loadError, setLoadError] = useState('');
  const [lectureFilter, setLectureFilter] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<'' | ExamPhase>('');
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | ExamType>('');
  const [sort, setSort] = useState<SortKey>('date_desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Any filter change goes back to the first page.
  const filter = <T,>(setter: (value: T) => void) => (value: T) => { setter(value); setPage(1); };
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success' as 'success' | 'error' | 'info', message: '' });

  const load = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    Promise.all([examsAPI.listExams(), examsAPI.listLectures(), examsAPI.getOverview()])
      .then(([list, circles, ov]) => {
        if (!active) return;
        setExams(list);
        setLectures(circles);
        setOverview(ov);
        setLoadError('');
      })
      .catch((error) => { if (active) setLoadError(describeError(error, t('تعذر تحميل الامتحانات'))); })
      .finally(() => { if (active) setLoadedToken(reloadToken); });
    return () => { active = false; };
  }, [reloadToken]);

  const lectureName = (l: { lecture_name_ar: string; lecture_name_en?: string | null }) =>
    lang !== 'ar' && l.lecture_name_en ? l.lecture_name_en : l.lecture_name_ar;

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    const list = exams.filter((exam) =>
      (!lectureFilter || String(exam.lecture_id) === lectureFilter)
      && (!phaseFilter || examPhase(exam) === phaseFilter)
      && (!typeFilter || exam.exam_type === typeFilter)
      && (!dateFrom || exam.exam_date >= dateFrom)
      && (!dateTo || exam.exam_date <= dateTo)
      && (!q || normalizeSearch(exam.title).includes(q) || normalizeSearch(exam.lecture_name_ar).includes(q)
        || normalizeSearch(exam.lecture_name_en ?? '').includes(q)));
    const avg = (e: Exam) => e.stats.average_pct ?? -1;
    const byDate = (a: Exam, b: Exam) => a.exam_date.localeCompare(b.exam_date) || a.id - b.id;
    return [...list].sort({
      date_desc: (a: Exam, b: Exam) => byDate(b, a),
      date_asc: byDate,
      avg_desc: (a: Exam, b: Exam) => avg(b) - avg(a) || byDate(b, a),
      avg_asc: (a: Exam, b: Exam) => avg(a) - avg(b) || byDate(b, a),
    }[sort]);
  }, [exams, lectureFilter, phaseFilter, typeFilter, dateFrom, dateTo, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasFilters = !!(query || lectureFilter || phaseFilter || typeFilter || dateFrom || dateTo);
  const resetFilters = () => {
    setQuery(''); setLectureFilter(''); setPhaseFilter(''); setTypeFilter(''); setDateFrom(''); setDateTo(''); setPage(1);
  };

  const create = async (payload: Parameters<typeof examsAPI.createExam>[0], includeStudents: boolean) => {
    const created = await examsAPI.createExam(payload, includeStudents);
    setIsFormOpen(false);
    setToast({ visible: true, type: 'success', message: t('تمت إضافة الامتحان {name}', { name: created.title }) });
    router.push(`/exams/${created.id}`);
  };

  const tiles = overview ? [
    { label: 'الامتحانات', value: String(overview.exam_count), hint: t('{count} قادم', { count: overview.upcoming_count }), icon: ClipboardList },
    { label: 'متوسط النقاط', value: formatPct(overview.average_pct), hint: t('{count} نتيجة', { count: overview.graded_results }), icon: Trophy },
    { label: 'نسبة النجاح', value: formatPct(overview.pass_rate), hint: t('من الطلاب المنقطين'), icon: Users },
    { label: 'الحضور في الامتحانات', value: formatPct(overview.attendance_rate), hint: t('حاضر / المسجلون'), icon: BookOpen },
  ] : [];

  return (
    <AppLayout title="الامتحانات" breadcrumb="الشؤون التعليمية / الامتحانات">
      <Toast type={toast.type} message={toast.message} isVisible={toast.visible} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
      <div className="mx-auto max-w-6xl space-y-5 pb-8">
        <header className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><ClipboardList size={22} /></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('الامتحانات')}</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {t('أنشئ امتحاناً لحلقة، سجّل حضور الطلاب ونقاطهم وملاحظاتك، واطّلع على الترتيب. تُحسب معدلات الأقسام والتخصصات بمعاملات كل حلقة.')}
              </p>
            </div>
          </div>
          {lectures.length > 0 && (
            <Button size="sm" onClick={() => setIsFormOpen(true)} className="shrink-0">
              <Plus size={16} /> {t('إضافة امتحان')}
            </Button>
          )}
        </header>

        {loadError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {loadError}
            <button type="button" onClick={load} className="font-semibold underline">{t('إعادة المحاولة')}</button>
          </div>
        )}

        {tiles.length > 0 && (
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label={t('ملخص الامتحانات')}>
            {tiles.map(({ label, value, hint, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2 text-xs font-medium text-gray-500">
                  <span>{t(label)}</span>
                  <Icon size={15} className="text-gray-400" aria-hidden="true" />
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">{value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
              </div>
            ))}
          </section>
        )}

        <div role="tablist" aria-label={t('الامتحانات')} className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {([['exams', 'قائمة الامتحانات', ClipboardList], ['specialities', 'ترتيب الأقسام والتخصصات', Layers]] as const).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                tab === value ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50')}
            >
              <Icon size={15} aria-hidden="true" /> {t(label)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {t('جارٍ التحميل…')}</div>
        ) : tab === 'exams' ? (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">{t('بحث')}</span>
                <Search size={16} className="pointer-events-none absolute inset-y-0 start-3 my-auto text-gray-400" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => filter(setQuery)(e.target.value)}
                  placeholder={t('ابحث عن امتحان أو حلقة...')}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pe-3 ps-9 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
              </label>
              <SearchableSelect
                size="sm"
                className="sm:w-56"
                options={[{ value: '', label: t('كل الحلقات') }, ...lectures.map((l) => ({ value: l.lecture_id, label: lectureName(l), keywords: `${l.lecture_name_ar} ${l.lecture_name_en ?? ''}` }))]}
                value={lectureFilter}
                onValueChange={filter(setLectureFilter)}
                ariaLabel={t('الحلقة')}
              />
              <select
                value={phaseFilter}
                onChange={(e) => filter(setPhaseFilter)(e.target.value as '' | ExamPhase)}
                aria-label={t('الحالة')}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm sm:w-48"
              >
                <option value="">{t('كل الحالات')}</option>
                <option value="upcoming">{t('قادم')}</option>
                <option value="pending">{t('بانتظار النقاط')}</option>
                <option value="done">{t('مكتمل')}</option>
              </select>
            </div>

            <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                {t('من تاريخ')}
                <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => filter(setDateFrom)(e.target.value)}
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                {t('إلى تاريخ')}
                <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => filter(setDateTo)(e.target.value)}
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                {t('نوع الامتحان')}
                <select value={typeFilter} onChange={(e) => filter(setTypeFilter)(e.target.value as '' | ExamType)}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900">
                  <option value="">{t('كل الأنواع')}</option>
                  {(Object.keys(EXAM_TYPE_LABELS) as ExamType[]).map((type) => <option key={type} value={type}>{t(EXAM_TYPE_LABELS[type])}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                {t('الترتيب حسب')}
                <select value={sort} onChange={(e) => filter(setSort)(e.target.value as SortKey)}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900">
                  <option value="date_desc">{t('الأحدث أولاً')}</option>
                  <option value="date_asc">{t('الأقدم أولاً')}</option>
                  <option value="avg_desc">{t('أعلى معدل')}</option>
                  <option value="avg_asc">{t('أدنى معدل')}</option>
                </select>
              </label>
              {hasFilters && (
                <button type="button" onClick={resetFilters} className="ms-auto rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                  {t('إعادة تعيين الفلاتر')}
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
                <ClipboardList size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-700">{exams.length === 0 ? t('لا توجد امتحانات بعد') : t('لا توجد نتائج مطابقة')}</p>
                {exams.length === 0 && (
                  <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                    {lectures.length === 0 ? t('لا توجد حلقات يمكنك إنشاء امتحان لها.') : t('ابدأ بإضافة امتحان لإحدى الحلقات.')}
                  </p>
                )}
              </div>
            ) : (
              <>
              <ul className="grid gap-3 md:grid-cols-2">
                {visible.map((exam) => (
                  <li key={exam.id}>
                    <Link href={`/exams/${exam.id}`} className="block h-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="truncate font-bold text-gray-900">{exam.title}</h2>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                            <span>{formatExamDate(exam.exam_date)}</span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1"><BookOpen size={12} aria-hidden="true" />{lectureName(exam)}</span>
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <ExamPhaseBadge exam={exam} />
                          <ExamTypeBadge type={exam.exam_type} />
                        </div>
                      </div>
                      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-lg bg-gray-50 p-2">
                          <dt className="text-gray-500">{t('المعدل')}</dt>
                          <dd className="mt-0.5 font-bold tabular-nums text-gray-900">{exam.stats.average == null ? '—' : `${formatMark(exam.stats.average)} / ${formatMark(exam.max_mark)}`}</dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-2">
                          <dt className="text-gray-500">{t('الحضور')}</dt>
                          <dd className="mt-0.5 font-bold tabular-nums text-gray-900">{exam.stats.present}/{exam.stats.total}</dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-2">
                          <dt className="text-gray-500">{t('المنقطون')}</dt>
                          <dd className="mt-0.5 font-bold tabular-nums text-gray-900">{exam.stats.graded}/{exam.stats.present}</dd>
                        </div>
                      </dl>
                      <div className="mt-3">
                        <p className="mb-1 text-[11px] text-gray-500">{t('نسبة النجاح')}</p>
                        <PctBar value={exam.stats.pass_rate} label={t('نسبة النجاح')} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                total={filtered.length}
                onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0 }); }}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
              />
              </>
            )}
          </>
        ) : (
          <SpecialityStandings overview={overview} />
        )}
      </div>

      <ExamFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} lectures={lectures} exam={null} onSubmit={create} />
    </AppLayout>
  );
}

function SpecialityStandings({ overview }: { overview: ExamOverview | null }) {
  const { lang } = useLang();
  const specialities = overview?.specialities ?? [];
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected ?? specialities[0]?.speciality_id ?? null;
  const [standing, setStanding] = useState<SpecialityStanding | null>(null);
  const [error, setError] = useState('');
  const loadingStanding = current != null && standing?.speciality_id !== current && !error;

  useEffect(() => {
    if (current == null) return;
    let active = true;
    examsAPI.getStandings(current)
      .then((data) => { if (active) { setStanding(data); setError(''); } })
      .catch((err) => { if (active) setError(describeError(err, t('تعذر تحميل الترتيب'))); });
    return () => { active = false; };
  }, [current]);

  if (specialities.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
        <Layers size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="font-medium text-gray-700">{t('لا توجد أقسام أو تخصصات بعد')}</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{t('أضف الأقسام والتخصصات ومعاملات حلقاتها من صفحة الأقسام والتخصصات لعرض معدلات الطلاب وترتيبهم.')}</p>
      </div>
    );
  }

  const lectureName = (l: { lecture_name_ar: string; lecture_name_en?: string | null }) =>
    lang !== 'ar' && l.lecture_name_en ? l.lecture_name_en : l.lecture_name_ar;

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <ul className="space-y-2" aria-label={t('الأقسام والتخصصات')}>
        {specialities.map((s) => (
          <li key={s.speciality_id}>
            <button
              type="button"
              onClick={() => { setSelected(s.speciality_id); setError(''); }}
              aria-pressed={current === s.speciality_id}
              className={cn('w-full rounded-xl border p-3 text-start transition',
                current === s.speciality_id ? 'border-emerald-400 bg-emerald-50/60' : 'border-gray-200 bg-white hover:border-gray-300')}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold text-gray-900">{s.name}</span>
                {s.is_common && <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">{t('جذع مشترك')}</span>}
              </span>
              <span className="mt-1 block text-xs text-gray-500">{t('{count} طالب', { count: s.student_count })} · {t('{count} حلقة', { count: s.circle_count })}</span>
              <span className="mt-2 block"><PctBar value={s.average_pct} label={t('المعدل المرجح')} /></span>
            </button>
          </li>
        ))}
      </ul>

      <section className="min-w-0 rounded-2xl border border-gray-200 bg-white shadow-sm">
        {error ? (
          <p role="alert" className="p-4 text-sm text-red-700">{error}</p>
        ) : loadingStanding || !standing ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={18} /> {t('جارٍ التحميل…')}</div>
        ) : (
          <>
            <div className="border-b border-gray-100 p-4">
              <h2 className="font-bold text-gray-900">{t('ترتيب طلاب {name}', { name: standing.speciality_name })}</h2>
              <p className="mt-1 text-xs text-gray-500">{t('المعدل المرجح = مجموع (نسبة الحلقة × معاملها) ÷ مجموع معاملات الحلقات المنقطة.')}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {standing.circles.map((c) => (
                  <span key={c.lecture_id} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                    {lectureName(c)} · {t('المعامل')} {formatMark(c.coefficient)}
                  </span>
                ))}
              </div>
            </div>
            {standing.rows.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">{t('لا يوجد طلاب في هذا القسم/التخصص بعد.')}</p>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full min-w-[32rem] text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th scope="col" className="w-16 px-3 py-2 text-start font-medium">{t('الترتيب')}</th>
                      <th scope="col" className="px-3 py-2 text-start font-medium">{t('الطالب')}</th>
                      <th scope="col" className="px-3 py-2 text-end font-medium">{t('المعدل / 20')}</th>
                      <th scope="col" className="w-48 px-3 py-2 text-start font-medium">{t('النسبة')}</th>
                      <th scope="col" className="px-3 py-2 text-end font-medium">{t('حلقات منقطة')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standing.rows.map((row) => (
                      <tr key={row.student_id} className="border-t border-gray-100">
                        <td className="px-3 py-2"><RankPill rank={row.rank} /></td>
                        <td className="px-3 py-2">
                          <span className="block font-medium text-gray-900">{row.name}</span>
                          {row.registration_number && <span className="block text-xs text-gray-400"><bdi>{row.registration_number}</bdi></span>}
                        </td>
                        <td className="px-3 py-2 text-end font-semibold tabular-nums text-gray-900">{formatMark(row.average_20)}</td>
                        <td className="px-3 py-2"><PctBar value={row.average_pct} /></td>
                        <td className="px-3 py-2 text-end tabular-nums text-gray-600">{row.circles_graded}/{standing.circles.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
