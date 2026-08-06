'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StudentSearch } from '@/components/students/StudentSearch';
import { StudentTable } from '@/components/students/StudentTable';
import { StudentForm } from '@/components/students/StudentForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import type { Student } from '@/types/student';
import studentsAPI, { CreateStudentPayload } from '@/app/API/students';

type ToastState = { visible: boolean; type: 'success' | 'info' | 'error'; message: string };

function apiDateToInputDate(d?: string): string {
  if (!d) return '';
  const [dd, mm, yyyy] = d.split('/');
  if (!dd || !mm || !yyyy) return '';
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

function inputDateToApiDate(d?: string): string {
  if (!d) return '';
  const [yyyy, mm, dd] = d.split('-');
  if (!dd || !mm || !yyyy) return '';
  return `${dd}/${mm}/${yyyy}`;
}

function apiStudentToStudent(api: any): Student {
  return {
    id: String(api.id ?? api.user_id ?? Date.now()),
    firstName: (api.personalInfo?.firstNameAr || api.firstname || '').trim(),
    lastName: (api.personalInfo?.lastNameAr || api.lastname || '').trim(),
    gender: api.personalInfo?.sex === 'female' ? 'female' : 'male',
    halqa: api.lectures?.[0]?.lectureNameAr || '',
    username: api.accountInfo?.username || api.email || '',
    dob: apiDateToInputDate(api.personalInfo?.dateOfBirth),
    pob: api.personalInfo?.placeOfBirth || '',
    nationality: api.personalInfo?.nationality || 'Algerian',
    idType: '',
  };
}

function studentToFullPayload(data: Omit<Student, 'id'>): CreateStudentPayload {
  return {
    personalInfo: {
      firstNameAr: data.firstName,
      lastNameAr: data.lastName,
      firstNameEn: '',
      lastNameEn: '',
      sex: data.gender === 'male' ? 'Masculin' : 'Féminin',
      dateOfBirth: inputDateToApiDate(data.dob),
      placeOfBirth: data.pob,
      homeAddress: '',
      nationality: data.nationality,
      fatherStatus: '',
      motherStatus: '',
    },
    accountInfo: {
      username: data.username,
      passcode: '123456',
      accountType: 'Student',
    },
    contactInfo: {
      phoneNumber: '',
      email: data.username,
    },
    guardian: {
      firstName: '',
      lastName: '',
      email: data.username || undefined,
      relationship: '',
      homeAddress: '',
      job: '',
    },
    lectures: [],
    formalEducationInfo: {
      academicLevel: '',
      grade: '',
      schoolName: data.halqa ?? '',
    },
  };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });
  const showToast = (type: ToastState['type'], message: string) =>
    setToast({ visible: true, type, message });

  const errMsg = (err: unknown, fallback: string) =>
    (err as any)?.response?.data?.detail
      ? typeof (err as any).response.data.detail === 'string'
        ? (err as any).response.data.detail
        : JSON.stringify((err as any).response.data.detail)
      : err instanceof Error
        ? err.message
        : fallback;

  const loadStudents = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await studentsAPI.getStudents();
      const list = Array.isArray(res) ? res : res.students ?? [];
      setStudents(list.map(apiStudentToStudent));
    } catch (err) {
      setLoadError(errMsg(err, 'فشل تحميل بيانات الطلاب'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return students.filter((s) =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      (s.halqa ?? '').toLowerCase().includes(q) ||
      s.pob.toLowerCase().includes(q)
    );
  }, [students, query]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleToggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((s) => s.id));
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

  const handleFormSubmit = async (data: Omit<Student, 'id'>) => {
    setIsSubmitting(true);
    try {
      const payload = studentToFullPayload(data);
      if (editingStudent) {
        const updated = await studentsAPI.updateStudentFull(Number(editingStudent.id), payload);
        setStudents((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? apiStudentToStudent(updated) : s))
        );
        showToast('success', `تم تعديل بيانات الطالب ${data.firstName} ${data.lastName}`);
      } else {
        const created = await studentsAPI.createStudent(payload);
        setStudents((prev) => [apiStudentToStudent(created), ...prev]);
        showToast('success', `تمت إضافة الطالب ${data.firstName} ${data.lastName} بنجاح`);
      }
      setIsFormOpen(false);
      setSelectedIds([]);
    } catch (err) {
      showToast('error', errMsg(err, 'حدث خطأ أثناء الحفظ'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await Promise.all(selectedIds.map((id) => studentsAPI.deleteStudent(Number(id))));
      setStudents((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      showToast('success', `تم حذف عدد ${selectedIds.length} طالب بنجاح`);
    } catch (err) {
      showToast('error', errMsg(err, 'فشل حذف بعض الطلاب'));
      loadStudents();
    } finally {
      setSelectedIds([]);
      setIsConfirmOpen(false);
    }
  };

  const handlePlusClick = (student: Student) => {
    showToast('info', `سجل إنجازات الطالب: ${student.firstName} ${student.lastName}`);
  };

  const handlePrint = () => window.print();

  return (
    <AppLayout title="الطلاب" breadcrumb="الشؤون الإدارية / الطلاب">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-amber-500/85 text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm">
          إدارة الطلاب / الصفحة الرئيسية
        </div>

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

        {isLoading ? (
          <div className="text-center py-10 text-gray-500">جاري تحميل بيانات الطلاب...</div>
        ) : loadError ? (
          <div className="text-center py-10 text-red-500">
            {loadError}
            <button onClick={loadStudents} className="block mx-auto mt-2 underline text-amber-600 cursor-pointer">
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <StudentTable
            students={filtered}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onPlusClick={handlePlusClick}
          />
        )}
      </div>

      <StudentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingStudent={editingStudent}
        isSubmitting={isSubmitting}
      />

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

      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </AppLayout>
  );
}
