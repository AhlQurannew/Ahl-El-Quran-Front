import { Lecture } from '../lecture.types';

export interface AttendanceSelectionScreenState {
  date: string;
  selectedLecture: Lecture | null;
  lectures: Lecture[];
  isLoading: boolean;
  userRole: 'teacher' | 'admin' | 'supervisor' | null;
}

export interface AttendanceSelectionForm {
  lectureId: number | null;
  date: string;
}

export const getTodayDateString = (): string => {
  const today = new Date();
  return formatDateForSelection(today);
};

export const formatDateForSelection = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseDateForSelection = (dateString: string): Date | null => {
  const [day, month, year] = dateString.split('-').map(Number);
  if (day && month && year) {
    return new Date(year, month - 1, day);
  }
  return null;
};

export interface LectureLoadOptions {
  isTeacher: boolean;
  endpoint: string;
  errorMessage: string;
}

export const getLectureLoadOptions = (isTeacher: boolean): LectureLoadOptions => {
  return {
    isTeacher,
    endpoint: isTeacher ? '/api/my-lectures' : '/api/lectures',
    errorMessage: 'فشل في تحميل الحلقات',
  };
};

export const SESSION_EXPIRED_MESSAGE = 'انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى';
