'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StudentSearch } from '@/components/students/StudentSearch';
import { StudentTable } from '@/components/students/StudentTable';
import { StudentForm } from '@/components/students/StudentForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import type { Student } from '@/types/student';

// ─── Seed data from screenshot ─────────────────────────────────────────────
const SEED_STUDENTS: Student[] = [
  { id: '1', firstName: 'أحمد يعقوب', lastName: 'يعقوب', gender: 'male', halqa: '', username: 'yakoube@gmail.com', dob: '2011-12-13', pob: 'bourouba', nationality: 'Algerian', idType: '' },
  { id: '2', firstName: 'عبدو معتصم', lastName: 'معتصم', gender: 'male', halqa: 'حلقة أحمد', username: 'abdulabbid@gmail.com', dob: '2025-12-03', pob: 'boubsila', nationality: 'Algerian', idType: '' },
  { id: '3', firstName: 'جليل مطاطي', lastName: 'مطاطي', gender: 'male', halqa: 'حلقة أحمد', username: 'djalilstyfi@gmail.com', dob: '2004-02-15', pob: 'borj el kiffan', nationality: 'Algerian', idType: '' },
  { id: '4', firstName: 'أحمد معتصم', lastName: 'معتصم', gender: 'male', halqa: 'حلقة أحمد', username: 'ahmedmoutasim@gmail.com', dob: '2012-12-14', pob: 'alharachh', nationality: 'Algerian', idType: '' },
  { id: '5', firstName: 'رؤوف المعتصم', lastName: 'المعتصم', gender: 'male', halqa: 'حلقة أحمد', username: 'abdouferbadidud@gmail.com', dob: '1992-12-17', pob: 'fordlo', nationality: 'Algerian', idType: '' },
];

type ToastState = { visible: boolean; type: 'success' | 'info'; message: string };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(SEED_STUDENTS);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });

  // ── Derived filtered list ──
  const filtered = useMemo(() => {
    return students.filter((s) => {
      const q = query.toLowerCase();
      return (
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        (s.halqa ?? '').toLowerCase().includes(q) ||
        s.pob.toLowerCase().includes(q)
      );
    });
  }, [students, query]);

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
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) return;
    const target = students.find((s) => s.id === selectedIds[0]);
    if (target) {
      setEditingStudent(target);
      setIsFormOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    setStudents((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
    showToast('success', `تم حذف عدد ${selectedIds.length} طالب بنجاح`);
    setSelectedIds([]);
  };

  const handleFormSubmit = (data: Omit<Student, 'id'>) => {
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...data, id: editingStudent.id } : s))
      );
      showToast('success', `تم تعديل بيانات الطالب ${data.firstName} ${data.lastName}`);
    } else {
      const newStudent: Student = { ...data, id: Date.now().toString() };
      setStudents((prev) => [newStudent, ...prev]);
      showToast('success', `تمت إضافة الطالب ${data.firstName} ${data.lastName} بنجاح`);
    }
    setIsFormOpen(false);
    setSelectedIds([]);
  };

  const handlePlusClick = (student: Student) => {
    showToast('info', `سجل إنجازات الطالب: ${student.firstName} ${student.lastName}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout title="الطلاب" breadcrumb="الشؤون الإدارية / الطلاب">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Banner Title */}
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          إدارة الطلاب / الصفحة الرئيسية
        </div>

        {/* Search Input and action buttons */}
        <StudentSearch
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
        <StudentTable
          students={filtered}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onPlusClick={handlePlusClick}
        />
      </div>

      {/* Student Form Modal */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingStudent={editingStudent}
      />

      {/* Confirm deletion dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف الطلاب"
        message={`هل أنت متأكد من حذف عدد ${selectedIds.length} طالب من السجلات؟ لا يمكن التراجع عن هذا الإجراء.`}
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
