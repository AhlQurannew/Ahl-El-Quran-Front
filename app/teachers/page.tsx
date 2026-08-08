'use client';

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { AppLayout } from '@/components/layout/AppLayout';
import { TeacherSearch } from '@/components/teachers/TeacherSearch';
import { TeacherTable } from '@/components/teachers/TeacherTable';
import { TeacherForm } from '@/components/teachers/TeacherForm';
import { TeacherStats } from '@/components/teachers/TeacherStats';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import type { Teacher } from '@/types/teacher';

// ─── Seed data ─────────────────────────────────────────────
const SEED_TEACHERS: Teacher[] = [
  {
    id: '1',
    user_id: 'USR001',
    firstname: 'محمد',
    lastname: 'أحمد',
    email: 'mohamed.ahmed@example.com',
    ruaya: 'حفص عن عاصم',
    hire_date: '2020-09-01T00:00:00.000Z',
    is_active: true,
  },
  {
    id: '2',
    user_id: 'USR002',
    firstname: 'فاطمة',
    lastname: 'علي',
    email: 'fatima.ali@example.com',
    ruaya: 'ورش عن نافع',
    hire_date: '2019-03-15T00:00:00.000Z',
    is_active: true,
  },
  {
    id: '3',
    user_id: 'USR003',
    firstname: 'خالد',
    lastname: 'حسن',
    email: 'khaled.hassan@example.com',
    ruaya: 'حفص عن عاصم',
    hire_date: '2021-01-20T00:00:00.000Z',
    is_active: false,
  },
  {
    id: '4',
    user_id: 'USR004',
    firstname: 'عائشة',
    lastname: 'محمود',
    email: 'aisha.mahmoud@example.com',
    ruaya: 'قالون عن نافع',
    hire_date: '2018-07-10T00:00:00.000Z',
    is_active: true,
  },
  {
    id: '5',
    user_id: 'USR005',
    firstname: 'عبد الله',
    lastname: 'يوسف',
    email: 'abdullah.youssef@example.com',
    ruaya: 'حفص عن عاصم',
    hire_date: '2022-02-28T00:00:00.000Z',
    is_active: true,
  },
];

type ToastState = { visible: boolean; type: 'success' | 'info'; message: string };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(SEED_TEACHERS);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });

  // ── Derived filtered list ──
  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      const q = query.toLowerCase();
      return (
        t.firstname.toLowerCase().includes(q) ||
        t.lastname.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.ruaya ?? '').toLowerCase().includes(q)
      );
    });
  }, [teachers, query]);

  // ── Helpers ──
  const showToast = (type: ToastState['type'], message: string) =>
    setToast({ visible: true, type, message });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((t) => t.id));
    }
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    setIsFormOpen(true);
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) return;
    const target = teachers.find((t) => t.id === selectedIds[0]);
    if (target) {
      setEditingTeacher(target);
      setIsFormOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    setTeachers((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
    showToast('success', `تم حذف عدد ${selectedIds.length} معلم بنجاح`);
    setSelectedIds([]);
  };

  const handleFormSubmit = (data: Omit<Teacher, 'id'>) => {
    if (editingTeacher) {
      setTeachers((prev) =>
        prev.map((t) => (t.id === editingTeacher.id ? { ...data, id: editingTeacher.id } : t))
      );
      showToast('success', `تم تعديل بيانات المعلم ${data.firstname} ${data.lastname}`);
    } else {
      const newTeacher: Teacher = { ...data, id: Date.now().toString() };
      setTeachers((prev) => [newTeacher, ...prev]);
      showToast('success', `تمت إضافة المعلم ${data.firstname} ${data.lastname} بنجاح`);
    }
    setIsFormOpen(false);
    setSelectedIds([]);
  };

  const handlePlusClick = (teacher: Teacher) => {
    showToast('info', `عرض تفاصيل المعلم: ${teacher.firstname} ${teacher.lastname}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((t) => ({
      'الاسم الأول': t.firstname,
      'اللقب': t.lastname,
      'البريد الإلكتروني': t.email,
      'الرواية': t.ruaya || '-',
      'تاريخ التعيين': t.hire_date ? new Date(t.hire_date).toLocaleDateString('ar-EG') : '-',
      'الحالة': t.is_active ? 'نشط' : 'غير نشط',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المعلمين');
    XLSX.writeFile(workbook, 'قائمة_المعلمين.xlsx');
  };

  return (
    <AppLayout title="المعلمين" breadcrumb="الشؤون الإدارية / المعلمين">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          إدارة المعلمين / الصفحة الرئيسية
        </div>

        {/* Statistics Cards */}
        <TeacherStats teachers={filtered} />

        {/* Search Input and action buttons */}
        <TeacherSearch
          query={query}
          onQueryChange={setQuery}
          selectedCount={selectedIds.length}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={() => setIsConfirmOpen(true)}
          onSelectAll={() => setSelectedIds(filtered.map((t) => t.id))}
          onCancelSelection={() => setSelectedIds([])}
          onPrint={handlePrint}
          onExportExcel={handleExportExcel}
        />

        {/* Data Table */}
        <TeacherTable
          teachers={filtered}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onPlusClick={handlePlusClick}
        />
      </div>

      {/* Teacher Form Modal */}
      <TeacherForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingTeacher={editingTeacher}
      />

      {/* Confirm deletion dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف المعلمين"
        message={`هل أنت متأكد من حذف عدد ${selectedIds.length} معلم من السجلات؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        variant="danger"
      />

      {/* Toast notifications */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </AppLayout>
  );
}
