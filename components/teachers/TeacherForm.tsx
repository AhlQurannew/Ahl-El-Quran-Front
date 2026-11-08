'use client';

import { sameValues } from '@/utils/formChanges';
import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Teacher, TeacherCreatePayload } from '@/types/teacher';
import teacherAPI from '@/app/API/teacher';
import { t } from '@/i18n';

interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeacherCreatePayload) => void;
  editingTeacher?: Teacher | null;
  isSubmitting?: boolean;
}

const EMPTY_PROFILE = {
  registration_number: '',
  speciality: '',
  date_of_birth: '',
  place_of_birth: '',
  phone_number: '',
  address: '',
  medical_condition: '',
};

const REGISTRATION_NUMBER = /^[A-Za-z0-9][A-Za-z0-9_/-]{0,29}$/;

/** Editable fields of a teacher, as the form holds them. */
function teacherToForm(teacher: Teacher): TeacherCreatePayload {
  return {
    firstname: teacher.firstname,
    lastname: teacher.lastname,
    email: teacher.email,
    riwaya: teacher.riwaya,
    password: '',
    registration_number: teacher.registration_number ?? '',
    speciality: teacher.speciality ?? '',
    date_of_birth: teacher.date_of_birth ?? '',
    place_of_birth: teacher.place_of_birth ?? '',
    phone_number: teacher.phone_number ?? '',
    address: teacher.address ?? '',
    medical_condition: teacher.medical_condition ?? '',
  };
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTeacher,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<TeacherCreatePayload>({
    firstname: '',
    lastname: '',
    email: '',
    riwaya: 'حفص عن عاصم',
    password: '',
    ...EMPTY_PROFILE,
  });

  const [loadingNumber, setLoadingNumber] = useState(false);
  const suggestRegistrationNumber = async () => {
    setLoadingNumber(true);
    try {
      const value = await teacherAPI.getNextRegistrationNumber();
      setFormData((prev) => ({ ...prev, registration_number: value }));
    } catch (error) {
      // Not fatal: the server generates one when the field is left empty.
      console.error('Unable to suggest a registration number:', error);
    } finally {
      setLoadingNumber(false);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const unchanged = !!editingTeacher && sameValues(formData, teacherToForm(editingTeacher));

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  useEffect(() => {
    if (editingTeacher) {
      // Edit mode - only include editable fields
      setFormData(teacherToForm(editingTeacher));
      setShowPasswordReset(false); // Hide password reset by default
    } else {
      // Create mode - include password
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        riwaya: 'حفص عن عاصم',
        password: generatePassword(),
        ...EMPTY_PROFILE,
      });
      setShowPasswordReset(false);
      if (isOpen) void suggestRegistrationNumber();
    }
    setErrors({});
  }, [editingTeacher, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname?.trim()) {
      newErrors.firstname = t("الاسم مطلوب");
    }
    if (!formData.lastname?.trim()) {
      newErrors.lastname = t("اللقب مطلوب");
    }
    if (!formData.email?.trim()) {
      newErrors.email = t("البريد الإلكتروني مطلوب");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("البريد الإلكتروني غير صحيح");
    }
    if (!formData.riwaya?.trim()) {
      newErrors.riwaya = t("الرواية مطلوبة");
    }
    if (formData.registration_number?.trim() && !REGISTRATION_NUMBER.test(formData.registration_number.trim())) {
      newErrors.registration_number = t("يُسمح فقط بالحروف والأرقام و- و_ و/ (30 حرفاً كحد أقصى)");
    }
    if (formData.phone_number?.trim() && !/^[0-9+\s-]{6,20}$/.test(formData.phone_number.trim())) {
      newErrors.phone_number = t("رقم الهاتف غير صالح");
    }
    
    // Password is only required in create mode OR if password reset is enabled in edit mode
    if (!editingTeacher && !formData.password?.trim()) {
      newErrors.password = t("كلمة المرور مطلوبة");
    } else if ((!editingTeacher || showPasswordReset) && formData.password && formData.password.length < 6) {
      newErrors.password = t("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Only include password in payload if it's create mode or password reset is enabled
      if (editingTeacher && !showPasswordReset) {
        // Edit mode without password reset - omit password
        const { password, ...submitData } = formData;
        onSubmit(submitData as TeacherCreatePayload);
      } else {
        // Create mode or edit mode with password reset - include password
        onSubmit(formData);
      }
    }
  };

  const handleChange = (field: keyof TeacherCreatePayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData((prev) => ({ ...prev, password: newPassword }));
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">
          {editingTeacher ? t("تعديل بيانات المعلم") : t("إضافة معلم جديد")}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isSubmitting}
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* First Name */}
        <Input
          label={t("الاسم الأول")}
          value={formData.firstname || ''}
          onChange={(e) => handleChange('firstname', e.target.value)}
          placeholder={t("أدخل الاسم الأول")}
          error={errors.firstname}
          required
          disabled={isSubmitting}
        />

        {/* Last Name */}
        <Input
          label={t("اسم العائلة")}
          value={formData.lastname || ''}
          onChange={(e) => handleChange('lastname', e.target.value)}
          placeholder={t("أدخل اسم العائلة")}
          error={errors.lastname}
          required
          disabled={isSubmitting}
        />

        {/* Email */}
        <Input
          label={t("البريد الإلكتروني")}
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="example@domain.com"
          error={errors.email}
          required
          disabled={isSubmitting}
        />

        {/* Riwaya */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("الرواية")}{' '}<span className="text-red-500">*</span>
          </label>
          <select
            value={formData.riwaya || 'حفص عن عاصم'}
            onChange={(e) => handleChange('riwaya', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
            disabled={isSubmitting}
          >
            <option value="حفص عن عاصم">{t("حفص عن عاصم")}</option>
            <option value="ورش عن نافع">{t("ورش عن نافع")}</option>
            <option value="قالون عن نافع">{t("قالون عن نافع")}</option>
            <option value="الدوري عن أبي عمرو">{t("الدوري عن أبي عمرو")}</option>
            <option value="السوسي عن أبي عمرو">{t("السوسي عن أبي عمرو")}</option>
          </select>
          {errors.riwaya && (
            <p className="mt-1 text-sm text-red-600">{errors.riwaya}</p>
          )}
        </div>

        {/* Professional profile */}
        <fieldset className="space-y-4 rounded-xl border border-gray-200 p-4">
          <legend className="px-1 text-xs font-semibold text-gray-500">{t("الملف المهني")}</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t("رقم التسجيل")}
              value={formData.registration_number || ''}
              onChange={(e) => handleChange('registration_number', e.target.value)}
              placeholder="T2026-0001"
              maxLength={30}
              error={errors.registration_number}
              helperText={editingTeacher ? undefined : t("يُنشأ تلقائياً ويمكن تعديله")}
              disabled={isSubmitting}
              rightIcon={
                <button
                  type="button"
                  onClick={() => void suggestRegistrationNumber()}
                  disabled={loadingNumber || isSubmitting}
                  className="pointer-events-auto text-gray-400 hover:text-emerald-600 disabled:opacity-50"
                  aria-label={t("توليد رقم جديد")}
                  title={t("توليد رقم جديد")}
                >
                  <RefreshCw size={15} className={loadingNumber ? 'animate-spin' : ''} />
                </button>
              }
            />
            <Input
              label={t("التخصص / المجال")}
              value={formData.speciality || ''}
              onChange={(e) => handleChange('speciality', e.target.value)}
              placeholder={t("مثال: التجويد، القراءات، الفقه")}
              maxLength={150}
              disabled={isSubmitting}
            />
            <Input
              label={t("تاريخ الميلاد")}
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              label={t("مكان الميلاد")}
              value={formData.place_of_birth || ''}
              onChange={(e) => handleChange('place_of_birth', e.target.value)}
              maxLength={100}
              disabled={isSubmitting}
            />
            <Input
              label={t("رقم الهاتف")}
              type="tel"
              dir="ltr"
              value={formData.phone_number || ''}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              placeholder="0555 123 456"
              error={errors.phone_number}
              maxLength={20}
              disabled={isSubmitting}
            />
            <Input
              label={t("العنوان")}
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              maxLength={255}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="teacher-medical" className="mb-1.5 block text-sm font-semibold text-gray-700">
              {t("الحالة الصحية / ملاحظات طبية")}
            </label>
            <textarea
              id="teacher-medical"
              value={formData.medical_condition || ''}
              onChange={(e) => handleChange('medical_condition', e.target.value)}
              maxLength={2000}
              rows={2}
              disabled={isSubmitting}
              placeholder={t("مثال: ربو، حساسية... (اتركه فارغاً إن لم توجد)")}
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>
        </fieldset>

        {/* Password - Show in create mode OR when reset password is enabled in edit mode */}
        {!editingTeacher ? (
          // Create mode - always show password
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("كلمة المرور")}{' '}<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={t("أدخل كلمة المرور")}
                error={errors.password}
                required
                disabled={isSubmitting}
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t("توليد كلمة مرور")}
                disabled={isSubmitting}
              >
                <RefreshCw size={18} />
                {t("توليد")}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        ) : (
          // Edit mode - show reset password option
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-800">{t("إعادة تعيين كلمة المرور")}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {showPasswordReset 
                    ? t("قم بإدخال كلمة مرور جديدة للمعلم") 
                    : t("في حال نسيان المعلم لكلمة المرور، يمكنك إعادة تعيينها")}
                </p>
              </div>
              {!showPasswordReset && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordReset(true);
                    setFormData((prev) => ({ ...prev, password: generatePassword() }));
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {t("إعادة تعيين كلمة المرور")}
                </button>
              )}
            </div>

            {showPasswordReset && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={formData.password || ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder={t("أدخل كلمة المرور الجديدة")}
                    error={errors.password}
                    required
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t("توليد كلمة مرور")}
                    disabled={isSubmitting}
                  >
                    <RefreshCw size={18} />
                    {t("توليد")}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordReset(false);
                    setFormData((prev) => ({ ...prev, password: '' }));
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {t("إلغاء إعادة التعيين")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button 
            type="submit" 
            variant="primary" 
            className="flex-1"
            disabled={isSubmitting || unchanged}
            title={unchanged ? t("لا توجد تعديلات") : undefined}
          >
            {isSubmitting ? t("جاري الحفظ...") : editingTeacher ? t("حفظ التعديلات") : t("إضافة المعلم")}
          </Button>
          <Button 
            type="button" 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
            disabled={isSubmitting}
          >
            {t("إلغاء")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
