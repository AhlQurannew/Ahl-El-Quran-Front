'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Supervisor, SupervisorCreatePayload, SupervisorUpdatePayload } from '@/types/supervisor';

interface SupervisorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupervisorCreatePayload | SupervisorUpdatePayload) => void;
  editingSupervisor?: Supervisor | null;
  isSubmitting?: boolean;
}

export const SupervisorForm: React.FC<SupervisorFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingSupervisor,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<SupervisorCreatePayload | SupervisorUpdatePayload>({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (editingSupervisor) {
      // Edit mode - only include editable fields
      setFormData({
        firstname: editingSupervisor.firstname,
        lastname: editingSupervisor.lastname,
        email: editingSupervisor.email,
        password: '', // Optional in edit mode
      });
    } else {
      // Create mode - include password
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        password: generatePassword(),
      });
    }
    setErrors({});
  }, [editingSupervisor, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname?.trim()) {
      newErrors.firstname = 'الاسم الأول مطلوب';
    }
    if (!formData.lastname?.trim()) {
      newErrors.lastname = 'الاسم الأخير مطلوب';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    // Password is only required in create mode
    if (!editingSupervisor && !formData.password?.trim()) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Remove empty password from edit payload
      const submitData = { ...formData };
      if (editingSupervisor && !submitData.password?.trim()) {
        delete submitData.password;
      }
      onSubmit(submitData);
    }
  };

  const handleChange = (field: keyof SupervisorCreatePayload, value: string) => {
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
          {editingSupervisor ? 'تعديل بيانات المشرف' : 'إضافة مشرف جديد'}
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
          label="الاسم الأخير"
          value={formData.lastname || ''}
          onChange={(e) => handleChange('lastname', e.target.value)}
          placeholder="أدخل الاسم الأخير"
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

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            كلمة المرور {!editingSupervisor && <span className="text-red-500">*</span>}
            {editingSupervisor && <span className="text-gray-500 text-xs">(اختياري)</span>}
          </label>
          <div className="flex gap-2">
            <Input
              value={formData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={editingSupervisor ? 'اترك فارغاً للحفاظ على كلمة المرور الحالية' : 'أدخل كلمة المرور'}
              error={errors.password}
              required={!editingSupervisor}
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

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button 
            type="submit" 
            variant="primary" 
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الحفظ...' : editingSupervisor ? 'حفظ التعديلات' : 'إضافة المشرف'}
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
