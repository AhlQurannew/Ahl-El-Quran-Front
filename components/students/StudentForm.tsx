'use client';

import React, { useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Student } from '@/types/student';

type StudentFormData = Omit<Student, 'id'>;

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => void;
  editingStudent?: Student | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

const EMPTY_FORM: StudentFormData = {
  firstName: '',
  lastName: '',
  gender: 'male',
  halqa: '',
  username: '',
  dob: '',
  pob: '',
  nationality: 'Algerian',
  idType: '',
};

export const StudentForm: React.FC<StudentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingStudent,
  isLoading,
  isSubmitting,
}) => {
  const [form, setForm] = React.useState<StudentFormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Partial<Record<keyof StudentFormData, string>>>({});

  const isEditing = !!editingStudent;

  useEffect(() => {
    if (editingStudent) {
      const { id: _id, ...rest } = editingStudent;
      setForm(rest);
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingStudent, isOpen]);

  const set = (field: keyof StudentFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'الاسم مطلوب';
    if (!form.lastName.trim()) newErrors.lastName = 'الكنية مطلوبة';
    if (!form.username.trim() || !form.username.includes('@')) {
      newErrors.username = 'بريد إلكتروني صحيح مطلوب';
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
      title={isEditing ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading || isSubmitting}>
            إلغاء
          </Button>
          <Button size="sm" isLoading={isLoading || isSubmitting} onClick={handleSubmit}>
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
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="الكنية *"
            placeholder="مثال: يعقوب"
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>

        {/* Username/Email & Gender */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="اسم المستخدم (البريد) *"
            placeholder="yakoube@gmail.com"
            type="email"
            value={form.username}
            onChange={(e) => set('username', e.target.value)}
            error={errors.username}
          />
          <Select
            label="الجنس"
            value={form.gender}
            onChange={(e) => set('gender', e.target.value as 'male' | 'female')}
            options={[
              { value: 'male', label: 'ذكر' },
              { value: 'female', label: 'أنثى' },
            ]}
          />
        </div>

        {/* Halqa & DOB */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="الحلقة"
            placeholder="حلقة أحمد"
            value={form.halqa || ''}
            onChange={(e) => set('halqa', e.target.value)}
          />
          <Input
            label="تاريخ الميلاد"
            type="date"
            value={form.dob}
            onChange={(e) => set('dob', e.target.value)}
          />
        </div>

        {/* POB & Nationality */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="مكان الميلاد"
            placeholder="bourouba"
            value={form.pob}
            onChange={(e) => set('pob', e.target.value)}
          />
          <Input
            label="الجنسية"
            placeholder="Algerian"
            value={form.nationality}
            onChange={(e) => set('nationality', e.target.value)}
          />
        </div>

        {/* ID Type */}
        <Input
          label="نوع الهوية"
          placeholder="بطاقة تعريف / جواز..."
          value={form.idType || ''}
          onChange={(e) => set('idType', e.target.value)}
        />
      </form>
    </Modal>
  );
};
