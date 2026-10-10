'use client';

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

type ToastState = { visible: boolean; type: 'success' | 'info' | 'error'; message: string };

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
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

  // ── Load supervisors from API ──
  const loadSupervisors = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await supervisorAPI.getSupervisors();
      const supervisorsList = Array.isArray(response) ? response : response.supervisors || [];
      setSupervisors(supervisorsList);
    } catch (err: any) {
      console.error('Error loading supervisors:', err);
      setLoadError(err.response?.data?.detail || err.message || 'فشل تحميل بيانات المشرفين');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupervisors();
  }, []);

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
      showToast('success', `تم حذف ${selectedIds.length} مشرف بنجاح`);
      setSelectedIds([]);
      setIsConfirmOpen(false);
      await loadSupervisors();
    } catch (err: any) {
      console.error('Error deleting supervisors:', err);
      showToast('error', err.response?.data?.detail || err.message || 'فشل حذف المشرفين');
    }
  };

  const handleFormSubmit = async (data: SupervisorCreatePayload | SupervisorUpdatePayload) => {
    setIsSubmitting(true);
    try {
      if (editingSupervisor) {
        // Update existing supervisor via API
        await supervisorAPI.updateSupervisor(editingSupervisor.id, data as SupervisorUpdatePayload);
        showToast('success', `تم تعديل بيانات المشرف ${data.firstname} ${data.lastname}`);
        
        // Reload supervisors list
        await loadSupervisors();
      } else {
        // Create new supervisor via API
        const createData = data as SupervisorCreatePayload;
        await supervisorAPI.createSupervisor(createData);
        
        showToast('success', `تمت إضافة المشرف ${data.firstname} ${data.lastname} بنجاح`);
        
        // Reload supervisors list
        await loadSupervisors();
      }
      setIsFormOpen(false);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Error saving supervisor:', err);
      showToast('error', err.response?.data?.detail || err.message || 'فشل حفظ بيانات المشرف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlusClick = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsDetailsOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((s) => ({
      'الاسم الأول': s.firstname,
      'الاسم الأخير': s.lastname,
      'البريد الإلكتروني': s.email,
      'تاريخ الإنشاء': s.created_at ? new Date(s.created_at).toLocaleDateString('ar-EG') : '-',
      'الحالة': s.is_active ? 'نشط' : 'غير نشط',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المشرفين');
    XLSX.writeFile(workbook, 'قائمة_المشرفين.xlsx');
  };

  return (
    <AppLayout title="المشرفين" breadcrumb="الشؤون الإدارية / المشرفين">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          إدارة المشرفين / الصفحة الرئيسية
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
            <SupervisorStats supervisors={filtered} />

            {/* Search Input and action buttons */}
            <SupervisorSearch
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
        title="تأكيد حذف المشرفين"
        message={`هل أنت متأكد من حذف عدد ${selectedIds.length} مشرف من السجلات؟ لا يمكن التراجع عن هذا الإجراء.`}
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
