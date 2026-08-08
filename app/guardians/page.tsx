'use client';

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuardianSearch } from '@/components/guardians/GuardianSearch';
import { GuardianTable } from '@/components/guardians/GuardianTable';
import { GuardianForm } from '@/components/guardians/GuardianForm';
import { GuardianStats } from '@/components/guardians/GuardianStats';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import type { Guardian } from '@/types/guardian';

// ─── Seed data ─────────────────────────────────────────────
const SEED_GUARDIANS: Guardian[] = [
  {
    id: '1',
    guardianId: 1001,
    firstName: 'عبد الرحمن',
    lastName: 'محمد',
    relationship: 'father',
    guardianContactId: 5001,
    guardianAccountId: 7001,
    homeAddress: 'الجزائر العاصمة، حي النصر',
    job: 'مهندس',
    profileImage: null,
    email: 'abdelrahman.mohamed@example.com',
  },
  {
    id: '2',
    guardianId: 1002,
    firstName: 'سارة',
    lastName: 'علي',
    relationship: 'mother',
    guardianContactId: 5002,
    guardianAccountId: 7002,
    homeAddress: 'وهران، حي المنزه',
    job: 'معلمة',
    profileImage: null,
    email: 'sara.ali@example.com',
  },
  {
    id: '3',
    guardianId: 1003,
    firstName: 'خالد',
    lastName: 'أحمد',
    relationship: 'father',
    guardianContactId: 5003,
    guardianAccountId: 7003,
    homeAddress: 'قسنطينة، شارع الأمير عبد القادر',
    job: 'طبيب',
    profileImage: null,
    email: 'khaled.ahmed@example.com',
  },
  {
    id: '4',
    guardianId: 1004,
    firstName: 'فاطمة',
    lastName: 'حسن',
    relationship: 'mother',
    guardianContactId: 5004,
    guardianAccountId: 7004,
    homeAddress: 'عنابة، حي السلام',
    job: null,
    profileImage: null,
    email: null,
  },
  {
    id: '5',
    guardianId: 1005,
    firstName: 'يوسف',
    lastName: 'عبد الله',
    relationship: 'uncle',
    guardianContactId: 5005,
    guardianAccountId: 7005,
    homeAddress: 'سطيف، حي البساتين',
    job: 'تاجر',
    profileImage: null,
    email: 'youssef.abdullah@example.com',
  },
  {
    id: '6',
    guardianId: 1006,
    firstName: 'مريم',
    lastName: 'إبراهيم',
    relationship: 'aunt',
    guardianContactId: 5006,
    guardianAccountId: 7006,
    homeAddress: 'بجاية، حي الحرية',
    job: 'ممرضة',
    profileImage: null,
    email: 'mariam.ibrahim@example.com',
  },
];

type ToastState = { visible: boolean; type: 'success' | 'info'; message: string };

export default function GuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>(SEED_GUARDIANS);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });

  // ── Derived filtered list ──
  const filtered = useMemo(() => {
    return guardians.filter((g) => {
      const q = query.toLowerCase();
      return (
        (g.firstName ?? '').toLowerCase().includes(q) ||
        (g.lastName ?? '').toLowerCase().includes(q) ||
        (g.email ?? '').toLowerCase().includes(q) ||
        (g.relationship ?? '').toLowerCase().includes(q) ||
        (g.homeAddress ?? '').toLowerCase().includes(q) ||
        (g.job ?? '').toLowerCase().includes(q)
      );
    });
  }, [guardians, query]);

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
      setSelectedIds(filtered.map((g) => g.id));
    }
  };

  const handleAdd = () => {
    setEditingGuardian(null);
    setIsFormOpen(true);
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) return;
    const target = guardians.find((g) => g.id === selectedIds[0]);
    if (target) {
      setEditingGuardian(target);
      setIsFormOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    setGuardians((prev) => prev.filter((g) => !selectedIds.includes(g.id)));
    showToast('success', `تم حذف عدد ${selectedIds.length} ولي أمر بنجاح`);
    setSelectedIds([]);
  };

  const handleFormSubmit = (data: Omit<Guardian, 'id'>) => {
    if (editingGuardian) {
      setGuardians((prev) =>
        prev.map((g) => (g.id === editingGuardian.id ? { ...data, id: editingGuardian.id } : g))
      );
      showToast('success', `تم تعديل بيانات ولي الأمر ${data.firstName} ${data.lastName}`);
    } else {
      const newGuardian: Guardian = { ...data, id: Date.now().toString() };
      setGuardians((prev) => [newGuardian, ...prev]);
      showToast('success', `تمت إضافة ولي الأمر ${data.firstName} ${data.lastName} بنجاح`);
    }
    setIsFormOpen(false);
    setSelectedIds([]);
  };

  const handlePlusClick = (guardian: Guardian) => {
    showToast('info', `عرض تفاصيل ولي الأمر: ${guardian.firstName} ${guardian.lastName}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const relMap: Record<string, string> = {
      father: 'أب',
      mother: 'أم',
      uncle: 'عم / خال',
      aunt: 'عمة / خالة',
      other: 'غير ذلك',
    };
    const exportData = filtered.map((g) => ({
      'الاسم الأول': g.firstName,
      'اللقب': g.lastName,
      'صلة القرابة': relMap[g.relationship || ''] || g.relationship || '-',
      'المهنة': g.job || '-',
      'البريد الإلكتروني': g.email || '-',
      'العنوان': g.homeAddress || '-',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'أولياء الأمور');
    XLSX.writeFile(workbook, 'قائمة_أولياء_الأمور.xlsx');
  };

  return (
    <AppLayout title="أولياء الأمور" breadcrumb="الشؤون الإدارية / أولياء الأمور">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          إدارة أولياء الأمور / الصفحة الرئيسية
        </div>

        {/* Statistics Cards */}
        <GuardianStats guardians={filtered} />

        {/* Search Input and action buttons */}
        <GuardianSearch
          query={query}
          onQueryChange={setQuery}
          selectedCount={selectedIds.length}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={() => setIsConfirmOpen(true)}
          onSelectAll={() => setSelectedIds(filtered.map((g) => g.id))}
          onCancelSelection={() => setSelectedIds([])}
          onPrint={handlePrint}
          onExportExcel={handleExportExcel}
        />

        {/* Data Table */}
        <GuardianTable
          guardians={filtered}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onPlusClick={handlePlusClick}
        />
      </div>

      {/* Guardian Form Modal */}
      <GuardianForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingGuardian={editingGuardian}
      />

      {/* Confirm deletion dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف أولياء الأمور"
        message={`هل أنت متأكد من حذف عدد ${selectedIds.length} ولي أمر من السجلات؟ لا يمكن التراجع عن هذا الإجراء.`}
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
