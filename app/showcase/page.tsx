'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';
import { Mail, Lock, Search } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

export default function ComponentShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; message: string }>({
    visible: false,
    type: 'success',
    message: '',
  });

  const showToast = (type: ToastType, message: string) =>
    setToast({ visible: true, type, message });

  return (
    <div className="bg-white min-h-screen">
      <div className="p-8 space-y-10 max-w-3xl mx-auto text-gray-900" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900">معرض المكوّنات</h1>

      {/* Buttons */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">الأزرار</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary">أساسي</Button>
          <Button variant="secondary">ثانوي</Button>
          <Button variant="outline">حدود</Button>
          <Button variant="danger">خطر</Button>
          <Button variant="ghost">شفاف</Button>
          <Button disabled>معطّل</Button>
          <Button isLoading>جاري...</Button>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button size="sm">صغير</Button>
          <Button size="md">متوسط</Button>
          <Button size="lg">كبير</Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">حقول الإدخال</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="البريد الإلكتروني"
            placeholder="example@domain.com"
            leftIcon={<Mail size={16} />}
            helperText="لن نشارك بريدك مع أحد."
          />
          <Input
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={16} />}
            error="كلمة المرور مطلوبة."
          />
          <Input
            label="بحث"
            placeholder="ابحث..."
            leftIcon={<Search size={16} />}
          />
          <Select
            label="الدور"
            placeholder="اختر دوراً..."
            options={[
              { value: 'president', label: 'رئيس' },
              { value: 'teacher', label: 'معلم' },
              { value: 'student', label: 'طالب' },
            ]}
          />
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">الشارات</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="default">افتراضي</Badge>
          <Badge variant="success" dot>نشط</Badge>
          <Badge variant="warning" dot>معلّق</Badge>
          <Badge variant="danger">ملغي</Badge>
          <Badge variant="info">جديد</Badge>
        </div>
      </section>

      {/* Avatars */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">الصور الشخصية</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <Avatar name="محمد أحمد" size="sm" status="online" />
          <Avatar name="فاطمة علي" size="md" status="busy" />
          <Avatar name="عبدالله عمر" size="lg" status="offline" />
          <Avatar name="نورة سالم" size="xl" />
          <Avatar size="md" />
        </div>
      </section>

      {/* Spinners */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">مؤشرات التحميل</h2>
        <div className="flex gap-6 items-end">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="md" label="تحميل..." />
        </div>
      </section>

      {/* Tooltips */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">تلميحات الأدوات</h2>
        <div className="flex flex-wrap gap-4 items-center py-2">
          <Tooltip content="تلميح بالأعلى" position="top">
            <Button variant="outline" size="sm">أعلى</Button>
          </Tooltip>
          <Tooltip content="تلميح بالأسفل" position="bottom">
            <Button variant="outline" size="sm">أسفل</Button>
          </Tooltip>
          <Tooltip content="تلميح يمين" position="right">
            <Button variant="outline" size="sm">يمين</Button>
          </Tooltip>
          <Tooltip content="تلميح يسار" position="left">
            <Button variant="outline" size="sm">يسار</Button>
          </Tooltip>
        </div>
      </section>

      {/* Overlays */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">النوافذ والتنبيهات</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            فتح نافذة منبثقة
          </Button>
          <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
            حوار تأكيد
          </Button>
          <Button variant="outline" onClick={() => showToast('success', 'تم الحفظ بنجاح!')}>
            تنبيه نجاح
          </Button>
          <Button variant="ghost" onClick={() => showToast('error', 'حدث خطأ غير متوقع.')}>
            تنبيه خطأ
          </Button>
          <Button variant="ghost" onClick={() => showToast('info', 'لديك إشعارات جديدة.')}>
            تنبيه معلومة
          </Button>
        </div>
      </section>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة طالب جديد"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button size="sm" onClick={() => { setIsModalOpen(false); showToast('success', 'تمت الإضافة!'); }}>
              حفظ
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="الاسم الكامل" placeholder="محمد عبدالله" />
          <Input label="رقم الجوال" placeholder="05xxxxxxxx" />
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => showToast('success', 'تم الحذف.')}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عنه."
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        variant="danger"
      />

      {/* Toast */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
      </div>
    </div>
  );
}
