'use client';

import { SearchableSelect, normalizeSearch } from '@/components/ui/SearchableSelect';
import { Pagination } from '@/components/ui/Pagination';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, CalendarClock, CalendarDays, ChevronDown, ChevronLeft, ClipboardList, Layers, Loader2, Plus, Search, SlidersHorizontal, Trophy, Users } from 'lucide-react';
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [upcomingOpen, setUpcomingOpen] = useState(false);
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

  // Upcoming exams fold into their own panel (unless the user filters by status); the rest is paginated.
  const splitUpcoming = !phaseFilter;
  const upcoming = splitUpcoming
    ? filtered.filter((e) => examPhase(e) === 'upcoming').sort((a, b) => a.exam_date.localeCompare(b.exam_date))
    : [];
  const main = splitUpcoming ? filtered.filter((e) => examPhase(e) !== 'upcoming') : filtered;
  const pageCount = Math.max(1, Math.ceil(main.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = main.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasFilters = !!(query || lectureFilter || phaseFilter || typeFilter || dateFrom || dateTo || sort !== 'date_desc');
  const advancedCount = [phaseFilter, typeFilter, dateFrom, dateTo].filter(Boolean).length + (sort !== 'date_desc' ? 1 : 0);
  const resetFilters = () => {
    setQuery(''); setLectureFilter(''); setPhaseFilter(''); setTypeFilter(''); setDateFrom(''); setDateTo(''); setSort('date_desc'); setPage(1);
  };

  const create = async (payload: Parameters<typeof examsAPI.createExam>[0], includeStudents: boolean) => {
    const created = await examsAPI.createExam(payload, includeStudents);
    setIsFormOpen(false);
    setToast({ visible: true, type: 'success', message: t('تمت إضافة الامتحان {name}', { name: created.title }) });
    router.push(`/exams/${created.id}`);
  };

  const tiles = overview ? [
    { label: 'الامتحانات', value: String(overview.exam_count), hint: t('{count} قادم', { count: overview.upcoming_count }), icon: ClipboardList, tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
    { label: 'متوسط النقاط', value: formatPct(overview.average_pct), hint: t('{count} نتيجة', { count: overview.graded_results }), icon: Trophy, tone: 'bg-amber-50 text-amber-700 ring-amber-100' },
    { label: 'نسبة النجاح', value: formatPct(overview.pass_rate), hint: t('من الطلاب المنقطين'), icon: Users, tone: 'bg-sky-50 text-sky-700 ring-sky-100' },
    { label: 'الحضور في الامتحانات', value: formatPct(overview.attendance_rate), hint: t('حاضر / المسجلون'), icon: BookOpen, tone: 'bg-violet-50 text-violet-700 ring-violet-100' },
  ] : [];

  return (
    <AppLayout title="الامتحانات" breadcrumb="الشؤون التعليمية / الامتحانات">
      <Toast type={toast.type} message={toast.message} isVisible={toast.visible} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
      <div className="mx-auto max-w-6xl space-y-5 pb-8">
        <header className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-l from-emerald-50 via-white to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-sm"><ClipboardList size={22} /></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('الامتحانات')}</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-600">
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
            {tiles.map(({ label, value, hint, icon: Icon, tone }) => (
              <div key={label} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1', tone)} aria-hidden="true">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">{t(label)}</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{hint}</p>
                </div>
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
            {/* Essential filters only; the rest folds into «الفلاتر» */}
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
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                aria-controls="exam-filters"
                className={cn('flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                  filtersOpen || advancedCount > 0 ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50')}
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                {t('الفلاتر')}
                {advancedCount > 0 && <span className="rounded-full bg-emerald-600 px-1.5 text-xs font-bold text-white">{advancedCount}</span>}
                <ChevronDown size={15} className={cn('transition-transform', filtersOpen && 'rotate-180')} aria-hidden="true" />
              </button>
            </div>

            {filtersOpen && (
              <div id="exam-filters" className="grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:grid-cols-2 lg:grid-cols-5">
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  {t('الحالة')}
                  <select value={phaseFilter} onChange={(e) => filter(setPhaseFilter)(e.target.value as '' | ExamPhase)}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900">
                    <option value="">{t('كل الحالات')}</option>
                    <option value="upcoming">{t('قادم')}</option>
                    <option value="pending">{t('بانتظار النقاط')}</option>
                    <option value="done">{t('مكتمل')}</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  {t('من تاريخ')}
                  <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => filter(setDateFrom)(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  {t('إلى تاريخ')}
                  <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => filter(setDateTo)(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  {t('نوع الامتحان')}
                  <select value={typeFilter} onChange={(e) => filter(setTypeFilter)(e.target.value as '' | ExamType)}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900">
                    <option value="">{t('كل الأنواع')}</option>
                    {(Object.keys(EXAM_TYPE_LABELS) as ExamType[]).map((type) => <option key={type} value={type}>{t(EXAM_TYPE_LABELS[type])}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  {t('الترتيب حسب')}
                  <select value={sort} onChange={(e) => filter(setSort)(e.target.value as SortKey)}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900">
                    <option value="date_desc">{t('الأحدث أولاً')}</option>
                    <option value="date_asc">{t('الأقدم أولاً')}</option>
                    <option value="avg_desc">{t('أعلى معدل')}</option>
                    <option value="avg_asc">{t('أدنى معدل')}</option>
                  </select>
                </label>
                {hasFilters && (
                  <button type="button" onClick={resetFilters} className="justify-self-start rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 sm:col-span-2 lg:col-span-5">
                    {t('إعادة تعيين الفلاتر')}
                  </button>
                )}
              </div>
            )}

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
                {upcoming.length > 0 && (
                  <section className="overflow-hidden rounded-2xl border border-sky-200 bg-sky-50/50">
                    <button
                      type="button"
                      onClick={() => setUpcomingOpen((open) => !open)}
                      aria-expanded={upcomingOpen}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start hover:bg-sky-50"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white" aria-hidden="true"><CalendarClock size={16} /></span>
                        <span>
                          <span className="block text-sm font-semibold text-sky-900">{t('الامتحانات القادمة')} ({upcoming.length})</span>
                          <span className="block text-xs text-sky-800/80">{t('أقربها: {date}', { date: formatExamDate(upcoming[0].exam_date) })}</span>
                        </span>
                      </span>
                      <ChevronDown size={18} className={cn('shrink-0 text-sky-700 transition-transform', upcomingOpen && 'rotate-180')} aria-hidden="true" />
                    </button>
                    {upcomingOpen && (
                      <ul className="divide-y divide-sky-100 border-t border-sky-100 bg-white">
                        {upcoming.map((exam) => <ExamRow key={exam.id} exam={exam} lectureName={lectureName} />)}
                      </ul>
                    )}
                  </section>
                )}

                {main.length > 0 && (
                  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <h2 className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-2.5 text-sm font-semibold text-gray-800">
                      <span>{upcoming.length > 0 ? t('الامتحانات المنجزة') : t('قائمة الامتحانات')}</span>
                      <span className="rounded-full bg-gray-200/70 px-2 py-0.5 text-xs font-medium text-gray-700">{main.length}</span>
                    </h2>
                    <ul className="divide-y divide-gray-100">
                      {visible.map((exam) => <ExamRow key={exam.id} exam={exam} lectureName={lectureName} />)}
                    </ul>
                    <Pagination
                      page={currentPage}
                      pageSize={pageSize}
                      total={main.length}
                      onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0 }); }}
                      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                      className="border-t border-gray-100 px-4 py-3"
                    />
                  </section>
                )}
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

/** Phase accent: a coloured start stripe; the badge beside it carries icon + label (never colour alone). */
const PHASE_STRIPE: Record<ExamPhase, string> = {
  upcoming: 'border-s-sky-400',
  pending: 'border-s-amber-400',
  done: 'border-s-emerald-500',
};

/** One compact exam line: what, when, which circle, then the key numbers. */
function ExamRow({ exam, lectureName }: { exam: Exam; lectureName: (l: { lecture_name_ar: string; lecture_name_en?: string | null }) => string }) {
  const phase = examPhase(exam);
  return (
    <li>
      <Link
        href={`/exams/${exam.id}`}
        className={cn('group flex flex-col gap-3 border-s-4 px-4 py-3 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-emerald-50 sm:flex-row sm:items-center', PHASE_STRIPE[phase])}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-gray-900">{exam.title}</span>
            <ExamPhaseBadge exam={exam} />
            <ExamTypeBadge type={exam.exam_type} />
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><CalendarDays size={12} aria-hidden="true" />{formatExamDate(exam.exam_date)}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1"><BookOpen size={12} aria-hidden="true" />{lectureName(exam)}</span>
          </p>
        </div>
        {phase === 'upcoming' ? (
          <p className="text-xs text-gray-500 sm:w-72 sm:text-end">{t('{count} طالب مسجل', { count: exam.stats.total })}</p>
        ) : (
          <dl className="grid grid-cols-3 gap-3 text-xs sm:w-72">
            <div>
              <dt className="text-gray-500">{t('المعدل')}</dt>
              <dd className="font-bold tabular-nums text-gray-900">{exam.stats.average == null ? '—' : `${formatMark(exam.stats.average)}/${formatMark(exam.max_mark)}`}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t('الحضور')}</dt>
              <dd className="font-bold tabular-nums text-gray-900">{exam.stats.present}/{exam.stats.total}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t('نسبة النجاح')}</dt>
              <dd><PctBar value={exam.stats.pass_rate} label={t('نسبة النجاح')} /></dd>
            </div>
          </dl>
        )}
        <ChevronLeft size={18} className="hidden shrink-0 text-gray-300 transition-colors group-hover:text-emerald-600 ltr:rotate-180 sm:block" aria-hidden="true" />
      </Link>
    </li>
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
