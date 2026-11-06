'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, GraduationCap, Layers, Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import specialitiesAPI, { Speciality, SpecialityPayload } from '@/app/API/specialities';
import lecturesAPI, { type Lecture } from '@/api/lectures';
import { useAuthStore } from '@/store/authStore';
import { useLang } from '@/i18n/I18nProvider';
import { getLocale, t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';
import { cn } from '@/utils/cn';

interface FormState {
  name: string;
  description: string;
  is_common: boolean;
  /** lecture_id -> coefficient (as typed) */
  lectures: Record<number, string>;
}

const EMPTY: FormState = { name: '', description: '', is_common: false, lectures: {} };
const MANAGER_ROLES = ['PRESIDENT', 'CHIEF_SUPERVISOR', 'SUPERVISOR', 'ADMIN'];

const formatCoefficient = (value: number) => new Intl.NumberFormat(getLocale(), { maximumFractionDigits: 2 }).format(value);

export default function SpecialitiesPage() {
  const confirm = useConfirm();
  const { lang } = useLang();
  const role = useAuthStore((s) => s.user?.role);
  const canManage = !role || MANAGER_ROLES.includes(role);

  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  // Bumping the token reloads the list; `loading` is derived instead of being set in the effect.
  const [reloadToken, setReloadToken] = useState(0);
  const [loadedToken, setLoadedToken] = useState(-1);
  const loading = loadedToken === -1;
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<Speciality | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success' as 'success' | 'error' | 'info', message: '' });
  const showToast = (type: 'success' | 'error' | 'info', message: string) => setToast({ visible: true, type, message });

  const load = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    Promise.all([specialitiesAPI.listSpecialities(), lecturesAPI.getAllLectures()])
      .then(([specs, circles]) => {
        if (!active) return;
        setSpecialities(specs);
        setLectures(circles);
        setLoadError('');
      })
      .catch((error) => { if (active) setLoadError(describeError(error, t('تعذر تحميل التخصصات'))); })
      .finally(() => { if (active) setLoadedToken(reloadToken); });
    return () => { active = false; };
  }, [reloadToken]);

  const lectureName = (lecture: { lecture_name_ar: string; lecture_name_en?: string | null }) =>
    lang !== 'ar' && lecture.lecture_name_en ? lecture.lecture_name_en : lecture.lecture_name_ar;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (speciality: Speciality) => {
    setEditing(speciality);
    setForm({
      name: speciality.name,
      description: speciality.description ?? '',
      is_common: speciality.is_common,
      lectures: Object.fromEntries(speciality.lectures.map((l) => [l.lecture_id, String(l.coefficient)])),
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const toggleLecture = (lectureId: number) => {
    setForm((current) => {
      const next = { ...current.lectures };
      if (lectureId in next) delete next[lectureId];
      else next[lectureId] = '1';
      return { ...current, lectures: next };
    });
  };

  const selectedCount = Object.keys(form.lectures).length;

  const save = async () => {
    setFormError('');
    if (!form.name.trim()) {
      setFormError(t('اسم التخصص مطلوب'));
      return;
    }
    const entries = Object.entries(form.lectures).map(([id, value]) => ({ lecture_id: Number(id), coefficient: Number(value) }));
    if (entries.some((e) => !Number.isFinite(e.coefficient) || e.coefficient <= 0 || e.coefficient > 100)) {
      setFormError(t('يجب أن يكون المعامل رقماً أكبر من 0 وأقل من أو يساوي 100'));
      return;
    }
    const payload: SpecialityPayload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      is_common: form.is_common,
      lectures: entries,
    };
    const confirmed = await confirm(editing
      ? {
          title: t('تأكيد الحفظ'),
          message: editing.student_count > 0
            ? t('هل أنت متأكد من حفظ تعديلات التخصص {name}؟ سيتم تحديث حلقات {count} طالب تلقائياً.', { name: payload.name, count: editing.student_count })
            : t('هل أنت متأكد من حفظ تعديلات التخصص {name}؟', { name: payload.name }),
          confirmText: t('نعم، احفظ'),
        }
      : { title: t('تأكيد الإضافة'), message: t('هل أنت متأكد من إضافة التخصص {name}؟', { name: payload.name }), confirmText: t('نعم، أضف') });
    if (!confirmed) return;

    setSaving(true);
    try {
      if (editing) await specialitiesAPI.updateSpeciality(editing.id, payload);
      else await specialitiesAPI.createSpeciality(payload);
      setIsFormOpen(false);
      showToast('success', editing ? t('تم حفظ التخصص {name}', { name: payload.name }) : t('تمت إضافة التخصص {name}', { name: payload.name }));
      load();
    } catch (error) {
      setFormError(describeError(error, t('تعذر حفظ التخصص')));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (speciality: Speciality) => {
    const confirmed = await confirm({
      title: t('تأكيد الحذف'),
      message: speciality.student_count > 0
        ? t('هل أنت متأكد من حذف التخصص {name}؟ سيحتفظ {count} طالب بحلقاتهم الحالية دون تخصص.', { name: speciality.name, count: speciality.student_count })
        : t('هل أنت متأكد من حذف التخصص {name}؟', { name: speciality.name }),
      confirmText: t('نعم، احذف'),
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await specialitiesAPI.deleteSpeciality(speciality.id);
      showToast('success', t('تم حذف التخصص {name}', { name: speciality.name }));
      load();
    } catch (error) {
      showToast('error', describeError(error, t('تعذر حذف التخصص')));
    }
  };

  const sortedLectures = useMemo(
    () => [...lectures].sort((a, b) => a.lecture_name_ar.localeCompare(b.lecture_name_ar, 'ar')),
    [lectures],
  );

  return (
    <AppLayout title="التخصصات" breadcrumb="الشؤون الإدارية / التخصصات">
      <Toast type={toast.type} message={toast.message} isVisible={toast.visible} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
      <div className="mx-auto max-w-6xl space-y-5 pb-8">
        <header className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Layers size={22} /></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('التخصصات')}</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {t('حدد لكل تخصص حلقاته ومعامل كل حلقة. يُسجَّل الطالب تلقائياً في جميع حلقات تخصصه، ويمكن أن تكون الحلقة مشتركة بين عدة تخصصات.')}
              </p>
            </div>
          </div>
          {canManage && (
            <Button size="sm" onClick={openCreate} className="shrink-0">
              <Plus size={16} /> {t('إضافة تخصص')}
            </Button>
          )}
        </header>

        {loadError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {loadError}
            <button type="button" onClick={() => void load()} className="font-semibold underline">{t('إعادة المحاولة')}</button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20} /> {t('جارٍ التحميل…')}</div>
        ) : specialities.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
            <GraduationCap size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">{t('لا توجد تخصصات بعد')}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{t('ابدأ مثلاً بإضافة «الجذع المشترك» ثم تخصصات مثل الفقه أو التلاوة.')}</p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {specialities.map((speciality) => {
              const total = speciality.lectures.reduce((sum, l) => sum + l.coefficient, 0);
              return (
                <li key={speciality.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-bold text-gray-900">{speciality.name}</h2>
                        {speciality.is_common && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{t('جذع مشترك')}</span>
                        )}
                      </div>
                      {speciality.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{speciality.description}</p>}
                    </div>
                    {canManage && (
                      <div className="flex shrink-0 gap-1">
                        <button type="button" onClick={() => openEdit(speciality)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label={t('تعديل')} title={t('تعديل')}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" onClick={() => void remove(speciality)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={t('حذف')} title={t('حذف')}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    {speciality.lectures.length === 0 ? (
                      <p className="text-sm text-amber-700">{t('لا توجد حلقات في هذا التخصص بعد، ولا يمكن تسجيل طلاب فيه.')}</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500">
                            <th className="pb-1.5 text-start font-medium">{t('الحلقة')}</th>
                            <th className="pb-1.5 text-end font-medium">{t('المعامل')}</th>
                          </tr>
                        </thead>
                        <tbody className="tabular-nums">
                          {speciality.lectures.map((lecture) => (
                            <tr key={lecture.lecture_id} className="border-t border-gray-100">
                              <td className="py-1.5 text-gray-800">
                                <span className="flex items-center gap-1.5"><BookOpen size={13} className="shrink-0 text-gray-400" aria-hidden="true" />{lectureName(lecture)}</span>
                              </td>
                              <td className="py-1.5 text-end font-semibold text-gray-900">{formatCoefficient(lecture.coefficient)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-b-2xl bg-gray-50 px-4 py-2.5 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5"><Users size={13} aria-hidden="true" />{t('{count} طالب', { count: speciality.student_count })}</span>
                    {speciality.lectures.length > 0 && (
                      <span>{t('{count} حلقة · مجموع المعاملات {total}', { count: speciality.lectures.length, total: formatCoefficient(total) })}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => !saving && setIsFormOpen(false)}
        title={editing ? t('تعديل التخصص') : t('إضافة تخصص')}
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)} disabled={saving}>{t('إلغاء')}</Button>
            <Button size="sm" onClick={() => void save()} isLoading={saving}>{editing ? t('حفظ التعديلات') : t('إضافة')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</p>}
          <Input
            label={t('اسم التخصص *')}
            value={form.name}
            maxLength={150}
            placeholder={t('مثال: الفقه، التلاوة، الجذع المشترك')}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div>
            <label htmlFor="speciality-description" className="mb-1.5 block text-sm font-semibold text-gray-700">{t('الوصف')}</label>
            <textarea
              id="speciality-description"
              value={form.description}
              maxLength={2000}
              rows={2}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 hover:border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.is_common} onChange={(e) => setForm((f) => ({ ...f, is_common: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-emerald-600" />
            {t('جذع مشترك')}
            <span className="text-xs text-gray-400">{t('(تخصص عام يجمع الحلقات الأساسية)')}</span>
          </label>

          <fieldset>
            <legend className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-gray-700">
              <span>{t('الحلقات والمعاملات')}</span>
              <span className="text-xs font-normal text-gray-500">{t('تم اختيار {count}', { count: selectedCount })}</span>
            </legend>
            {sortedLectures.length === 0 ? (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{t('لا توجد حلقات في المدرسة بعد. أضف الحلقات أولاً من صفحة الحلقات.')}</p>
            ) : (
              <ul className="max-h-72 space-y-1.5 overflow-y-auto rounded-xl border border-gray-200 p-2">
                {sortedLectures.map((lecture) => {
                  const selected = lecture.lecture_id in form.lectures;
                  return (
                    <li key={lecture.lecture_id} className={cn('flex items-center gap-3 rounded-lg px-2 py-1.5', selected && 'bg-emerald-50/60')}>
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-sm text-gray-800">
                        <input type="checkbox" checked={selected} onChange={() => toggleLecture(lecture.lecture_id)} className="h-4 w-4 shrink-0 rounded border-gray-300 text-emerald-600" />
                        <span className="truncate">{lectureName(lecture)}</span>
                      </label>
                      {selected && (
                        <label className="flex shrink-0 items-center gap-1.5 text-xs text-gray-500">
                          {t('المعامل')}
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0.5}
                            max={100}
                            step={0.5}
                            value={form.lectures[lecture.lecture_id]}
                            onChange={(e) => setForm((f) => ({ ...f, lectures: { ...f.lectures, [lecture.lecture_id]: e.target.value } }))}
                            className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
                            aria-label={t('معامل {name}', { name: lectureName(lecture) })}
                          />
                        </label>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-1.5 text-xs text-gray-400">{t('ستُستخدم المعاملات لاحقاً في حساب نتائج الامتحانات.')}</p>
          </fieldset>
        </div>
      </Modal>
    </AppLayout>
  );
}
