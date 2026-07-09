import { Lecture } from './lecture.types';
import { Student } from './student.types';

export interface ProgressStatsSelectionScreenState {
  startDate: string;
  endDate: string;
  selectedLecture: Lecture | null;
  selectedStudent: Student | null;
  lectures: Lecture[];
  students: Student[];
  isLoading: boolean;
  isLoadingStudents: boolean;
}

export interface ProgressStatsSelectionForm {
  lectureId: number | null;
  studentId: number | null;
  startDate: string;
  endDate: string;
}

export const getDefaultProgressStatsDateRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    startDate: formatProgressStatsDate(thirtyDaysAgo),
    endDate: formatProgressStatsDate(today),
  };
};

export const formatProgressStatsDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseProgressStatsDate = (dateString: string): Date | null => {
  const [day, month, year] = dateString.split('-').map(Number);
  if (day && month && year) {
    return new Date(year, month - 1, day);
  }
  return null;
};

export const isValidProgressStateDateRange = (startDate: string, endDate: string): boolean => {
  const start = parseProgressStatsDate(startDate);
  const end = parseProgressStatsDate(endDate);
  return start !== null && end !== null && start <= end;
};

export const validateProgressStatsSelection = (
  lectureId: number | null,
  studentId: number | null,
  startDate: string,
  endDate: string
): boolean => {
  return (
    lectureId !== null &&
    studentId !== null &&
    isValidProgressStateDateRange(startDate, endDate)
  );
};
