import { Teacher } from '../teacher.types';

export interface TeacherManagementScreenState {
  teachers: TeacherInfoDialog[];
  filteredTeachers: TeacherInfoDialog[];
  selectedTeachers: TeacherInfoDialog[];
  isLoading: boolean;
  errorMessage: string | null;
  searchQuery: string;
}

export interface TeacherInfoDialog {
  teacherId: number;
  firstName: string;
  lastName: string;
  riwaya: string;
  phone?: string;
  email?: string;
  username?: string;
}

export interface TeacherSearchFilter {
  query: string;
  riwaya?: string;
  sortBy?: 'name' | 'riwaya';
}

export const filterTeachers = (
  teachers: TeacherInfoDialog[],
  searchQuery: string
): TeacherInfoDialog[] => {
  if (!searchQuery) return teachers;

  const lowerQuery = searchQuery.toLowerCase();
  return teachers.filter((teacher) => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
    const riwaya = teacher.riwaya?.toLowerCase() || '';
    return fullName.includes(lowerQuery) || riwaya.includes(lowerQuery);
  });
};

export const toggleTeacherSelection = (
  selected: TeacherInfoDialog[],
  teacher: TeacherInfoDialog
): TeacherInfoDialog[] => {
  const exists = selected.some((t) => t.teacherId === teacher.teacherId);
  if (exists) {
    return selected.filter((t) => t.teacherId !== teacher.teacherId);
  }
  return [...selected, teacher];
};

export const isTeacherSelected = (
  selected: TeacherInfoDialog[],
  teacher: TeacherInfoDialog
): boolean => {
  return selected.some((t) => t.teacherId === teacher.teacherId);
};

export const TEACHER_MANAGEMENT_MESSAGES = {
  loadingError: 'فشل تحميل البيانات',
  deletionSuccess: 'تم حذف المعلمين بنجاح',
  deletionError: 'فشل حذف المعلمين',
  confirmDelete: 'هل أنت متأكد من حذف المعلمين المحددين؟',
  sessionExpired: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
};
