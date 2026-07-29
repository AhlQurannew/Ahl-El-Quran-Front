'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';import { AppLayout } from '@/components/layout/AppLayout';
import { StudentSearch } from '@/components/students/StudentSearch';
import { StudentTable } from '@/components/students/StudentTable';
import { StudentForm } from '@/components/students/StudentForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import type { Student } from '@/types/student';
import studentsAPI from '@/app/API/students';
import axios from 'axios';


type ToastState = { visible: boolean; type: 'success' | 'info' | 'error'; message: string };

const mapApiToStudent = (apiStudent: any): Student => ({
  id: String(apiStudent.id ?? apiStudent.user_id ?? Date.now()),
  firstName: apiStudent.personalInfo?.firstNameAr ?? apiStudent.firstname ?? '',
  lastName: apiStudent.personalInfo?.lastNameAr ?? apiStudent.lastname ?? '',
  gender: apiStudent.personalInfo?.sex === 'female' ? 'female' : 'male',
  halqa: apiStudent.lectures?.[0]?.lectureNameAr ?? '',
  username: apiStudent.contactInfo?.email ?? apiStudent.email ?? '',
  dob: apiStudent.personalInfo?.dateOfBirth ?? '',
  pob: apiStudent.personalInfo?.placeOfBirth ?? '',
  nationality: apiStudent.personalInfo?.nationality ?? 'Algerian',
  idType: '',
});

const mapStudentToApi = (student: Omit<Student, 'id'>) => ({
  personalInfo: {
    firstNameAr: student.firstName,
    lastNameAr: student.lastName,
    firstNameEn: '',
    lastNameEn: '',
    sex: student.gender,
    dateOfBirth: student.dob,
    placeOfBirth: student.pob,
    homeAddress: '',
    nationality: student.nationality,
    fatherStatus: '',
    motherStatus: '',
  },
  accountInfo: {
    username: student.username,
    passcode: '123456',
    accountType: 'STUDENT',
  },
  contactInfo: {
    phoneNumber: '',
    email: student.username,
  },
  guardian: {
    firstName: '',
    lastName: '',
    // only include a guardian email when student.username is present and non-empty
    email: student.username || undefined,
    relationship: '',
    homeAddress: '',
    job: '',
  },
  lectures: [],
  formalEducationInfo: {
    academicLevel: '',
    grade: '',
    schoolName: student.halqa ?? '',
  },
});

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
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

  const fetchStudents = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const data = await studentsAPI.getStudents();
      const mapped = Array.isArray(data)
        ? data.map(mapApiToStudent)
        : data.students?.map(mapApiToStudent) ?? [];
      setStudents(mapped);
    } catch (err) {
      showToast('error', 'فشل تحميل بيانات الطلاب');
      console.error(err);
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

  const handleDeleteConfirm = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => studentsAPI.deleteStudent(Number(id)))
      );
      showToast('success', `تم حذف عدد ${selectedIds.length} طالب بنجاح`);
      setSelectedIds([]);
      fetchStudents();
    } catch (err) {
      showToast('error', 'فشل حذف الطالب');
      console.error(err);
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleFormSubmit = async (data: Omit<Student, 'id'>) => {
    setIsFormLoading(true);
    try {
      const payload = mapStudentToApi(data);
      if (editingStudent) {
        await studentsAPI.updateStudentFull(Number(editingStudent.id), payload);
        showToast('success', `تم تعديل بيانات الطالب ${data.firstName} ${data.lastName}`);
      } else {
        await studentsAPI.createStudent(payload);
        showToast('success', `تمت إضافة الطالب ${data.firstName} ${data.lastName} بنجاح`);
      }
      setIsFormOpen(false);
      setSelectedIds([]);
      fetchStudents();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || '';
      
      let errorMessage = 'فشلت العملية، يرجى المحاولة مجدداً';
      
      if (detail.toLowerCase().includes('email') && detail.toLowerCase().includes('exist')) {
        errorMessage = 'البريد الإلكتروني مستخدم بالفعل، يرجى استخدام بريد آخر';
      } else if (detail.toLowerCase().includes('already')) {
        errorMessage = 'هذه البيانات موجودة مسبقاً';
      } else if (detail) {
        errorMessage = detail;
      }
      
      showToast('error', errorMessage);
      console.error(err);
    } finally {
      setIsFormLoading(false);
    }
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

        {isPageLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent" />
            <span className="mr-3 text-gray-500 text-sm">جاري تحميل البيانات...</span>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Student Form Modal */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingStudent={editingStudent}
        isLoading={isFormLoading}
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
