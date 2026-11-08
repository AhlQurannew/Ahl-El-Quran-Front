'use client';

import { SearchableSelect, normalizeSearch } from '@/components/ui/SearchableSelect';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Loader2, Pencil, Save, Search, Trash2, Trophy, UserMinus, UserPlus, Users } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import { ExamFormModal } from '@/components/exams/ExamFormModal';
import {
  ATTENDANCE_LABELS, ExamPhaseBadge, ExamTypeBadge, PctBar, RankPill, formatExamDate, formatMark, formatPct,
} from '@/components/exams/examUi';
import examsAPI, { type ExamAttendance, type ExamDetail, type ExamLecture, type ExamPayload, type ExamResultPayload } from '@/app/API/exams';
import { useLang } from '@/i18n/I18nProvider';
import { t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';
import { cn } from '@/utils/cn';

interface Row {
  student_id: number;
  name: string;
  registration_number: string | null;
  speciality_name: string | null;
  attendance: ExamAttendance;
  /** As typed */
  mark: string;
  notes: string;
}

const toRows = (exam: ExamDetail): Row[] =>
  [...exam.results]
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
    .map((r) => ({
      student_id: r.student_id, name: r.name, registration_number: r.registration_number, speciality_name: r.speciality_name,
      attendance: r.attendance, mark: r.mark == null ? '' : String(r.mark), notes: r.notes ?? '',
    }));

const parseMark = (value: string) => (value.trim() === '' ? null : Number(value.replace(',', '.')));

/** Competition ranking (1, 1, 3) of present students with a valid mark. */
const liveRanks = (rows: Row[], max: number) => {
  const graded = rows
    .map((r) => ({ id: r.student_id, mark: parseMark(r.mark) }))
    .filter((r, i): r is { id: number; mark: number } =>
      rows[i].attendance === 'present' && r.mark != null && Number.isFinite(r.mark) && r.mark >= 0 && r.mark <= max)
    .sort((a, b) => b.mark - a.mark);
  const ranks = new Map<number, number>();
  graded.forEach((r, i) => ranks.set(r.id, i > 0 && graded[i - 1].mark === r.mark ? ranks.get(graded[i - 1].id)! : i + 1));
  return ranks;
};

const ATTENDANCE_STYLES: Record<ExamAttendance, string> = {
  present: 'bg-emerald-600 text-white',
  absent: 'bg-red-600 text-white',
  excused: 'bg-amber-500 text-white',
};

export default function ExamDetailPage() {
  const params = useParams<{ id: string }>();
  const examId = Number(params.id);
  const router = useRouter();
  const confirm = useConfirm();
  const { lang } = useLang();

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  // Last saved roster: «unsaved changes» is a real difference from it, not a flag set on any click.
  const [savedRows, setSavedRows] = useState<Row[]>([]);
  const [lectures, setLectures] = useState<ExamLecture[]>([]);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'entry' | 'ranking'>('entry');
  const [candidate, setCandidate] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  // Entry list helpers: find a student, show only what still needs work, and page long rosters.
  const [rowQuery, setRowQuery] = useState('');
  const [rowFilter, setRowFilter] = useState<'all' | 'missing' | 'absent'>('all');
  const [rowPage, setRowPage] = useState(1);
  const [rowPageSize, setRowPageSize] = useState(20);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success' as 'success' | 'error' | 'info', message: '' });
  const showToast = (type: 'success' | 'error' | 'info', message: string) => setToast({ visible: true, type, message });

  const apply = (data: ExamDetail) => {
    setExam(data);
    setRows(toRows(data));
    setSavedRows(toRows(data));
  };

  useEffect(() => {
    let active = true;
    Promise.all([examsAPI.getExam(examId), examsAPI.listLectures()])
      .then(([data, circles]) => {
        if (!active) return;
        setExam(data);
        setRows(toRows(data));
        setSavedRows(toRows(data));
        setLectures(circles);
      })
      .catch((error) => { if (active) setLoadError(describeError(error, t('تعذر تحميل الامتحان'))); });
    return () => { active = false; };
  }, [examId]);

  const max = exam?.max_mark ?? 20;
  const ranks = useMemo(() => liveRanks(rows, max), [rows, max]);
  // Compared as what would be sent: order-independent, trimmed notes, mark ignored when not present.
  const dirty = useMemo(() => {
    const key = (list: Row[]) => JSON.stringify([...list]
      .map((r) => [r.student_id, r.attendance, r.attendance === 'present' ? r.mark.trim() : '', r.notes.trim()])
      .sort((a, b) => Number(a[0]) - Number(b[0])));
    return key(rows) !== key(savedRows);
  }, [rows, savedRows]);
  const editable = !!exam?.can_edit;

  // Warn before leaving with unsaved marks.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const lectureName = (l: { lecture_name_ar: string; lecture_name_en?: string | null }) =>
    lang !== 'ar' && l.lecture_name_en ? l.lecture_name_en : l.lecture_name_ar;

  const update = (studentId: number, patch: Partial<Row>) => {
    setRows((current) => current.map((r) => (r.student_id === studentId ? { ...r, ...patch } : r)));
  };

  const markError = (row: Row) => {
    if (row.attendance !== 'present' || row.mark.trim() === '') return '';
    const value = parseMark(row.mark);
    if (value == null || !Number.isFinite(value) || value < 0) return t('نقطة غير صالحة');
    if (value > max) return t('أكبر من {max}', { max: formatMark(max) });
    return '';
  };

  const live = useMemo(() => {
    const marks = rows.filter((r) => r.attendance === 'present').map((r) => parseMark(r.mark))
      .filter((m): m is number => m != null && Number.isFinite(m) && m >= 0 && m <= max);
    const present = rows.filter((r) => r.attendance === 'present').length;
    const passMark = exam?.pass_mark ?? 10;
    return {
      total: rows.length,
      present,
      absent: rows.filter((r) => r.attendance === 'absent').length,
      excused: rows.filter((r) => r.attendance === 'excused').length,
      graded: marks.length,
      average: marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : null,
      highest: marks.length ? Math.max(...marks) : null,
      passRate: marks.length ? (marks.filter((m) => m >= passMark).length / marks.length) * 100 : null,
    };
  }, [rows, max, exam?.pass_mark]);

  const addCandidate = async () => {
    const student = exam?.candidates.find((c) => String(c.student_id) === candidate);
    if (!student) return;
    const ok = await confirm({ title: t('تأكيد الإضافة'), message: t('هل أنت متأكد من إضافة {name} إلى هذا الامتحان؟', { name: student.name }), confirmText: t('نعم، أضف') });
    if (!ok) return;
    setRows((current) => [...current, {
      student_id: student.student_id, name: student.name, registration_number: student.registration_number, speciality_name: null,
      attendance: 'present', mark: '', notes: '',
    }]);
    setCandidate('');
    setAddOpen(false);
  };

  const removeRow = async (row: Row) => {
    const ok = await confirm({
      title: t('تأكيد الحذف'),
      message: t('هل أنت متأكد من إزالة {name} من هذا الامتحان؟ ستُحذف نقطته وملاحظاته عند الحفظ.', { name: row.name }),
      confirmText: t('نعم، أزل'),
      variant: 'danger',
    });
    if (!ok) return;
    setRows((current) => current.filter((r) => r.student_id !== row.student_id));
  };

  const save = async () => {
    if (!exam) return;
    if (rows.some((r) => markError(r))) {
      showToast('error', t('صحّح النقاط غير الصالحة قبل الحفظ'));
      return;
    }
    const ok = await confirm({
      title: t('تأكيد الحفظ'),
      message: t('هل أنت متأكد من حفظ نتائج {count} طالب؟', { count: rows.length }),
      confirmText: t('نعم، احفظ'),
    });
    if (!ok) return;
    setSaving(true);
    try {
      const payload: ExamResultPayload[] = rows.map((r) => ({
        student_id: r.student_id,
        attendance: r.attendance,
        mark: r.attendance === 'present' ? parseMark(r.mark) : null,
        notes: r.notes.trim() || null,
      }));
      apply(await examsAPI.saveResults(exam.id, payload));
      showToast('success', t('تم حفظ النتائج'));
    } catch (error) {
      showToast('error', describeError(error, t('تعذر حفظ النتائج')));
    } finally {
      setSaving(false);
    }
  };

  const saveExam = async (payload: ExamPayload) => {
    if (!exam) return;
    apply(await examsAPI.updateExam(exam.id, payload));
    setIsFormOpen(false);
    showToast('success', t('تم حفظ الامتحان {name}', { name: payload.title }));
  };

  const remove = async () => {
    if (!exam) return;
    const ok = await confirm({
      title: t('تأكيد الحذف'),
      message: t('هل أنت متأكد من حذف الامتحان {name}؟ ستُحذف جميع نتائجه.', { name: exam.title }),
      confirmText: t('نعم، احذف'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await examsAPI.deleteExam(exam.id);
      router.push('/exams');
    } catch (error) {
      showToast('error', describeError(error, t('تعذر حذف الامتحان')));
    }
  };

  const markAllPresent = () => {
    setRows((current) => current.map((r) => ({ ...r, attendance: 'present' })));
  };

  const ranked = useMemo(
    () => [...rows].sort((a, b) => (ranks.get(a.student_id) ?? Infinity) - (ranks.get(b.student_id) ?? Infinity) || a.name.localeCompare(b.name, 'ar')),
    [rows, ranks],
  );

  if (loadError) {
    return (
      <AppLayout title="الامتحانات" breadcrumb="الشؤون التعليمية / الامتحانات">
        <div role="alert" className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError} <Link href="/exams" className="ms-2 font-semibold underline">{t('العودة إلى الامتحانات')}</Link>
        </div>
      </AppLayout>
    );
  }
  if (!exam) {
    return (
      <AppLayout title="الامتحانات" breadcrumb="الشؤون التعليمية / الامتحانات">
        <div className="flex min-h-48 items-center justify-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {t('جارٍ التحميل…')}</div>
      </AppLayout>
    );
  }

  const tiles = [
    { label: 'الحضور', value: `${live.present}/${live.total}`, hint: t('{absent} غائب · {excused} معذور', { absent: live.absent, excused: live.excused }), icon: Users, tone: 'bg-violet-50 text-violet-700 ring-violet-100' },
    { label: 'المعدل', value: live.average == null ? '—' : `${formatMark(live.average)} / ${formatMark(max)}`, hint: t('أعلى نقطة: {mark}', { mark: formatMark(live.highest) }), icon: Trophy, tone: 'bg-amber-50 text-amber-700 ring-amber-100' },
    { label: 'نسبة النجاح', value: formatPct(live.passRate), hint: t('نقطة النجاح: {mark}', { mark: formatMark(exam.pass_mark) }), icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
    { label: 'المنقطون', value: `${live.graded}/${live.present}`, hint: live.present - live.graded > 0 ? t('{count} بدون نقطة', { count: live.present - live.graded }) : live.present > 0 ? t('كل الحاضرين منقطون') : '', icon: Pencil, tone: 'bg-sky-50 text-sky-700 ring-sky-100' },
  ];

  const missingCount = rows.filter((r) => r.attendance === 'present' && r.mark.trim() === '').length;
  const absentCount = rows.filter((r) => r.attendance !== 'present').length;
  const rq = normalizeSearch(rowQuery);
  const shownRows = rows.filter((r) =>
    (rowFilter === 'all' || (rowFilter === 'missing' ? r.attendance === 'present' && r.mark.trim() === '' : r.attendance !== 'present'))
    && (!rq || normalizeSearch(`${r.name} ${r.registration_number ?? ''}`).includes(rq)));
  const rowPageCount = Math.max(1, Math.ceil(shownRows.length / rowPageSize));
  const rowCurrentPage = Math.min(rowPage, rowPageCount);
  const pageRows = shownRows.slice((rowCurrentPage - 1) * rowPageSize, rowCurrentPage * rowPageSize);
  const addable = exam.candidates.filter((c) => !rows.some((r) => r.student_id === c.student_id));

  return (
    <AppLayout title="الامتحانات" breadcrumb="الشؤون التعليمية / الامتحانات">
      <Toast type={toast.type} message={toast.message} isVisible={toast.visible} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
      <div className="mx-auto max-w-6xl space-y-4">
        <Link href="/exams" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-700">
          <ArrowRight size={15} className="ltr:rotate-180" aria-hidden="true" /> {t('العودة إلى الامتحانات')}
        </Link>

        <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">{exam.title}</h1>
                <ExamPhaseBadge exam={exam} />
                <ExamTypeBadge type={exam.exam_type} />
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1"><CalendarDays size={14} aria-hidden="true" />{formatExamDate(exam.exam_date)}</span>
                <span className="flex items-center gap-1"><BookOpen size={14} aria-hidden="true" />{lectureName(exam)}</span>
                <span>{t('على {max} · النجاح {pass}', { max: formatMark(exam.max_mark), pass: formatMark(exam.pass_mark) })}</span>
              </p>
              {exam.notes && <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{exam.notes}</p>}
            </div>
            {editable && (
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}><Pencil size={14} /> {t('تعديل')}</Button>
                <Button variant="danger" size="sm" onClick={() => void remove()}><Trash2 size={14} /> {t('حذف')}</Button>
              </div>
            )}
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label={t('ملخص الامتحان')}>
          {tiles.map(({ label, value, hint, icon: Icon, tone }) => (
            <div key={label} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1', tone)} aria-hidden="true"><Icon size={18} /></span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">{t(label)}</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{hint}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="tablist" className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {([['entry', editable ? 'إدخال النتائج' : 'النتائج', Pencil], ['ranking', 'الترتيب', Trophy]] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={view === value}
                onClick={() => setView(value)}
                className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium', view === value ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50')}
              >
                <Icon size={15} aria-hidden="true" /> {t(label)}
              </button>
            ))}
          </div>
          {editable && view === 'entry' && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={markAllPresent}>
                <CheckCircle2 size={15} /> {t('الكل حاضر')}
              </Button>
              {addable.length > 0 && (
                <Button size="sm" onClick={() => setAddOpen((open) => !open)} aria-expanded={addOpen} aria-controls="add-student-panel">
                  <UserPlus size={16} /> {t('إضافة طالب')}
                </Button>
              )}
            </div>
          )}
        </div>

        {editable && view === 'entry' && addOpen && (
          <div id="add-student-panel" className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-sm font-semibold text-emerald-900">{t('اختر الطالب الذي تريد إضافته إلى هذا الامتحان')}</p>
              <SearchableSelect
                options={addable.map((c) => ({
                  value: c.student_id,
                  label: `${c.name}${c.in_lecture ? '' : ` (${t('من حلقة أخرى')})`}`,
                  keywords: c.registration_number ?? '',
                }))}
                value={candidate}
                onValueChange={setCandidate}
                placeholder={t('ابحث عن الطالب بالاسم...')}
                ariaLabel={t('إضافة طالب')}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void addCandidate()} disabled={!candidate}>
                <UserPlus size={16} /> {t('إضافة')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setAddOpen(false); setCandidate(''); }}>{t('إلغاء')}</Button>
            </div>
          </div>
        )}

        {editable && view === 'entry' && rows.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="sr-only">{t('بحث')}</span>
              <Search size={16} className="pointer-events-none absolute inset-y-0 start-3 my-auto text-gray-400" aria-hidden="true" />
              <input
                type="search"
                value={rowQuery}
                onChange={(e) => { setRowQuery(e.target.value); setRowPage(1); }}
                placeholder={t('ابحث عن طالب في هذا الامتحان...')}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pe-3 ps-9 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              />
            </label>
            <div role="group" aria-label={t('عرض')} className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
              {([['all', 'الكل', rows.length], ['missing', 'بدون نقطة', missingCount], ['absent', 'غائبون / معذورون', absentCount]] as const).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={rowFilter === value}
                  onClick={() => { setRowFilter(value); setRowPage(1); }}
                  className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
                    rowFilter === value ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50')}
                >
                  {t(label)}
                  <span className={cn('rounded-full px-1.5 tabular-nums', rowFilter === value ? 'bg-white/20' : value === 'missing' && count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100')}>{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            {t('لا يوجد طلاب في هذا الامتحان. أضف طلاباً من القائمة أعلاه.')}
          </div>
        ) : view === 'ranking' ? (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <ol className="divide-y divide-gray-100">
              {ranked.map((row) => {
                const mark = parseMark(row.mark);
                const rank = ranks.get(row.student_id) ?? null;
                const pct = rank != null && mark != null ? (mark / max) * 100 : null;
                return (
                  <li key={row.student_id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
                    <RankPill rank={rank} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{row.name}</p>
                      {row.notes && <p className="truncate text-xs text-gray-500">{row.notes}</p>}
                    </div>
                    {rank != null ? (
                      <>
                        <div className="w-full sm:w-48"><PctBar value={pct} /></div>
                        <span className="w-20 text-end font-bold tabular-nums text-gray-900">{formatMark(mark)} / {formatMark(max)}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', mark! >= exam.pass_mark ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800')}>
                          {mark! >= exam.pass_mark ? `✓ ${t('ناجح')}` : `✗ ${t('راسب')}`}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">{row.attendance === 'present' ? t('بدون نقطة') : t(ATTENDANCE_LABELS[row.attendance])}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ) : (
          <>
          <ul className="space-y-2">
            {pageRows.length === 0 && (
              <li className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">{t('لا توجد نتائج مطابقة')}</li>
            )}
            {pageRows.map((row) => {
              const error = markError(row);
              const rank = ranks.get(row.student_id) ?? null;
              return (
                <li key={row.student_id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="grid gap-3 md:grid-cols-[auto_minmax(10rem,1.2fr)_auto_8rem_minmax(10rem,1.5fr)_auto] md:items-center">
                    <div className="flex items-center gap-3 md:contents">
                      <RankPill rank={rank} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">{row.name}</p>
                        <p className="truncate text-xs text-gray-400">
                          {row.registration_number && <span dir="ltr">{row.registration_number}</span>}
                          {row.registration_number && row.speciality_name && ' · '}
                          {row.speciality_name}
                        </p>
                      </div>
                    </div>
                    <div role="radiogroup" aria-label={t('حضور {name}', { name: row.name })} className="inline-flex w-fit rounded-lg border border-gray-200 p-0.5">
                      {(Object.keys(ATTENDANCE_LABELS) as ExamAttendance[]).map((value) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={row.attendance === value}
                          disabled={!editable}
                          onClick={() => update(row.student_id, { attendance: value })}
                          className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-default',
                            row.attendance === value ? ATTENDANCE_STYLES[value] : 'text-gray-600 hover:bg-gray-50')}
                        >
                          {t(ATTENDANCE_LABELS[value])}
                        </button>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={row.attendance === 'present' ? row.mark : ''}
                          disabled={!editable || row.attendance !== 'present'}
                          placeholder={row.attendance === 'present' ? '—' : t(ATTENDANCE_LABELS[row.attendance])}
                          onChange={(e) => update(row.student_id, { mark: e.target.value })}
                          aria-label={t('نقطة {name}', { name: row.name })}
                          aria-invalid={!!error}
                          className={cn('w-20 rounded-lg border px-2 py-1.5 text-center text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400',
                            error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-400/30')}
                        />
                        <span className="text-xs text-gray-400">/ {formatMark(max)}</span>
                      </div>
                      {error && <p className="mt-0.5 text-[11px] text-red-600">{error}</p>}
                    </div>
                    <input
                      type="text"
                      value={row.notes}
                      maxLength={2000}
                      disabled={!editable}
                      placeholder={t('ملاحظة حول أدائه...')}
                      onChange={(e) => update(row.student_id, { notes: e.target.value })}
                      aria-label={t('ملاحظة حول {name}', { name: row.name })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 disabled:bg-gray-50"
                    />
                    {editable && (
                      <button type="button" onClick={() => void removeRow(row)} className="justify-self-end rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={t('إزالة {name}', { name: row.name })} title={t('إزالة من الامتحان')}>
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {shownRows.length > 10 && (
            <Pagination
              page={rowCurrentPage}
              pageSize={rowPageSize}
              total={shownRows.length}
              onPageChange={setRowPage}
              onPageSizeChange={(size) => { setRowPageSize(size); setRowPage(1); }}
              pageSizes={[10, 20, 50]}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
            />
          )}
          </>
        )}
        {editable && dirty && (
          <div className="sticky bottom-2 z-20 rounded-2xl border border-amber-200 bg-amber-50/95 shadow-lg backdrop-blur" role="status">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <p className="text-sm font-medium text-amber-800">{t('تعديلات غير محفوظة')}</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setRows(savedRows)} disabled={saving}>{t('تراجع')}</Button>
                <Button size="sm" onClick={() => void save()} isLoading={saving}>
                  <Save size={15} /> {t('حفظ النتائج')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ExamFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} lectures={lectures} exam={exam} onSubmit={saveExam} />
    </AppLayout>
  );
}
