import React, { useState, useEffect } from 'react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Modal } from '@/components/ui/Modal';
import studentsAPI, { AchievementPayload } from '@/app/API/students';
import { quranSurahs } from '@/data/quran_data';
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
  const [fromSurah, setFromSurah] = useState(1);
  const [toSurah, setToSurah] = useState(1);
  const [fromVerse, setFromVerse] = useState(1);
  const [toVerse, setToVerse] = useState(1);
  const [note, setNote] = useState('');
  const [achievementType, setAchievementType] = useState<'normal' | 'review'>('normal');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get max verses for selected surahs
  const fromSurahData = quranSurahs.find((s) => s.number === fromSurah);
  const toSurahData = quranSurahs.find((s) => s.number === toSurah);

  useEffect(() => {
    // Reset verse numbers when surah changes
    if (fromSurahData && fromVerse > fromSurahData.numberOfAyahs) {
      setFromVerse(1);
    }
    if (toSurahData && toVerse > toSurahData.numberOfAyahs) {
      setToVerse(1);
    }
  }, [fromSurah, toSurah]);

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
        from_surah: fromSurah,
        to_surah: toSurah,
        from_verse: fromVerse,
        to_verse: toVerse,
        note: note,
        achievement_type: achievementType,
        date: date, // Already in DD-MM-YYYY format from URL
      };

      await studentsAPI.addAchievement(student.id, payload);
      onSaved();
      onClose();
      
      // Reset form
      setFromSurah(1);
      setToSurah(1);
      setFromVerse(1);
      setToVerse(1);
      setNote('');
      setAchievementType('normal');
    } catch (err: any) {
      console.error('Error saving achievement:', err);
      setError(err.response?.data?.detail || t("فشل حفظ الإنجاز"));
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

  // Validation: check if all required conditions are met
  const isFormValid = (): boolean => {
    // Check if verses are within valid range
    const fromVerseValid = fromVerse >= 1 && fromVerse <= (fromSurahData?.numberOfAyahs || 1);
    const toVerseValid = toVerse >= 1 && toVerse <= (toSurahData?.numberOfAyahs || 1);
    
    // Check if surahs are selected
    const surahsValid = fromSurah >= 1 && fromSurah <= 114 && toSurah >= 1 && toSurah <= 114;
    
    // Check if achievement type is selected
    const typeValid = achievementType === 'normal' || achievementType === 'review';
    
    // Check logical sequence: "from" should come after "to" (Quran is read backwards in memorization)
    // If same surah, from_verse should be >= to_verse
    // If different surahs, from_surah should be >= to_surah
    let sequenceValid = false;
    if (fromSurah === toSurah) {
      // Same surah: from verse should be greater than or equal to verse (e.g., from verse 20 to verse 1)
      sequenceValid = fromVerse >= toVerse;
    } else {
      // Different surahs: from surah should be greater than or equal to surah (e.g., from surah 3 to surah 2)
      sequenceValid = fromSurah >= toSurah;
    }
    
    // All conditions must be true
    return fromVerseValid && toVerseValid && surahsValid && typeValid && sequenceValid;
  };

  const canSubmit = isFormValid() && !isSaving;
  
  // Get validation error message
  const getValidationError = (): string | null => {
    if (fromVerse < 1 || fromVerse > (fromSurahData?.numberOfAyahs || 1)) {
      return t("رقم الآية \"من\" غير صحيح");
    }
    if (toVerse < 1 || toVerse > (toSurahData?.numberOfAyahs || 1)) {
      return t("رقم الآية \"إلى\" غير صحيح");
    }
    
    // Check sequence
    if (fromSurah === toSurah) {
      if (fromVerse < toVerse) {
        return t("يجب أن تكون الآية \"من\" أكبر من أو تساوي الآية \"إلى\" (الحفظ من الأعلى إلى الأسفل)");
      }
    } else {
      if (fromSurah < toSurah) {
        return t("يجب أن تكون السورة \"من\" أكبر من أو تساوي السورة \"إلى\"");
      }
    }
    
    return null;
  };
  
  const validationError = getValidationError();

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

        {/* Validation Error Message */}
        {validationError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{validationError}</span>
            </div>
          </div>
        )}

        {/* Achievement Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("نوع الإنجاز")}</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="normal"
                checked={achievementType === 'normal'}
                onChange={(e) => setAchievementType(e.target.value as 'normal')}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-gray-700">{t("حفظ")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="review"
                checked={achievementType === 'review'}
                onChange={(e) => setAchievementType(e.target.value as 'review')}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-gray-700">{t("مراجعة")}</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* From Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 text-center">{t("من")}</h3>
            
            {/* From Surah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("السورة")}</label>
              <SearchableSelect
                options={quranSurahs.map((surah) => ({ value: surah.number, label: `${surah.number}. ${surah.name}` }))}
                value={fromSurah}
                onValueChange={(value) => setFromSurah(Number(value))}
                ariaLabel={t("السورة")}
              />
            </div>

            {/* From Verse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("الآية")}</label>
              <input
                type="number"
                min="1"
                max={fromSurahData?.numberOfAyahs || 1}
                value={fromVerse}
                onChange={(e) => setFromVerse(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("الحد الأقصى:")}{' '}{fromSurahData?.numberOfAyahs || 1}{' '}{t("آية")}
              </p>
            </div>
          </div>

          {/* To Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 text-center">{t("إلى")}</h3>
            
            {/* To Surah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("السورة")}</label>
              <SearchableSelect
                options={quranSurahs.map((surah) => ({ value: surah.number, label: `${surah.number}. ${surah.name}` }))}
                value={toSurah}
                onValueChange={(value) => setToSurah(Number(value))}
                ariaLabel={t("السورة")}
              />
            </div>

            {/* To Verse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("الآية")}</label>
              <input
                type="number"
                min="1"
                max={toSurahData?.numberOfAyahs || 1}
                value={toVerse}
                onChange={(e) => setToVerse(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("الحد الأقصى:")}{' '}{toSurahData?.numberOfAyahs || 1}{' '}{t("آية")}
              </p>
            </div>
          </div>
        </div>

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
