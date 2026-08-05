'use client';

import React, { useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { MemorizationRecord } from '@/types/memorization';

type MemorizationFormData = Omit<MemorizationRecord, 'id'>;

interface MemorizationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemorizationFormData) => void;
  editingRecord?: MemorizationRecord | null;
  isLoading?: boolean;
}

const EMPTY_FORM: MemorizationFormData = {
  name: '',
  halqa: '',
  joinDate: '',
  status: 'active',
  surah: '',
  ayah: '',
  notes: '',
};

export const MemorizationForm: React.FC<MemorizationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRecord,
  isLoading,
}) => {
  const [form, setForm] = React.useState<MemorizationFormData>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Partial<Record<keyof MemorizationFormData, string>>>({});

  const isEditing = !!editingRecord;

  // Pre-fill when editing
  useEffect(() => {
    if (editingRecord) {
      const { id: _id, ...rest } = editingRecord;
      setForm(rest);
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingRecord, isOpen]);

  const set = (field: keyof MemorizationFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'اسم الطالب مطلوب';
    if (!form.surah.trim()) newErrors.surah = 'اسم السورة مطلوب';
    if (!form.ayah.trim()) newErrors.ayah = 'رقم الآية مطلوب';
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
      title={isEditing ? 'تعديل سجل الإنجاز' : 'إضافة سجل إنجاز جديد'}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button size="sm" isLoading={isLoading} onClick={handleSubmit}>
            {isEditing ? 'حفظ التعديلات' : 'إضافة السجل'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <Input
          label="اسم الطالب *"
          placeholder="مثال: أحمد معتصم"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
        />

        {/* Surah & Ayah */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="اسم السورة *"
            placeholder="مثال: البقرة"
            value={form.surah}
            onChange={(e) => set('surah', e.target.value)}
            error={errors.surah}
          />
          <Input
            label="إلى الآية *"
            placeholder="مثال: 185 أو كاملة"
            value={form.ayah}
            onChange={(e) => set('ayah', e.target.value)}
            error={errors.ayah}
          />
        </div>

        {/* Halqa + Join Date */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="الحلقة"
            placeholder="حلقة أحمد"
            value={form.halqa || ''}
            onChange={(e) => set('halqa', e.target.value)}
          />
          <Input
            label="تاريخ الانضمام"
            type="date"
            value={form.joinDate || ''}
            onChange={(e) => set('joinDate', e.target.value)}
          />
        </div>

        {/* Status */}
        <Select
          label="الحالة"
          value={form.status}
          onChange={(e) => set('status', e.target.value)}
          options={[
            { value: 'active', label: 'نشط' },
            { value: 'inactive', label: 'غير نشط' },
          ]}
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ملاحظات</label>
          <textarea
            placeholder="أي ملاحظات إضافية..."
            value={form.notes || ''}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 resize-none transition-all"
          />
        </div>
      </form>
    </Modal>
  );
};
