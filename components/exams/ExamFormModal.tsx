'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useConfirm } from '@/components/ui/ConfirmProvider';
import type { Exam, ExamLecture, ExamPayload, ExamType } from '@/app/API/exams';
import { useLang } from '@/i18n/I18nProvider';
import { t } from '@/i18n';
import { describeError } from '@/utils/errorMessages';
import { EXAM_TYPE_LABELS, todayIso } from './examUi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lectures: ExamLecture[];
  /** Exam being edited; null to create one. */
  exam: Exam | null;
  /** Called with the payload; throws to keep the modal open with the error shown. */
  onSubmit: (payload: ExamPayload, includeStudents: boolean) => Promise<void>;
}

interface FormState {
  lecture_id: string;
  title: string;
  exam_type: string;
  exam_date: string;
  max_mark: string;
  pass_mark: string;
  notes: string;
}

const fromExam = (exam: Exam | null): FormState => exam
  ? {
      lecture_id: String(exam.lecture_id), title: exam.title, exam_type: exam.exam_type ?? '', exam_date: exam.exam_date,
      max_mark: String(exam.max_mark), pass_mark: String(exam.pass_mark), notes: exam.notes ?? '',
    }
  : { lecture_id: '', title: '', exam_type: 'monthly', exam_date: todayIso(), max_mark: '20', pass_mark: '10', notes: '' };

export function ExamFormModal({ isOpen, onClose, lectures, exam, onSubmit }: Props) {
  const confirm = useConfirm();
  const { lang } = useLang();
  const [form, setForm] = useState<FormState>(() => fromExam(exam));
  const [includeStudents, setIncludeStudents] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  // Reset the form whenever the modal opens for another exam (derived during render, no effect).
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const key = isOpen ? `${exam?.id ?? 'new'}` : null;
  if (key !== openedFor) {
    setOpenedFor(key);
    if (key !== null) {
      setForm(fromExam(exam));
      setIncludeStudents(true);
      setError('');
    }
  }

  const lectureName = (l: { lecture_name_ar: string; lecture_name_en?: string | null }) =>
    lang !== 'ar' && l.lecture_name_en ? l.lecture_name_en : l.lecture_name_ar;
  const selectedLecture = lectures.find((l) => String(l.lecture_id) === form.lecture_id);
  const set = (field: keyof FormState) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async () => {
    setError('');
    const max = Number(form.max_mark);
    const pass = Number(form.pass_mark);
    if (!form.lecture_id) return setError(t('اختر الحلقة'));
    if (!form.title.trim()) return setError(t('عنوان الامتحان مطلوب'));
    if (!form.exam_date) return setError(t('تاريخ الامتحان مطلوب'));
    if (!Number.isFinite(max) || max <= 0 || max > 1000) return setError(t('يجب أن تكون النقطة القصوى رقماً أكبر من 0'));
    if (!Number.isFinite(pass) || pass < 0 || pass > max) return setError(t('يجب أن تكون نقطة النجاح بين 0 والنقطة القصوى'));
    const payload: ExamPayload = {
      lecture_id: Number(form.lecture_id), title: form.title.trim(), exam_type: (form.exam_type || null) as ExamType | null,
      exam_date: form.exam_date, max_mark: max, pass_mark: pass, notes: form.notes.trim() || null,
    };
    const ok = await confirm(exam
      ? { title: t('تأكيد الحفظ'), message: t('هل أنت متأكد من حفظ تعديلات الامتحان {name}؟', { name: payload.title }), confirmText: t('نعم، احفظ') }
      : { title: t('تأكيد الإضافة'), message: t('هل أنت متأكد من إضافة الامتحان {name}؟', { name: payload.title }), confirmText: t('نعم، أضف') });
    if (!ok) return;
    setSaving(true);
    try {
      await onSubmit(payload, includeStudents);
    } catch (err) {
      setError(describeError(err, t('تعذر حفظ الامتحان')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !saving && onClose()}
      title={exam ? t('تعديل الامتحان') : t('إضافة امتحان')}
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>{t('إلغاء')}</Button>
          <Button size="sm" onClick={() => void submit()} isLoading={saving}>{exam ? t('حفظ التعديلات') : t('إضافة')}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        <Input label={t('عنوان الامتحان *')} value={form.title} maxLength={200} placeholder={t('مثال: امتحان شهر أكتوبر')} onChange={set('title')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t('الحلقة *')}
            value={form.lecture_id}
            onChange={set('lecture_id')}
            placeholder={t('اختر الحلقة')}
            options={lectures.map((l) => ({ value: l.lecture_id, label: `${lectureName(l)} (${t('{count} طالب', { count: l.student_count })})`, keywords: `${l.lecture_name_ar} ${l.lecture_name_en ?? ''}` }))}
          />
          <Select
            label={t('نوع الامتحان')}
            value={form.exam_type}
            onChange={set('exam_type')}
            options={(Object.keys(EXAM_TYPE_LABELS) as ExamType[]).map((type) => ({ value: type, label: t(EXAM_TYPE_LABELS[type]) }))}
          />
          <Input label={t('تاريخ الامتحان *')} type="date" value={form.exam_date} onChange={set('exam_date')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('النقطة القصوى')} type="number" inputMode="decimal" min={1} step={0.5} value={form.max_mark} onChange={set('max_mark')} />
            <Input label={t('نقطة النجاح')} type="number" inputMode="decimal" min={0} step={0.5} value={form.pass_mark} onChange={set('pass_mark')} />
          </div>
        </div>
        <div>
          <label htmlFor="exam-notes" className="mb-1.5 block text-sm font-semibold text-gray-700">{t('ملاحظات / المقرر')}</label>
          <textarea
            id="exam-notes"
            value={form.notes}
            maxLength={4000}
            rows={2}
            onChange={set('notes')}
            placeholder={t('مثال: من سورة البقرة إلى سورة آل عمران')}
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 hover:border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
          />
        </div>
        {!exam && (
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={includeStudents} onChange={(e) => setIncludeStudents(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600" />
            <span>
              {t('إضافة طلاب الحلقة تلقائياً')}
              {selectedLecture && <span className="ms-1 text-xs text-gray-500">({t('{count} طالب', { count: selectedLecture.student_count })})</span>}
            </span>
          </label>
        )}
        {exam && String(exam.lecture_id) !== form.lecture_id && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{t('عند تغيير الحلقة تُستبدل قائمة الطلاب بطلاب الحلقة الجديدة. لا يمكن ذلك بعد إدخال النقاط.')}</p>
        )}
      </div>
    </Modal>
  );
}
