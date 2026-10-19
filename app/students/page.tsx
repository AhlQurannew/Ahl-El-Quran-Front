'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StudentSearch } from '@/components/students/StudentSearch';
import { StudentTable } from '@/components/students/StudentTable';
import { StudentForm } from '@/components/students/StudentForm';
import { StudentDetailsDialog } from '@/components/students/StudentDetailsDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import type { Student } from '@/types/student';
import studentsAPI, { CreateStudentPayload } from '@/app/API/students';
import teacherAPI from '@/app/API/teacher';
import { useAuthStore } from '@/store/authStore';
import { getTodayApiDate } from '@/utils/dateHelpers';

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
    halqaId: api.lectures?.[0]?.lectureId || undefined,
    username: api.accountInfo?.username || api.email || '',
    dob: apiDateToInputDate(api.personalInfo?.dateOfBirth),
    pob: api.personalInfo?.placeOfBirth || '',
    nationality: api.personalInfo?.nationality || 'Algerian',
    idType: '',
  };
}

function studentToFullPayload(data: Omit<Student, 'id'>): CreateStudentPayload {
  const lectures = data.halqaId ? [{
    lectureId: data.halqaId,
    lectureNameAr: data.halqa || '',
    lectureNameEn: ''
  }] : [];

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
    lectures: lectures,
    formalEducationInfo: {
      academicLevel: '',
      grade: '',
      schoolName: data.halqa ?? '',
    },
  };
}

export default function StudentsPage() {
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === 'TEACHER';
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Student details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);

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
      let list: any[];
      if (isTeacher) {
        const res = await teacherAPI.getMyStudents();
        list = Array.isArray(res) ? res : res.students ?? [];
      } else {
        const res = await studentsAPI.getStudents();
        list = Array.isArray(res) ? res : res.students ?? [];
      }
      setStudents(list.map(apiStudentToStudent));
    } catch (err) {
      setLoadError(errMsg(err, 'فشل تحميل بيانات الطلاب'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [isTeacher]);

  // Update selected student details when students data changes
  useEffect(() => {
    if (selectedStudentForDetails) {
      const updatedStudent = students.find(s => s.id === selectedStudentForDetails.id);
      if (updatedStudent) {
        setSelectedStudentForDetails(updatedStudent);
      }
    }
  }, [students]);

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
        await studentsAPI.updateStudentFull(Number(editingStudent.id), payload);
        showToast('success', `تم تعديل بيانات الطالب ${data.firstName} ${data.lastName}`);
      } else {
        await studentsAPI.createStudent(payload);
        showToast('success', `تمت إضافة الطالب ${data.firstName} ${data.lastName} بنجاح`);
      }
      setIsFormOpen(false);
      setSelectedIds([]);
      // Reload students to get fresh data from server
      await loadStudents();
    } catch (err) {
      showToast('error', errMsg(err, 'حدث خطأ أثناء الحفظ'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await Promise.all(selectedIds.map((id) => studentsAPI.deleteStudent(Number(id))));
      showToast('success', `تم حذف عدد ${selectedIds.length} طالب بنجاح`);
      setSelectedIds([]);
      setIsConfirmOpen(false);
      // Reload students to get fresh data from server
      await loadStudents();
    } catch (err) {
      showToast('error', errMsg(err, 'فشل حذف بعض الطلاب'));
      setSelectedIds([]);
      setIsConfirmOpen(false);
      // Still reload to ensure data consistency
      await loadStudents();
    }
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');

      const listToExport = selectedIds.length > 0
        ? filtered.filter((s) => selectedIds.includes(s.id))
        : filtered;

      if (listToExport.length === 0) {
        showToast('info', 'لا توجد بيانات للتصدير');
        return;
      }

      const excelData = listToExport.map((s) => ({
        'الاسم الأول': s.firstName,
        'اسم العائلة': s.lastName,
        'الجنس': s.gender === 'male' ? 'ذكر' : 'أنثى',
        'الحلقة': s.halqa || '—',
        'البريد / اسم المستخدم': s.username || '—',
        'تاريخ الميلاد': s.dob || '—',
        'مكان الميلاد': s.pob || '—',
        'الجنسية': s.nationality || '—',
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلاب');

      worksheet['!cols'] = [
        { wch: 18 },
        { wch: 18 },
        { wch: 10 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
      ];

      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `قائمة_الطلاب_${dateStr}.xlsx`);
      showToast('success', 'تم تصدير ملف Excel بنجاح');
    } catch (error) {
      console.error('Erreur export Excel:', error);
      showToast('error', 'حدث خطأ أثناء تصدير ملف Excel');
    }
  };

  const handlePlusClick = (student: Student) => {
    setSelectedStudentForDetails(student);
    setIsDetailsDialogOpen(true);
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8"/>
        <title>قائمة الطلاب</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; direction: rtl; color: #111; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          p.subtitle { color: #555; font-size: 13px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #0f766e; color: white; padding: 8px 12px; text-align: right; }
          td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) td { background: #f9fafb; }
          .footer { margin-top: 20px; font-size: 11px; color: #888; text-align: center; }
        </style>
      </head>
      <body>
        <h1>قائمة الطلاب</h1>
        <p class="subtitle">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG-u-nu-latn', { year:'numeric', month:'long', day:'numeric' })}</p>
        <table>
          <thead><tr><th>#</th><th>الاسم</th><th>الكنية</th><th>الجنس</th><th>الحلقة</th><th>تاريخ الميلاد</th><th>الجنسية</th></tr></thead>
          <tbody>
            ${filtered.map((s, i) => `<tr>
              <td>${i + 1}</td>
              <td>${s.firstName}</td>
              <td>${s.lastName}</td>
              <td>${s.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
              <td>${s.halqa || '-'}</td>
              <td>${s.dob || '-'}</td>
              <td>${s.nationality || '-'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        <p class="footer">المجموع: ${filtered.length} طالب</p>
      </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) { win.document.write(printContent); win.document.close(); win.print(); }
  };

  return (
    <AppLayout title="الطلاب" breadcrumb="الشؤون الإدارية / الطلاب">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className={`${isTeacher ? 'bg-sky-700' : 'bg-amber-500/85'} text-white py-3.5 px-6 rounded-xl shadow-sm font-semibold text-sm`}>
          {isTeacher ? 'طلابي / قائمة طلاب الحلقات' : 'إدارة الطلاب / الصفحة الرئيسية'}
        </div>

        {isTeacher ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <input
                type="text"
                placeholder="البحث عن طالب بالاسم، الكنية، اسم المستخدم..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                تصدير Excel
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-sky-600 text-sky-700 hover:bg-sky-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                طباعة
              </button>
            </div>
          </div>
        ) : (
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
            onExportExcel={handleExportExcel}
          />
        )}

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
            selectedIds={isTeacher ? [] : selectedIds}
            onToggleSelect={isTeacher ? () => {} : handleToggleSelect}
            onToggleSelectAll={isTeacher ? () => {} : handleToggleSelectAll}
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

      {/* Student Details Dialog */}
      <StudentDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedStudentForDetails(null);
        }}
        student={selectedStudentForDetails}
      />
    </AppLayout>
  );
}
