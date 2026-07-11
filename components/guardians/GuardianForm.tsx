'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Guardian } from '@/types/guardian';

interface GuardianFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Guardian, 'id'>) => void;
  editingGuardian?: Guardian | null;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'father', label: 'أب' },
  { value: 'mother', label: 'أم' },
  { value: 'brother', label: 'أخ' },
  { value: 'sister', label: 'أخت' },
  { value: 'uncle', label: 'عم' },
  { value: 'aunt', label: 'عمة' },
  { value: 'grandfather', label: 'جد' },
  { value: 'grandmother', label: 'جدة' },
  { value: 'guardian', label: 'وصي' },
  { value: 'other', label: 'أخرى' },
];

export const GuardianForm: React.FC<GuardianFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingGuardian,
}) => {
  const [formData, setFormData] = useState<Omit<Guardian, 'id'>>({
    guardianId: null,
    firstName: null,
    lastName: null,
    relationship: null,
    guardianContactId: null,
    guardianAccountId: null,
    homeAddress: null,
    job: null,
    profileImage: null,
    email: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingGuardian) {
      setFormData({
        guardianId: editingGuardian.guardianId,
        firstName: editingGuardian.firstName,
        lastName: editingGuardian.lastName,
        relationship: editingGuardian.relationship,
        guardianContactId: editingGuardian.guardianContactId,
        guardianAccountId: editingGuardian.guardianAccountId,
        homeAddress: editingGuardian.homeAddress,
        job: editingGuardian.job,
        profileImage: editingGuardian.profileImage,
        email: editingGuardian.email,
      });
    } else {
      setFormData({
        guardianId: null,
        firstName: null,
        lastName: null,
        relationship: null,
        guardianContactId: null,
        guardianAccountId: null,
        homeAddress: null,
        job: null,
        profileImage: null,
        email: null,
      });
    }
    setErrors({});
  }, [editingGuardian, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof Omit<Guardian, 'id'>, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">
          {editingGuardian ? 'تعديل بيانات ولي الأمر' : 'إضافة ولي أمر جديد'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* First Name */}
          <Input
            label="الاسم"
            value={formData.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value || null)}
            placeholder="أدخل الاسم"
            error={errors.firstName}
          />

          {/* Last Name */}
          <Input
            label="اللقب"
            value={formData.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value || null)}
            placeholder="أدخل اللقب"
            error={errors.lastName}
          />
        </div>

        {/* Relationship */}
        <Select
          label="صلة القرابة"
          value={formData.relationship || ''}
          onChange={(e) => handleChange('relationship', e.target.value || null)}
          options={RELATIONSHIP_OPTIONS}
          placeholder="اختر صلة القرابة"
          error={errors.relationship}
        />

        {/* Email */}
        <Input
          label="البريد الإلكتروني"
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value || null)}
          placeholder="example@domain.com"
          error={errors.email}
        />

        {/* Home Address */}
        <Input
          label="العنوان"
          value={formData.homeAddress || ''}
          onChange={(e) => handleChange('homeAddress', e.target.value || null)}
          placeholder="أدخل عنوان المنزل"
          error={errors.homeAddress}
        />

        {/* Job */}
        <Input
          label="المهنة"
          value={formData.job || ''}
          onChange={(e) => handleChange('job', e.target.value || null)}
          placeholder="أدخل المهنة"
          error={errors.job}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Guardian ID */}
          <Input
            label="رقم ولي الأمر"
            type="number"
            value={formData.guardianId?.toString() || ''}
            onChange={(e) => handleChange('guardianId', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="أدخل رقم ولي الأمر"
            error={errors.guardianId}
          />

          {/* Guardian Contact ID */}
          <Input
            label="رقم جهة الاتصال"
            type="number"
            value={formData.guardianContactId?.toString() || ''}
            onChange={(e) => handleChange('guardianContactId', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="أدخل رقم جهة الاتصال"
            error={errors.guardianContactId}
          />
        </div>

        {/* Guardian Account ID */}
        <Input
          label="رقم الحساب"
          type="number"
          value={formData.guardianAccountId?.toString() || ''}
          onChange={(e) => handleChange('guardianAccountId', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="أدخل رقم الحساب"
          error={errors.guardianAccountId}
        />

        {/* Profile Image URL */}
        <Input
          label="رابط الصورة الشخصية"
          value={formData.profileImage || ''}
          onChange={(e) => handleChange('profileImage', e.target.value || null)}
          placeholder="https://example.com/image.jpg"
          error={errors.profileImage}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button type="submit" variant="primary" className="flex-1">
            {editingGuardian ? 'حفظ التعديلات' : 'إضافة ولي الأمر'}
          </Button>
          <Button type="button" onClick={onClose} variant="outline" className="flex-1">
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
};
