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
import { t as tr } from '@/i18n';

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
      <div className="p-8 space-y-10 max-w-3xl mx-auto text-gray-900">
      <h1 className="text-2xl font-bold text-gray-900">{tr("معرض المكوّنات")}</h1>

      {/* Buttons */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">{tr("الأزرار")}</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary">{tr("أساسي")}</Button>
          <Button variant="secondary">{tr("ثانوي")}</Button>
          <Button variant="outline">{tr("حدود")}</Button>
          <Button variant="danger">{tr("خطر")}</Button>
          <Button variant="ghost">{tr("شفاف")}</Button>
          <Button disabled>{tr("معطّل")}</Button>
          <Button isLoading>{tr("جاري...")}</Button>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button size="sm">{tr("صغير")}</Button>
          <Button size="md">{tr("متوسط")}</Button>
          <Button size="lg">{tr("كبير")}</Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">{tr("حقول الإدخال")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label={tr("البريد الإلكتروني")}
            placeholder="example@domain.com"
            leftIcon={<Mail size={16} />}
            helperText={tr("لن نشارك بريدك مع أحد.")}
          />
          <Input
            label={tr("كلمة المرور")}
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={16} />}
            error={tr("كلمة المرور مطلوبة.")}
          />
          <Input
            label={tr("بحث")}
            placeholder={tr("ابحث...")}
            leftIcon={<Search size={16} />}
          />
          <Select
            label={tr("الدور")}
            placeholder={tr("اختر دوراً...")}
            options={[
              { value: 'president', label: tr("رئيس") },
              { value: 'teacher', label: tr("معلم") },
              { value: 'student', label: tr("طالب") },
            ]}
          />
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">{tr("الشارات")}</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="default">{tr("افتراضي")}</Badge>
          <Badge variant="success" dot>{tr("نشط")}</Badge>
          <Badge variant="warning" dot>{tr("معلّق")}</Badge>
          <Badge variant="danger">{tr("ملغي")}</Badge>
          <Badge variant="info">{tr("جديد")}</Badge>
        </div>
      </section>

      {/* Avatars */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">{tr("الصور الشخصية")}</h2>
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
        <h2 className="text-lg font-semibold text-gray-700">{tr("مؤشرات التحميل")}</h2>
        <div className="flex gap-6 items-end">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="md" label={tr("تحميل...")} />
        </div>
      </section>

      {/* Tooltips */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">{tr("تلميحات الأدوات")}</h2>
        <div className="flex flex-wrap gap-4 items-center py-2">
          <Tooltip content={tr("تلميح بالأعلى")} position="top">
            <Button variant="outline" size="sm">{tr("أعلى")}</Button>
          </Tooltip>
          <Tooltip content={tr("تلميح بالأسفل")} position="bottom">
            <Button variant="outline" size="sm">{tr("أسفل")}</Button>
          </Tooltip>
          <Tooltip content={tr("تلميح يمين")} position="right">
            <Button variant="outline" size="sm">{tr("يمين")}</Button>
          </Tooltip>
          <Tooltip content={tr("تلميح يسار")} position="left">
            <Button variant="outline" size="sm">{tr("يسار")}</Button>
          </Tooltip>
        </div>
      </section>

      {/* Overlays */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">{tr("النوافذ والتنبيهات")}</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            {tr("فتح نافذة منبثقة")}
          </Button>
          <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
            {tr("حوار تأكيد")}
          </Button>
          <Button variant="outline" onClick={() => showToast('success', tr("تم الحفظ بنجاح!"))}>
            {tr("تنبيه نجاح")}
          </Button>
          <Button variant="ghost" onClick={() => showToast('error', tr("حدث خطأ غير متوقع."))}>
            {tr("تنبيه خطأ")}
          </Button>
          <Button variant="ghost" onClick={() => showToast('info', tr("لديك إشعارات جديدة."))}>
            {tr("تنبيه معلومة")}
          </Button>
        </div>
      </section>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={tr("إضافة طالب جديد")}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>{tr("إلغاء")}</Button>
            <Button size="sm" onClick={() => { setIsModalOpen(false); showToast('success', tr("تمت الإضافة!")); }}>
              {tr("حفظ")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label={tr("الاسم الكامل")} placeholder={tr("محمد عبدالله")} />
          <Input label={tr("رقم الجوال")} placeholder="05xxxxxxxx" />
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => showToast('success', tr("تم الحذف."))}
        title={tr("تأكيد الحذف")}
        message={tr("هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عنه.")}
        confirmText={tr("نعم، احذف")}
        cancelText={tr("إلغاء")}
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
