import { Lecture } from './lecture.types';
import { Student } from './student.types';

export interface StudentDetailReportSelectionScreenState {
  date: string;
  selectedLecture: Lecture | null;
  selectedStudent: Student | null;
  lectures: Lecture[];
  students: Student[];
  isLoading: boolean;
  isLoadingStudents: boolean;
}

export interface StudentDetailReportSelectionForm {
  lectureId: number | null;
  studentId: number | null;
  date: string;
}

export const getTodayStudentReportDate = (): string => {
  const today = new Date();
  return formatStudentReportDate(today);
};

export const formatStudentReportDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseStudentReportDate = (dateString: string): Date | null => {
  const [day, month, year] = dateString.split('-').map(Number);
  if (day && month && year) {
    return new Date(year, month - 1, day);
  }
  return null;
};

export const validateStudentDetailSelection = (
  lectureId: number | null,
  studentId: number | null,
  date: string
): boolean => {
  return lectureId !== null && studentId !== null && date.length > 0;
};

export interface StudentDetailReportHeaderConfig {
  title: string;
  backgroundColor: string;
  textColor: string;
}

export const STUDENT_DETAIL_REPORT_HEADER: StudentDetailReportHeaderConfig = {
  title: 'التقرير التفصيلي للطالب',
  backgroundColor: '#DEB059',
  textColor: '#FFFFFF',
};
