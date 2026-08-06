'use client';

import React, { useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { ApiStudent } from '@/app/memorization/page';
import { studentDisplayName } from '@/app/memorization/page';

export interface AchievementFormValues {
  studentId: number;
  fromSurah: number;
  toSurah: number;
  fromVerse: number;
  toVerse: number;
  note: string;
  achievementType: string;
  date: string; // yyyy-mm-dd
}

interface MemorizationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AchievementFormValues) => void;
  editingAchievement?: any | null;
  students: ApiStudent[];
  isLoadingStudents?: boolean;
  defaultStudentId?: number | null;
  isLoading?: boolean;
}

function apiDateToInput(date: string): string {
  if (!date) return '';
  const [d, m, y] = date.split('-');
  if (!d || !m || !y) return date;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function emptyForm(defaultStudentId?: number | null): AchievementFormValues {
  return {
    studentId: defaultStudentId ?? 0,
    fromSurah: 1,
    toSurah: 1,
    fromVerse: 1,
    toVerse: 1,
    note: '',
    achievementType: 'normal',
    date: new Date().toISOString().slice(0, 10),
  };
}

export const MemorizationForm: React.FC<MemorizationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingAchievement,
  students,
  isLoadingStudents,
  defaultStudentId,
  isLoading,
}) => {
  const [form, setForm] = React.useState<AchievementFormValues>(emptyForm(defaultStudentId));
  const [errors, setErrors] = React.useState<Partial<Record<keyof AchievementFormValues, string>>>({});

  const isEditing = !!editingAchievement;

  useEffect(() => {
    if (editingAchievement) {
      setForm({
        studentId: editingAchievement.student_id,
        fromSurah: editingAchievement.from_surah,
        toSurah: editingAchievement.to_surah,
        fromVerse: editingAchievement.from_verse,
        toVerse: editingAchievement.to_verse,
        note: editingAchievement.note || '',
        achievementType: editingAchievement.achievement_type || 'normal',
        date: apiDateToInput(editingAchievement.date),
      });
    } else {
      setForm(emptyForm(defaultStudentId));
    }
    setErrors({});
  }, [editingAchievement, isOpen, defaultStudentId]);

  const set = <K extends keyof AchievementFormValues>(field: K, value: AchievementFormValues[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.studentId) newErrors.studentId = 'اختيار الطالب مطلوب';
    if (!form.fromSurah || form.fromSurah < 1 || form.fromSurah > 114) newErrors.fromSurah = 'رقم سورة غير صالح';
    if (!form.toSurah || form.toSurah < 1 || form.toSurah > 114) newErrors.toSurah = 'رقم سورة غير صالح';
    if (form.toSurah < form.fromSurah) newErrors.toSurah = 'يجب أن تكون بعد سورة البداية';
    if (!form.fromVerse || form.fromVerse < 1) newErrors.fromVerse = 'رقم آية غير صالح';
    if (!form.toVerse || form.toVerse < 1) newErrors.toVerse = 'رقم آية غير صالح';
    if (!form.date) newErrors.date = 'التاريخ مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل سجل الإنجاز' : 'إضافة سجل إنجاز جديد'}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button size="sm" isLoading={isLoading} onClick={handleSubmit}>
            {isEditing ? 'حفظ التعديلات' : 'إضافة السجل'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student */}
        <Select
          label="الطالب *"
          value={form.studentId || ''}
          onChange={(e) => set('studentId', Number(e.target.value))}
          error={errors.studentId}
          disabled={isLoadingStudents}
          options={[
            { value: '', label: isLoadingStudents ? 'جارٍ التحميل...' : 'اختر طالبًا' },
            ...students.map((s) => ({ value: String(s.id), label: studentDisplayName(s) })),
          ]}
        />

        {/* Surah range */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="من سورة (رقم) *"
            type="number"
            min={1}
            max={114}
            value={form.fromSurah}
            onChange={(e) => set('fromSurah', Number(e.target.value))}
            error={errors.fromSurah}
          />
          <Input
            label="إلى سورة (رقم) *"
            type="number"
            min={1}
            max={114}
            value={form.toSurah}
            onChange={(e) => set('toSurah', Number(e.target.value))}
            error={errors.toSurah}
          />
        </div>

        {/* Verse range */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="من آية *"
            type="number"
            min={1}
            value={form.fromVerse}
            onChange={(e) => set('fromVerse', Number(e.target.value))}
            error={errors.fromVerse}
          />
          <Input
            label="إلى آية *"
            type="number"
            min={1}
            value={form.toVerse}
            onChange={(e) => set('toVerse', Number(e.target.value))}
            error={errors.toVerse}
          />
        </div>

        {/* Type + Date */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="نوع الإنجاز"
            value={form.achievementType}
            onChange={(e) => set('achievementType', e.target.value)}
            options={[
              { value: 'small', label: 'صغير' },
              { value: 'normal', label: 'عادي' },
              { value: 'big', label: 'كبير' },
            ]}
          />
          <Input
            label="التاريخ *"
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            error={errors.date}
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملاحظات</label>
          <textarea
            placeholder="أي ملاحظات إضافية..."
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 resize-none transition-all"
          />
        </div>
      </form>
    </Modal>
  );
};
