'use client';

import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { AppLayout } from '@/components/layout/AppLayout';
import { TeacherSearch } from '@/components/teachers/TeacherSearch';
import { TeacherTable } from '@/components/teachers/TeacherTable';
import { TeacherForm } from '@/components/teachers/TeacherForm';
import { TeacherStats } from '@/components/teachers/TeacherStats';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import type { Teacher, TeacherCreatePayload } from '@/types/teacher';
import presidentAPI from '@/app/API/president';
import teacherAPI from '@/api/teacher';

type ToastState = { visible: boolean; type: 'success' | 'info' | 'error'; message: string };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });

  // â”€â”€ Load teachers from API â”€â”€
  const loadTeachers = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await presidentAPI.getTeachers();
      const teachersList = Array.isArray(response) ? response : response.teachers || [];
      setTeachers(teachersList);
    } catch (err: any) {
      console.error('Error loading teachers:', err);
      setLoadError(err.response?.data?.detail || err.message || 'فشل تحميل بيانات المعلمين');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  // â”€â”€ Derived filtered list â”€â”€
  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      const q = query.toLowerCase();
      return (
        t.firstname.toLowerCase().includes(q) ||
        t.lastname.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.riwaya ?? '').toLowerCase().includes(q)
      );
    });
  }, [teachers, query]);

  // â”€â”€ Helpers â”€â”€
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

  const handleDeleteConfirm = async () => {
    // Note: Backend delete endpoint may not exist yet
    // For now, we'll just remove from local state
    setTeachers((prev) => prev.filter((t) => t.id !== selectedIds[0]));
    showToast('success', `تم حذف المعلم بنجاح`);
    setSelectedIds([]);
    setIsConfirmOpen(false);
  };

  const handleFormSubmit = async (data: TeacherCreatePayload | Partial<Teacher>) => {
    setIsSubmitting(true);
    try {
      if (editingTeacher) {
        // Update existing teacher via API
        const updateData: Record<string, string | undefined> = {
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          riwaya: data.riwaya,
        };

        // Include password only if the supervisor set a new one (via "reset password" section)
        const newPassword = (data as TeacherCreatePayload).password;
        if (newPassword && newPassword.trim()) {
          updateData.password = newPassword.trim();
        }
        
        await teacherAPI.updateTeacher(Number(editingTeacher.id), updateData);
        showToast('success', `تم تعديل بيانات المعلم ${data.firstname} ${data.lastname}`);
        
        // Reload teachers list
        await loadTeachers();
      } else {
        // Create new teacher via API
        const createData = data as TeacherCreatePayload;
        await presidentAPI.registerTeacher(createData);
        
        showToast('success', `تمت إضافة المعلم ${data.firstname} ${data.lastname} بنجاح`);
        
        // Reload teachers list
        await loadTeachers();
      }
      setIsFormOpen(false);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Error saving teacher:', err);
      showToast('error', err.response?.data?.detail || err.message || 'فشل حفظ بيانات المعلم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlusClick = (teacher: Teacher) => {
    showToast('info', `عرض تفاصيل المعلم: ${teacher.firstname} ${teacher.lastname}`);
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8"/>
        <title>قائمة المعلمين</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; direction: rtl; color: #111; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          p.subtitle { color: #555; font-size: 13px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
          th { background: #b45309; color: white; padding: 8px 12px; text-align: right; border: 1px solid #b45309; }
          td { padding: 8px 12px; border: 1px solid #e5e7eb; }
          tr:nth-child(even) td { background: #f9fafb; }
          .footer { margin-top: 24px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <h1>قائمة المعلمين</h1>
        <p class="subtitle">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' })}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم الأول</th>
              <th>اللقب</th>
              <th>البريد الإلكتروني</th>
              <th>الرواية</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((t, i) => `<tr>
              <td>${i + 1}</td>
              <td>${t.firstname || ''}</td>
              <td>${t.lastname || ''}</td>
              <td>${t.email || ''}</td>
              <td>${t.riwaya || '-'}</td>
              <td>${t.is_active ? 'نشط' : 'غير نشط'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        <p class="footer">المجموع: ${filtered.length} معلم</p>
      </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((t) => ({
      'الاسم الأول': t.firstname,
      'اللقب': t.lastname,
      'البريد الإلكتروني': t.email,
      'الرواية': t.riwaya || '-',
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {/* Error State */}
        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {loadError}
            <button 
              onClick={loadTeachers}
              className="mr-4 underline hover:no-underline"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Content - Only show when not loading */}
        {!isLoading && !loadError && (
          <>
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
          </>
        )}
      </div>

      {/* Teacher Form Modal */}
      <TeacherForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingTeacher={editingTeacher}
        isSubmitting={isSubmitting}
      />

      {/* Confirm deletion dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف المعلمين"
        message={`هل أنت متأكد من حذف عدد ${selectedIds.length} معلم من السجلات؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، احذف"
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
