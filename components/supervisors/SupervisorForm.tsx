'use client';

import React, { useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Supervisor } from '@/types/supervisor';

type SupervisorFormData = Omit<Supervisor, 'id' | 'createdAt'>;

interface SupervisorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupervisorFormData) => void;
  editingSupervisor?: Supervisor | null;
  isLoading?: boolean;
}

const EMPTY_FORM: SupervisorFormData = {
  firstname: '',
  lastname: '',
  email: '',
  isActive: true,
};

export const SupervisorForm: React.FC<SupervisorFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingSupervisor,
  isLoading,
}) => {
  const [form, setForm] = React.useState<SupervisorFormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Partial<Record<keyof SupervisorFormData, string>>>({});

  const isEditing = !!editingSupervisor;

  useEffect(() => {
    if (editingSupervisor) {
      const { id: _id, createdAt: _createdAt, ...rest } = editingSupervisor;
      setForm(rest);
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingSupervisor, isOpen]);

  const set = (field: keyof SupervisorFormData, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.firstname.trim()) newErrors.firstname = 'الاسم مطلوب';
    if (!form.lastname.trim()) newErrors.lastname = 'الكنية مطلوبة';
    if (!form.email.trim() || !form.email.includes('@')) {
      newErrors.email = 'بريد إلكتروني صحيح مطلوب';
    }
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
      title={isEditing ? 'تعديل بيانات المشرف' : 'إضافة مشرف جديد'}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button size="sm" isLoading={isLoading} onClick={handleSubmit}>
            {isEditing ? 'حفظ التعديلات' : 'إضافة'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First & Last name */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="الاسم *"
            placeholder="مثال: أحمد"
            value={form.firstname}
            onChange={(e) => set('firstname', e.target.value)}
            error={errors.firstname}
          />
          <Input
            label="الكنية *"
            placeholder="مثال: يعقوب"
            value={form.lastname}
            onChange={(e) => set('lastname', e.target.value)}
            error={errors.lastname}
          />
        </div>

        {/* Email */}
        <Input
          label="البريد الإلكتروني *"
          placeholder="yakoube@gmail.com"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
        />

        {/* Status */}
        <Select
          label="الحالة"
          value={form.isActive ? 'active' : 'inactive'}
          onChange={(e) => set('isActive', e.target.value === 'active')}
          options={[
            { value: 'active', label: 'نشط' },
            { value: 'inactive', label: 'غير نشط' },
          ]}
        />
      </form>
    </Modal>
  );
};
