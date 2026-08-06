// @ts-nocheck
import { Student } from '../student.types';

export interface StudentManagementScreenState {
  students: Student[];
  filteredStudents: Student[];
  selectedStudents: Student[];
  isLoading: boolean;
  errorMessage: string | null;
  searchQuery: string;
  isReadOnly: boolean;
}

export interface StudentSearchFilter {
  query: string;
  lectureId?: number;
  sortBy?: 'name' | 'date';
}

export interface StudentGridRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  action?: string;
}

export const filterStudents = (
  students: Student[],
  searchQuery: string
): Student[] => {
  if (!searchQuery) return students;

  const lowerQuery = searchQuery.toLowerCase();
  return students.filter((student) => {
    const fullName = `${student.firstNameAr || ''} ${student.lastNameAr || ''}`.toLowerCase();
    const email = student.email?.toLowerCase() || '';
    return fullName.includes(lowerQuery) || email.includes(lowerQuery);
  });
};

export const toggleStudentSelection = (
  selected: Student[],
  student: Student
): Student[] => {
  const exists = selected.some((s) => s.id === student.id);
  if (exists) {
    return selected.filter((s) => s.id !== student.id);
  }
  return [...selected, student];
};

export const isStudentSelected = (selected: Student[], student: Student): boolean => {
  return selected.some((s) => s.id === student.id);
};

export const STUDENT_MANAGEMENT_MESSAGES = {
  loadingError: 'فشل تحميل البيانات',
  deletionSuccess: 'تم حذف الطلاب بنجاح',
  deletionError: 'فشل حذف الطلاب',
  confirmDelete: 'هل أنت متأكد من حذف الطلاب المحددين؟',
  headerViewOnly: 'طلابي / عرض فقط',
  headerAdmin: 'إدارة الطلاب / الصفحة الرئيسية',
  searchPlaceholder: 'البحث...',
};

export const STUDENT_STATUS = {
  active: 'نشط',
  inactive: 'غير نشط',
  archived: 'مؤرشف',
};

