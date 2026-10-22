'use client';

import React, { useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { ApiStudent } from '@/app/memorization/page';
import { studentDisplayName } from '@/app/memorization/page';
import { quranSurahs } from '@/data/quran_data';

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
    fromSurah: 1,
    toSurah: 1,
    fromVerse: 1,
    toVerse: 1,
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

  // Get max verses for selected surahs
  const fromSurahData = quranSurahs.find((s) => s.number === form.fromSurah);
  const toSurahData = quranSurahs.find((s) => s.number === form.toSurah);

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
    if (!form.studentId) newErrors.studentId = 'اختيار الطالب مطلوب';
    
    // Check surah validity
    if (!form.fromSurah || form.fromSurah < 1 || form.fromSurah > 114) {
      newErrors.fromSurah = 'اختيار السورة مطلوب';
    }
    if (!form.toSurah || form.toSurah < 1 || form.toSurah > 114) {
      newErrors.toSurah = 'اختيار السورة مطلوب';
    }
    
    // Check verse validity based on selected surahs
    const fromSurahData = quranSurahs.find((s) => s.number === form.fromSurah);
    const toSurahData = quranSurahs.find((s) => s.number === form.toSurah);
    
    if (!form.fromVerse || form.fromVerse < 1) {
      newErrors.fromVerse = 'رقم آية غير صالح';
    } else if (fromSurahData && form.fromVerse > fromSurahData.numberOfAyahs) {
      newErrors.fromVerse = `الحد الأقصى: ${fromSurahData.numberOfAyahs} آية`;
    }
    
    if (!form.toVerse || form.toVerse < 1) {
      newErrors.toVerse = 'رقم آية غير صالح';
    } else if (toSurahData && form.toVerse > toSurahData.numberOfAyahs) {
      newErrors.toVerse = `الحد الأقصى: ${toSurahData.numberOfAyahs} آية`;
    }
    
    // Check logical sequence (Quran memorization goes forward: from lower to higher)
    if (form.fromSurah === form.toSurah) {
      // Same surah: from verse must be <= to verse (e.g., from verse 1 to verse 20)
      if (form.fromVerse > form.toVerse) {
        newErrors.fromVerse = 'يجب أن تكون الآية "من" أقل من أو تساوي الآية "إلى"';
      }
    } else {
      // Different surahs: from surah must be <= to surah (e.g., from Surah 1 to Surah 3)
      if (form.fromSurah > form.toSurah) {
        newErrors.fromSurah = 'يجب أن تكون السورة "من" أقل من أو تساوي السورة "إلى"';
      }
    }
    
    // Check date
    if (!form.date) {
      newErrors.date = 'التاريخ مطلوب';
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
  const canSubmit = (): boolean => {
    // All fields must have values
    if (!form.studentId || !form.fromSurah || !form.toSurah || !form.fromVerse || !form.toVerse || !form.date) {
      return false;
    }
    
    // Surahs must be valid
    if (form.fromSurah < 1 || form.fromSurah > 114 || form.toSurah < 1 || form.toSurah > 114) {
      return false;
    }
    
    // Verses must be valid and within range
    const fromSurahData = quranSurahs.find((s) => s.number === form.fromSurah);
    const toSurahData = quranSurahs.find((s) => s.number === form.toSurah);
    
    if (form.fromVerse < 1 || form.toVerse < 1) {
      return false;
    }
    
    if (fromSurahData && form.fromVerse > fromSurahData.numberOfAyahs) {
      return false;
    }
    
    if (toSurahData && form.toVerse > toSurahData.numberOfAyahs) {
      return false;
    }
    
    // Check logical sequence
    if (form.fromSurah === form.toSurah) {
      if (form.fromVerse > form.toVerse) {
        return false;
      }
    } else {
      if (form.fromSurah > form.toSurah) {
        return false;
      }
    }
    
    return true;
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
          <Button size="sm" isLoading={isLoading} onClick={handleSubmit} disabled={!canSubmit() || isLoading}>
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
          <Select
            label="من سورة *"
            value={form.fromSurah}
            onChange={(e) => set('fromSurah', Number(e.target.value))}
            error={errors.fromSurah}
            options={[
              { value: '', label: 'اختر السورة' },
              ...quranSurahs.map((surah) => ({
                value: String(surah.number),
                label: `${surah.number}. ${surah.name}`,
              })),
            ]}
          />
          <Select
            label="إلى سورة *"
            value={form.toSurah}
            onChange={(e) => set('toSurah', Number(e.target.value))}
            error={errors.toSurah}
            options={[
              { value: '', label: 'اختر السورة' },
              ...quranSurahs.map((surah) => ({
                value: String(surah.number),
                label: `${surah.number}. ${surah.name}`,
              })),
            ]}
          />
        </div>

        {/* Verse range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="من آية *"
              type="number"
              min={1}
              max={fromSurahData?.numberOfAyahs || 286}
              value={form.fromVerse}
              onChange={(e) => set('fromVerse', Number(e.target.value))}
              error={errors.fromVerse}
            />
            {fromSurahData && (
              <p className="text-xs text-gray-500 mt-1">
                الحد الأقصى: {fromSurahData.numberOfAyahs} آية
              </p>
            )}
          </div>
          <div>
            <Input
              label="إلى آية *"
              type="number"
              min={1}
              max={toSurahData?.numberOfAyahs || 286}
              value={form.toVerse}
              onChange={(e) => set('toVerse', Number(e.target.value))}
              error={errors.toVerse}
            />
            {toSurahData && (
              <p className="text-xs text-gray-500 mt-1">
                الحد الأقصى: {toSurahData.numberOfAyahs} آية
              </p>
            )}
          </div>
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
