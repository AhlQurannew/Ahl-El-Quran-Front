import { Lecture } from './lecture.types';
import { Student } from './student.types';
import { Achievement } from './achievement.types';

export interface LectureDetailReportScreenState {
  lecture: Lecture | null;
  startDate: string | null;
  endDate: string | null;
  students: Student[];
  studentAchievements: Record<number, Achievement[]>;
  isLoading: boolean;
}

export interface LectureDetailReportParams {
  lectureId?: string;
  lectureName?: string;
  startDate?: string;
  endDate?: string;
}

export interface StudentLectureAchievements {
  studentId: number;
  studentName: string;
  achievements: Achievement[];
  totalPages: number;
  achievementTypes: Record<string, number>;
}

export interface LectureDetailReportData {
  lectureId: number;
  lectureName: string;
  dateRange: {
    start: string;
    end: string;
  };
  studentReports: StudentLectureAchievements[];
  summary: {
    totalStudents: number;
    totalAchievements: number;
    totalPages: number;
  };
  generatedAt: string;
}

export const calculateStudentReportStats = (achievements: Achievement[]): {
  totalPages: number;
  byType: Record<string, number>;
} => {
  const totalPages = achievements.reduce((sum, a) => sum + (a.pages || 0), 0);
  const byType: Record<string, number> = {};

  achievements.forEach((achievement) => {
    const type = achievement.achievementType || 'normal';
    byType[type] = (byType[type] || 0) + (achievement.pages || 0);
  });

  return { totalPages, byType };
};

export const filterAchievementsByDateRange = (
  achievements: Achievement[],
  startDate: string,
  endDate: string
): Achievement[] => {
  return achievements.filter((achievement) => {
    const achDate = parseReportDate(achievement.date);
    const start = parseReportDate(startDate);
    const end = parseReportDate(endDate);

    if (!achDate || !start || !end) return false;

    return achDate >= start && achDate <= end;
  });
};

export const generateLectureDetailReportPDF = (
  reportData: LectureDetailReportData
): Blob => {
  // Placeholder for PDF generation
  return new Blob();
};

const parseReportDate = (dateString: string): Date | null => {
  try {
    const [day, month, year] = dateString.split('-').map(Number);
    if (day && month && year) {
      return new Date(year, month - 1, day);
    }
  } catch {
    return null;
  }
  return null;
};

export const sortStudentsByName = (
  students: StudentLectureAchievements[]
): StudentLectureAchievements[] => {
  return [...students].sort((a, b) => a.studentName.localeCompare(b.studentName, 'ar'));
};
