'use client';

import React, { useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { ApiStudent } from '@/app/memorization/page';
import { studentDisplayName } from '@/app/memorization/page';
import { thumnRange } from '@/data/quran_thumn';
import { ThumnPicker } from '@/components/memorization/ThumnPicker';
import { t } from '@/i18n';

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
  defaultDate?: string; // yyyy-mm-dd format from parent
  isLoading?: boolean;
}

function apiDateToInput(date: string): string {
  if (!date) return '';
  const [d, m, y] = date.split('-');
  if (!d || !m || !y) return date;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function emptyForm(defaultStudentId?: number | null, defaultDate?: string): AchievementFormValues {
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return {
    studentId: defaultStudentId ?? 0,
    ...thumnRange(1, 1),
    note: '',
    achievementType: 'normal',
    date: defaultDate || localToday,
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
  defaultDate,
  isLoading,
}) => {
  const [form, setForm] = React.useState<AchievementFormValues>(emptyForm(defaultStudentId, defaultDate));
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
      setForm(emptyForm(defaultStudentId, defaultDate));
    }
    setErrors({});
  }, [editingAchievement, isOpen, defaultStudentId, defaultDate]);

  const set = <K extends keyof AchievementFormValues>(field: K, value: AchievementFormValues[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    
    // Check student selection
    if (!form.studentId) newErrors.studentId = t("اختيار الطالب مطلوب");
    
    // Check date
    if (!form.date) {
      newErrors.date = t("التاريخ مطلوب");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  // Check if form can be submitted
  const canSubmit = (): boolean => !!form.studentId && !!form.date;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t("تعديل سجل الإنجاز") : t("إضافة سجل إنجاز جديد")}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {t("إلغاء")}
          </Button>
          <Button size="sm" isLoading={isLoading} onClick={handleSubmit} disabled={!canSubmit() || isLoading}>
            {isEditing ? t("حفظ التعديلات") : t("إضافة السجل")}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student */}
        <Select
          label={t("الطالب *")}
          value={form.studentId || ''}
          onChange={(e) => set('studentId', Number(e.target.value))}
          error={errors.studentId}
          disabled={isLoadingStudents}
          options={[
            { value: '', label: isLoadingStudents ? t("جارٍ التحميل...") : t("اختر طالبًا") },
            ...students.map((s) => ({ value: String(s.id), label: studentDisplayName(s) })),
          ]}
        />

        <ThumnPicker value={form} onChange={(range) => setForm((f) => ({ ...f, ...range }))} />

        {/* Type + Date */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label={t("نوع الإنجاز")}
            value={form.achievementType}
            onChange={(e) => set('achievementType', e.target.value)}
            options={[
              { value: 'small', label: t("صغير") },
              { value: 'normal', label: t("عادي") },
              { value: 'big', label: t("كبير") },
            ]}
          />
          <Input
            label={t("التاريخ *")}
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            error={errors.date}
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("ملاحظات")}</label>
          <textarea
            placeholder={t("أي ملاحظات إضافية...")}
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
