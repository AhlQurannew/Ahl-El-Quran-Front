'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Teacher, TeacherCreatePayload } from '@/types/teacher';

interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeacherCreatePayload) => void;
  editingTeacher?: Teacher | null;
  isSubmitting?: boolean;
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswordReset, setShowPasswordReset] = useState(false);

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
      setFormData({
        firstname: editingTeacher.firstname,
        lastname: editingTeacher.lastname,
        email: editingTeacher.email,
        riwaya: editingTeacher.riwaya,
        password: '',
      });
      setShowPasswordReset(false); // Hide password reset by default
    } else {
      // Create mode - include password
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        riwaya: 'حفص عن عاصم',
        password: generatePassword(),
      });
      setShowPasswordReset(false);
    }
    setErrors({});
  }, [editingTeacher, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname?.trim()) {
      newErrors.firstname = 'الاسم مطلوب';
    }
    if (!formData.lastname?.trim()) {
      newErrors.lastname = 'اللقب مطلوب';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    if (!formData.riwaya?.trim()) {
      newErrors.riwaya = 'الرواية مطلوبة';
    }
    
    // Password is only required in create mode OR if password reset is enabled in edit mode
    if (!editingTeacher && !formData.password?.trim()) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if ((!editingTeacher || showPasswordReset) && formData.password && formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
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
          {editingTeacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}
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
          label="الاسم الأول"
          value={formData.firstname || ''}
          onChange={(e) => handleChange('firstname', e.target.value)}
          placeholder="أدخل الاسم الأول"
          error={errors.firstname}
          required
          disabled={isSubmitting}
        />

        {/* Last Name */}
        <Input
          label="اسم العائلة"
          value={formData.lastname || ''}
          onChange={(e) => handleChange('lastname', e.target.value)}
          placeholder="أدخل اسم العائلة"
          error={errors.lastname}
          required
          disabled={isSubmitting}
        />

        {/* Email */}
        <Input
          label="البريد الإلكتروني"
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
            الرواية <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.riwaya || 'حفص عن عاصم'}
            onChange={(e) => handleChange('riwaya', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
            disabled={isSubmitting}
          >
            <option value="حفص عن عاصم">حفص عن عاصم</option>
            <option value="ورش عن نافع">ورش عن نافع</option>
            <option value="قالون عن نافع">قالون عن نافع</option>
            <option value="الدوري عن أبي عمرو">الدوري عن أبي عمرو</option>
            <option value="السوسي عن أبي عمرو">السوسي عن أبي عمرو</option>
          </select>
          {errors.riwaya && (
            <p className="mt-1 text-sm text-red-600">{errors.riwaya}</p>
          )}
        </div>

        {/* Password - Show in create mode OR when reset password is enabled in edit mode */}
        {!editingTeacher ? (
          // Create mode - always show password
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="أدخل كلمة المرور"
                error={errors.password}
                required
                disabled={isSubmitting}
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="توليد كلمة مرور"
                disabled={isSubmitting}
              >
                <RefreshCw size={18} />
                توليد
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
                <h3 className="text-sm font-bold text-gray-800">إعادة تعيين كلمة المرور</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {showPasswordReset 
                    ? 'قم بإدخال كلمة مرور جديدة للمعلم' 
                    : 'في حال نسيان المعلم لكلمة المرور، يمكنك إعادة تعيينها'}
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
                  إعادة تعيين كلمة المرور
                </button>
              )}
            </div>

            {showPasswordReset && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={formData.password || ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة"
                    error={errors.password}
                    required
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="توليد كلمة مرور"
                    disabled={isSubmitting}
                  >
                    <RefreshCw size={18} />
                    توليد
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
                  إلغاء إعادة التعيين
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الحفظ...' : editingTeacher ? 'حفظ التعديلات' : 'إضافة المعلم'}
          </Button>
          <Button 
            type="button" 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
};
