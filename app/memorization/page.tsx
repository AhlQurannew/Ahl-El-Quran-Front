'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MemorizationStats } from '@/components/memorization/MemorizationStats';
import { MemorizationSearch } from '@/components/memorization/MemorizationSearch';
import { MemorizationTable } from '@/components/memorization/MemorizationTable';
import { MemorizationForm } from '@/components/memorization/MemorizationForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import type { MemorizationRecord } from '@/types/memorization';

// ─── Seed data with Surah and Ayah fields ──────────────────────────────────
const SEED_RECORDS: MemorizationRecord[] = [
  { id: '1', name: 'أحمد معتصم', halqa: 'حلقة أحمد', joinDate: '2024-09-01', status: 'active', surah: 'البقرة', ayah: '185' },
  { id: '2', name: 'رؤوف المعتصم', halqa: 'حلقة أحمد', joinDate: '2024-09-01', status: 'active', surah: 'الكهف', ayah: '110 (كاملة)' },
  { id: '3', name: 'عبدو معتصم', halqa: 'حلقة أحمد', joinDate: '2024-10-15', status: 'active', surah: 'النبأ', ayah: '40 (كاملة)' },
  { id: '4', name: 'جليل مطاطي', halqa: 'حلقة أحمد', joinDate: '2024-11-01', status: 'inactive', surah: 'الملك', ayah: '30 (كاملة)' },
  { id: '5', name: 'عمر الرشيد', halqa: 'حلقة محمد', joinDate: '2025-01-10', status: 'active', surah: 'يس', ayah: '58' },
  { id: '6', name: 'سارة الزهراني', halqa: 'حلقة نور', joinDate: '2025-02-01', status: 'active', surah: 'الرحمن', ayah: '78 (كاملة)' },
];

type ToastState = { visible: boolean; type: 'success' | 'error' | 'info'; message: string };
type StatusFilter = 'all' | 'active' | 'inactive';

export default function MemorizationPage() {
  const [records, setRecords] = useState<MemorizationRecord[]>(SEED_RECORDS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [halqaFilter, setHalqaFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MemorizationRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MemorizationRecord | null>(null);

  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });

  // ── Derived data ──
  const halqaOptions = useMemo(
    () => [...new Set(records.map((r) => r.halqa).filter(Boolean) as string[])].sort(),
    [records]
  );

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const q = query.toLowerCase();
      const matchesQuery =
        r.name.toLowerCase().includes(q) ||
        r.surah.toLowerCase().includes(q) ||
        r.ayah.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesHalqa = !halqaFilter || r.halqa === halqaFilter;
      return matchesQuery && matchesStatus && matchesHalqa;
    });
  }, [records, query, statusFilter, halqaFilter]);

  const stats = useMemo(() => ({
    total: records.length,
    active: records.filter((r) => r.status === 'active').length,
    inactive: records.filter((r) => r.status === 'inactive').length,
  }), [records]);

  // ── Helpers ──
  const showToast = (type: ToastState['type'], message: string) =>
    setToast({ visible: true, type, message });

  const openAddForm = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const openEditForm = (record: MemorizationRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<MemorizationRecord, 'id'>) => {
    if (editingRecord) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editingRecord.id ? { ...data, id: editingRecord.id } : r))
      );
      showToast('success', `تم تعديل بيانات إنجاز ${data.name} بنجاح`);
    } else {
      const newRecord: MemorizationRecord = { ...data, id: Date.now().toString() };
      setRecords((prev) => [newRecord, ...prev]);
      showToast('success', `تمت إضافة سجل إنجاز ${data.name} بنجاح`);
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (!deletingRecord) return;
    setRecords((prev) => prev.filter((r) => r.id !== deletingRecord.id));
    showToast('success', `تم حذف سجل ${deletingRecord.name} بنجاح`);
    setDeletingRecord(null);
  };

  return (
    <AppLayout title="الحفظ والمراجعة" breadcrumb="الشؤون الإدارية / الحفظ والمراجعة">
      <div className="space-y-6">
        {/* Stats */}
        <MemorizationStats
          total={stats.total}
          active={stats.active}
          inactive={stats.inactive}
        />

        {/* Search & Filters */}
        <MemorizationSearch
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          halqaFilter={halqaFilter}
          onHalqaFilterChange={setHalqaFilter}
          halqaOptions={halqaOptions}
          onAddRecord={openAddForm}
        />

        {/* Table */}
        <MemorizationTable
          records={filtered}
          onEdit={openEditForm}
          onDelete={setDeletingRecord}
        />
      </div>

      {/* Form Modal */}
      <MemorizationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingRecord={editingRecord}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف سجل الإنجاز"
        message={`هل أنت متأكد من حذف سجل إنجاز "${deletingRecord?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
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
    </AppLayout>
  );
}
