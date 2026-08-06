import { Lecture } from '../lecture.types';
import { Student } from '../student.types';

export interface AttendanceStatsSelectionScreenState {
  startDate: string;
  endDate: string;
  selectedLecture: Lecture | null;
  selectedStudent: Student | null;
  lectures: Lecture[];
  students: Student[];
  isLoading: boolean;
  isLoadingStudents: boolean;
}

export interface AttendanceStatsSelectionForm {
  lectureId: number | null;
  studentId: number | null;
  startDate: string;
  endDate: string;
}

export const getDefaultStatsDateRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    startDate: formatDateForStats(thirtyDaysAgo),
    endDate: formatDateForStats(today),
  };
};

export const formatDateForStats = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseDateForStats = (dateString: string): Date | null => {
  const [day, month, year] = dateString.split('-').map(Number);
  if (day && month && year) {
    return new Date(year, month - 1, day);
  }
  return null;
};

export const isValidDateRangeForStats = (startDate: string, endDate: string): boolean => {
  const start = parseDateForStats(startDate);
  const end = parseDateForStats(endDate);
  return start !== null && end !== null && start <= end;
};

export interface SelectionValidation {
  isValid: boolean;
  errors: string[];
}

export const validateAttendanceStatsSelection = (
  lectureId: number | null,
  studentId: number | null,
  startDate: string,
  endDate: string
): SelectionValidation => {
  const errors: string[] = [];

  if (!lectureId) {
    errors.push('يجب تحديد الحلقة');
  }

  if (!studentId) {
    errors.push('يجب تحديد الطالب');
  }

  if (!isValidDateRangeForStats(startDate, endDate)) {
    errors.push('نطاق التاريخ غير صحيح');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
