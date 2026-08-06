export interface TeacherAttendanceSelectionScreenState {
  date: string;
  isLoading: boolean;
}

export interface TeacherAttendanceSelectionForm {
  date: string;
}

export const getTodayTeacherDate = (): string => {
  const today = new Date();
  return formatTeacherDate(today);
};

export const formatTeacherDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseTeacherDate = (dateString: string): Date | null => {
  const [day, month, year] = dateString.split('-').map(Number);
  if (day && month && year) {
    return new Date(year, month - 1, day);
  }
  return null;
};

export interface TeacherAttendanceHeaderConfig {
  title: string;
  breadcrumb: string;
  backgroundColor: string;
  textColor: string;
}

export const TEACHER_ATTENDANCE_HEADER: TeacherAttendanceHeaderConfig = {
  title: 'متابعة مواظبة المعلمين',
  breadcrumb: 'متابعة مواظبة المعلمين / الصفحة الرئيسية',
  backgroundColor: '#DEB059',
  textColor: '#FFFFFF',
};

export const validateTeacherAttendanceDate = (date: string): boolean => {
  return date.length > 0 && parseTeacherDate(date) !== null;
};
