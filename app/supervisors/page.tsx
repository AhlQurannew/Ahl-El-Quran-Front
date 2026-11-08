'use client';

import { ActivationButtons } from '@/components/ui/ActivationButtons';
import { useAuthStore } from '@/store/authStore';
import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { AppLayout } from '@/components/layout/AppLayout';
import { SupervisorSearch } from '@/components/supervisors/SupervisorSearch';
import { SupervisorTable } from '@/components/supervisors/SupervisorTable';
import { SupervisorForm } from '@/components/supervisors/SupervisorForm';
import { SupervisorStats } from '@/components/supervisors/SupervisorStats';
import { SupervisorDetailsDialog } from '@/components/supervisors/SupervisorDetailsDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import type { Supervisor, SupervisorCreatePayload, SupervisorUpdatePayload } from '@/types/supervisor';
import supervisorAPI from '@/app/API/supervisor';
import { useAdminView } from '@/contexts/AdminViewContext';
import { t as tr, getDir, getLang, getLocale } from '@/i18n';
import { useConfirm } from '@/components/ui/ConfirmProvider';

type ToastState = { visible: boolean; type: 'success' | 'info' | 'error'; message: string };

export default function SupervisorsPage() {
  const confirm = useConfirm();
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  // تفعيل / تعطيل: only for the roles above these accounts in the hierarchy.
  const activatorRole = useAuthStore((state) => state.user?.role);
  const canActivate = !!activatorRole && ['ADMIN', 'INSPECTOR', 'PRESIDENT', 'CHIEF_SUPERVISOR'].includes(activatorRole);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);

  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });
  const { viewingSchoolId } = useAdminView();

  // ── Load supervisors from API ──
  const loadSupervisors = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await supervisorAPI.getSupervisors(0, 100, viewingSchoolId ?? undefined);
      const supervisorsList = Array.isArray(response) ? response : response.supervisors || [];
      setSupervisors(supervisorsList);
    } catch (err: any) {
      console.error('Error loading supervisors:', err);
      setLoadError(err.response?.data?.detail || err.message || tr("فشل تحميل بيانات المشرفين"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupervisors();
  }, [viewingSchoolId]);

  // ── Derived filtered list ──
  const filtered = useMemo(() => {
    return supervisors.filter((s) => {
      const q = query.toLowerCase();
      return (
        s.firstname.toLowerCase().includes(q) ||
        s.lastname.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    });
  }, [supervisors, query]);

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
      setSelectedIds(filtered.map((s) => s.id));
    }
  };

  const handleAdd = () => {
    setEditingSupervisor(null);
    setIsFormOpen(true);
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) return;
    const target = supervisors.find((s) => s.id === selectedIds[0]);
    if (target) {
      setEditingSupervisor(target);
      setIsFormOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      for (const id of selectedIds) {
        await supervisorAPI.deleteSupervisor(id);
      }
      showToast('success', tr("تم حذف {length} مشرف بنجاح", { length: selectedIds.length }));
      setSelectedIds([]);
      setIsConfirmOpen(false);
      await loadSupervisors();
    } catch (err: any) {
      console.error('Error deleting supervisors:', err);
      showToast('error', err.response?.data?.detail || err.message || tr("فشل حذف المشرفين"));
    }
  };

  const handleFormSubmit = async (data: SupervisorCreatePayload | SupervisorUpdatePayload) => {
    const confirmed = await confirm(editingSupervisor
      ? { title: tr('تأكيد الحفظ'), message: tr('هل أنت متأكد من حفظ تعديلات المشرف {name}؟', { name: `${data.firstname ?? ''} ${data.lastname ?? ''}`.trim() }), confirmText: tr('نعم، احفظ') }
      : { title: tr('تأكيد الإضافة'), message: tr('هل أنت متأكد من إضافة المشرف {name}؟', { name: `${data.firstname ?? ''} ${data.lastname ?? ''}`.trim() }), confirmText: tr('نعم، أضف') });
    if (!confirmed) return;
    setIsSubmitting(true);
    try {
      if (editingSupervisor) {
        // Update existing supervisor via API
        await supervisorAPI.updateSupervisor(editingSupervisor.id, data as SupervisorUpdatePayload);
        showToast('success', tr("تم تعديل بيانات المشرف {firstname} {lastname}", { firstname: data.firstname, lastname: data.lastname }));
        
        // Reload supervisors list
        await loadSupervisors();
      } else {
        // Create new supervisor via API
        const createData = data as SupervisorCreatePayload;
        await supervisorAPI.createSupervisor(createData);
        
        showToast('success', tr("تمت إضافة المشرف {firstname} {lastname} بنجاح", { firstname: data.firstname, lastname: data.lastname }));
        
        // Reload supervisors list
        await loadSupervisors();
      }
      setIsFormOpen(false);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Error saving supervisor:', err);
      showToast('error', err.response?.data?.detail || err.message || tr("فشل حفظ بيانات المشرف"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlusClick = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsDetailsOpen(true);
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="${getDir()}" lang="${getLang()}">
      <head>
        <meta charset="UTF-8"/>
        <title>${tr("قائمة المشرفين")}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; direction: ${getDir()}; color: #111; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          p.subtitle { color: #555; font-size: 13px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
          th { background: #047857; color: white; padding: 8px 12px; text-align: ${getDir() === 'rtl' ? 'right' : 'left'}; border: 1px solid #047857; }
          td { padding: 8px 12px; border: 1px solid #e5e7eb; }
          tr:nth-child(even) td { background: #f9fafb; }
          .footer { margin-top: 24px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${tr("قائمة المشرفين")}</h1>
        <p class="subtitle">${tr("تاريخ الطباعة: {v0}", { v0: new Date().toLocaleDateString(getLocale(), { year:'numeric', month:'long', day:'numeric' }) })}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>${tr("الاسم الأول")}</th>
              <th>${tr("الاسم الأخير")}</th>
              <th>${tr("البريد الإلكتروني")}</th>
              <th>${tr("الحالة")}</th>
              <th>${tr("تاريخ الإنشاء")}</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((s, i) => `<tr>
              <td>${i + 1}</td>
              <td>${s.firstname || ''}</td>
              <td>${s.lastname || ''}</td>
              <td>${s.email || ''}</td>
              <td>${s.is_active ? 'نشط' : 'غير نشط'}</td>
              <td>${s.created_at ? new Date(s.created_at).toLocaleDateString(getLocale()) : '-'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        <p class="footer">${tr("المجموع: {length} مشرف", { length: filtered.length })}</p>
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
    const exportData = filtered.map((s) => ({
      [tr("الاسم الأول")]: s.firstname,
      [tr("الاسم الأخير")]: s.lastname,
      [tr("البريد الإلكتروني")]: s.email,
      [tr("تاريخ الإنشاء")]: s.created_at ? new Date(s.created_at).toLocaleDateString(getLocale()) : '-',
      [tr("الحالة")]: s.is_active ? tr("نشط") : tr("غير نشط"),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, tr("المشرفين"));
    XLSX.writeFile(workbook, tr("قائمة_المشرفين.xlsx"));
  };

  return (
    <AppLayout title={tr("المشرفين")} breadcrumb={tr("الشؤون الإدارية / المشرفين")}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          {tr("إدارة المشرفين / الصفحة الرئيسية")}
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
              onClick={loadSupervisors}
              className="ms-4 underline hover:no-underline"
            >
              {tr("إعادة المحاولة")}
            </button>
          </div>
        )}

        {/* Content - Only show when not loading */}
        {!isLoading && !loadError && (
          <>
            {/* Statistics Cards */}
            <SupervisorStats supervisors={filtered} />

            {/* Search Input and action buttons */}
            <SupervisorSearch
              extraActions={canActivate ? (
                <ActivationButtons
                  targets={supervisors.filter((s) => selectedIds.includes(s.id)).map((s) => ({ userId: Number(s.user_id), name: `${s.firstname} ${s.lastname}`.trim(), isActive: s.is_active }))}
                  onDone={() => void loadSupervisors()}
                  onMessage={showToast}
                />
              ) : undefined}
              query={query}
              onQueryChange={setQuery}
              selectedCount={selectedIds.length}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={() => setIsConfirmOpen(true)}
              onSelectAll={() => setSelectedIds(filtered.map((s) => s.id))}
              onCancelSelection={() => setSelectedIds([])}
              onPrint={handlePrint}
              onExportExcel={handleExportExcel}
            />

            {/* Data Table */}
            <SupervisorTable
              supervisors={filtered}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onPlusClick={handlePlusClick}
            />
          </>
        )}
      </div>

      {/* Supervisor Form Modal */}
      <SupervisorForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingSupervisor={editingSupervisor}
        isSubmitting={isSubmitting}
      />

      {/* Supervisor Details Dialog */}
      <SupervisorDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedSupervisor(null);
        }}
        supervisor={selectedSupervisor}
      />

      {/* Confirm deletion dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={tr("تأكيد حذف المشرفين")}
        message={tr("هل أنت متأكد من حذف عدد {length} مشرف من السجلات؟ لا يمكن التراجع عن هذا الإجراء.", { length: selectedIds.length })}
        confirmText={tr("نعم، احذف")}
        cancelText={tr("إلغاء")}
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
