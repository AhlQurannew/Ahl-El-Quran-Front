'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SupervisorSearch } from '@/components/supervisors/SupervisorSearch';
import { SupervisorTable } from '@/components/supervisors/SupervisorTable';
import { SupervisorForm } from '@/components/supervisors/SupervisorForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import type { Supervisor } from '@/types/supervisor';

const SEED_SUPERVISORS: Supervisor[] = [
  { id: '1', firstname: 'أحمد', lastname: 'يعقوب', email: 'yakoube@gmail.com', isActive: true, createdAt: '2024-01-15 08:30:00' },
  { id: '2', firstname: 'عبدو', lastname: 'معتصم', email: 'abdulabbid@gmail.com', isActive: true, createdAt: '2024-02-10 10:15:00' },
  { id: '3', firstname: 'جليل', lastname: 'مطاطي', email: 'djalilstyfi@gmail.com', isActive: false, createdAt: '2024-03-05 14:20:00' },
];

type ToastState = { visible: boolean; type: 'success' | 'info'; message: string };

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>(SEED_SUPERVISORS);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });

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

  const handleDeleteConfirm = () => {
    setSupervisors((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
    showToast('success', `تم حذف عدد ${selectedIds.length} مشرف بنجاح`);
    setSelectedIds([]);
  };

  const handleFormSubmit = (data: Omit<Supervisor, 'id' | 'createdAt'>) => {
    if (editingSupervisor) {
      setSupervisors((prev) =>
        prev.map((s) => (s.id === editingSupervisor.id ? { ...s, ...data } : s))
      );
      showToast('success', `تم تعديل بيانات المشرف ${data.firstname} ${data.lastname}`);
    } else {
      const newSupervisor: Supervisor = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      setSupervisors((prev) => [newSupervisor, ...prev]);
      showToast('success', `تمت إضافة المشرف ${data.firstname} ${data.lastname} بنجاح`);
    }
    setIsFormOpen(false);
    setSelectedIds([]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout title="المشرفين" breadcrumb="الشؤون الإدارية / المشرفين">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          إدارة المشرفين / الصفحة الرئيسية
        </div>

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
        />

        {/* Data Table */}
        <SupervisorTable
          supervisors={filtered}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
      </div>

      {/* Supervisor Form Modal */}
      <SupervisorForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingSupervisor={editingSupervisor}
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
