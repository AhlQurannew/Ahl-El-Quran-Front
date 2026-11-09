import { describeError } from '@/utils/errorMessages';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import studentsAPI, { AchievementPayload } from '@/app/API/students';
import { thumnRange } from '@/data/quran_thumn';
import { ThumnPicker } from '@/components/memorization/ThumnPicker';
import { t } from '@/i18n';
import { useConfirm } from '@/components/ui/ConfirmProvider';

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  personalInfo?: {
    firstNameAr?: string;
    lastNameAr?: string;
  };
}

interface AchievementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  date: string;
  onSaved: () => void;
}

export function AchievementDialog({
  isOpen,
  onClose,
  student,
  date,
  onSaved,
}: AchievementDialogProps) {
  const confirm = useConfirm();
  const [range, setRange] = useState(() => thumnRange(1, 1));
  const [note, setNote] = useState('');
  const [achievementType, setAchievementType] = useState<'normal' | 'small' | 'big'>('normal');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStudentName = (student: Student) => {
    if (student.personalInfo?.firstNameAr || student.personalInfo?.lastNameAr) {
      return `${student.personalInfo.firstNameAr || ''} ${student.personalInfo.lastNameAr || ''}`.trim();
    }
    return `${student.firstname || ''} ${student.lastname || ''}`.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if form is not valid
    if (!canSubmit) {
      return;
    }
    
    setError(null);
    if (!(await confirm({ title: t('تأكيد الإضافة'), message: t('هل أنت متأكد من إضافة هذا الإنجاز؟'), confirmText: t('نعم، أضف') }))) return;
    setIsSaving(true);

    try {
      // Convert date from DD-MM-YYYY to API format if needed
      const payload: AchievementPayload = {
        from_surah: range.fromSurah,
        to_surah: range.toSurah,
        from_verse: range.fromVerse,
        to_verse: range.toVerse,
        note: note,
        achievement_type: achievementType,
        date: date, // Already in DD-MM-YYYY format from URL
      };

      await studentsAPI.addAchievement(student.id, payload);
      onSaved();
      onClose();
      
      // Reset form
      setRange(thumnRange(1, 1));
      setNote('');
      setAchievementType('normal');
    } catch (err: any) {
      console.error('Error saving achievement:', err);
      setError(describeError(err, t("فشل حفظ الإنجاز")));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setError(null);
      onClose();
    }
  };

  const canSubmit = !isSaving;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("تسجيل الإنجاز")}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Student Info */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t("الطالب")}</p>
              <p className="text-lg font-semibold text-gray-900">{getStudentName(student)}</p>
            </div>
            <div className="text-end">
              <p className="text-sm text-gray-600">{t("التاريخ")}</p>
              <p className="text-lg font-semibold text-gray-900">{date}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Achievement Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("نوع الإنجاز")}</label>
          <div className="flex flex-wrap gap-4">
            {([['normal', t("حفظ")], ['small', t("مراجعة صغرى")], ['big', t("مراجعة كبرى")]] as const).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={value}
                  checked={achievementType === value}
                  onChange={() => setAchievementType(value)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <ThumnPicker value={range} onChange={setRange} />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("ملاحظات")}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder={t("أضف ملاحظات إضافية (اختياري)")}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("إلغاء")}
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
              canSubmit
                ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t("جاري الحفظ...")}
              </>
            ) : (
              t("حفظ الإنجاز")
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
