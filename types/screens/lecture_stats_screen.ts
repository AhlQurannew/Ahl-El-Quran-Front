import { Student } from './student.types';
import { Achievement } from './achievement.types';

export interface LectureStatsScreenState {
  lectureName: string | null;
  lectureId: number | null;
  startDate: string | null;
  endDate: string | null;
  students: Student[];
  studentPages: Record<number, number>;
  isLoading: boolean;
}

export interface LectureStatsScreenParams {
  lectureName?: string;
  lectureId?: string;
  startDate?: string;
  endDate?: string;
}

export interface StudentLecturePages {
  studentId: number;
  studentName: string;
  normalPages: number;
  smallPages: number;
  bigPages: number;
  totalPages: number;
}

export interface LectureStatsData {
  lectureId: number;
  lectureName: string;
  dateRange: {
    start: string;
    end: string;
  };
  studentStats: StudentLecturePages[];
  summary: {
    totalStudents: number;
    totalPages: number;
    averagePages: number;
  };
}

export const calculateNormalPagesForStudent = (
  achievements: Achievement[],
  startDate?: string,
  endDate?: string
): number => {
  return achievements
    .filter(
      (a) =>
        a.achievementType === 'normal' &&
        (!startDate || !endDate || isDateInRange(a.date, startDate, endDate))
    )
    .reduce((sum, a) => sum + (a.pages || 0), 0);
};

export const calculateLectureStats = (
  students: Student[],
  studentPages: Record<number, number>
): LectureStatsData | null => {
  const totalPages = Object.values(studentPages).reduce((sum, pages) => sum + pages, 0);
  const validStudents = students.filter((s) => studentPages[s.id!]);

  return {
    lectureId: 0,
    lectureName: '',
    dateRange: { start: '', end: '' },
    studentStats: validStudents.map((student) => ({
      studentId: student.id || 0,
      studentName: student.firstNameAr || '',
      normalPages: studentPages[student.id!] || 0,
      smallPages: 0,
      bigPages: 0,
      totalPages: studentPages[student.id!] || 0,
    })),
    summary: {
      totalStudents: validStudents.length,
      totalPages,
      averagePages: validStudents.length > 0 ? totalPages / validStudents.length : 0,
    },
  };
};

const isDateInRange = (date: string, startDate: string, endDate: string): boolean => {
  try {
    const achDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return achDate >= start && achDate <= end;
  } catch {
    return false;
  }
};

export const sortStudentsByPages = (
  students: StudentLecturePages[],
  descending = true
): StudentLecturePages[] => {
  return [...students].sort((a, b) =>
    descending ? b.totalPages - a.totalPages : a.totalPages - b.totalPages
  );
};
