'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Teacher } from '@/types/teacher';

interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Teacher, 'id'>) => void;
  editingTeacher?: Teacher | null;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTeacher,
}) => {
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    user_id: '',
    firstname: '',
    lastname: '',
    email: '',
    ruaya: '',
    hire_date: new Date().toISOString().split('T')[0],
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTeacher) {
      setFormData({
        user_id: editingTeacher.user_id,
        firstname: editingTeacher.firstname,
        lastname: editingTeacher.lastname,
        email: editingTeacher.email,
        ruaya: editingTeacher.ruaya,
        hire_date: editingTeacher.hire_date.split('T')[0],
        is_active: editingTeacher.is_active,
      });
    } else {
      setFormData({
        user_id: '',
        firstname: '',
        lastname: '',
        email: '',
        ruaya: '',
        hire_date: new Date().toISOString().split('T')[0],
        is_active: true,
      });
    }
    setErrors({});
  }, [editingTeacher, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'الاسم مطلوب';
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = 'اللقب مطلوب';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    if (!formData.hire_date) {
      newErrors.hire_date = 'تاريخ التوظيف مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        hire_date: new Date(formData.hire_date).toISOString(),
      });
    }
  };

  const handleChange = (field: keyof Omit<Teacher, 'id'>, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
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
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User ID */}
        <Input
          label="رقم المستخدم"
          value={formData.user_id}
          onChange={(e) => handleChange('user_id', e.target.value)}
          placeholder="أدخل رقم المستخدم"
          error={errors.user_id}
        />

        {/* First Name */}
        <Input
          label="الاسم"
          value={formData.firstname}
          onChange={(e) => handleChange('firstname', e.target.value)}
          placeholder="أدخل الاسم"
          error={errors.firstname}
          required
        />

        {/* Last Name */}
        <Input
          label="اللقب"
          value={formData.lastname}
          onChange={(e) => handleChange('lastname', e.target.value)}
          placeholder="أدخل اللقب"
          error={errors.lastname}
          required
        />

        {/* Email */}
        <Input
          label="البريد الإلكتروني"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="example@domain.com"
          error={errors.email}
          required
        />

        {/* Ruaya */}
        <Input
          label="الرؤية"
          value={formData.ruaya}
          onChange={(e) => handleChange('ruaya', e.target.value)}
          placeholder="أدخل الرؤية"
          error={errors.ruaya}
        />

        {/* Hire Date */}
        <Input
          label="تاريخ التوظيف"
          type="date"
          value={formData.hire_date}
          onChange={(e) => handleChange('hire_date', e.target.value)}
          error={errors.hire_date}
          required
        />

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
          />
          <label
            htmlFor="is_active"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            المعلم نشط
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button type="submit" variant="primary" className="flex-1">
            {editingTeacher ? 'حفظ التعديلات' : 'إضافة المعلم'}
          </Button>
          <Button type="button" onClick={onClose} variant="outline" className="flex-1">
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
};
