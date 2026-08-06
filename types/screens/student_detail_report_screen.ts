// @ts-nocheck
import { Lecture } from '../lecture.types';
import { Achievement } from '../achievement.types';

export interface StudentDetailReportScreenState {
  lecture: Lecture | null;
  date: string | null;
  studentId: number | null;
  studentName: string | null;
  achievements: Achievement[];
  isLoading: boolean;
}

export interface StudentDetailReportParams {
  lectureId?: string;
  lectureName?: string;
  date?: string;
  studentId?: string;
  studentName?: string;
}

export interface StudentAchievementReportData {
  studentId: number;
  studentName: string;
  lectureId: number;
  lectureName: string;
  date: string;
  achievements: Achievement[];
  totalPages: number;
}

export const calculateStudentPages = (achievements: Achievement[]): number => {
  return achievements.reduce((sum, achievement) => sum + (achievement.pages || 0), 0);
};

export const groupStudentAchievementsByType = (
  achievements: Achievement[]
): Record<string, Achievement[]> => {
  return achievements.reduce(
    (acc, achievement) => {
      const type = achievement.achievementType || 'normal';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(achievement);
      return acc;
    },
    {} as Record<string, Achievement[]>
  );
};

export const parseStudentReportDate = (dateString: string): Date | null => {
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

export const generateStudentDetailReportPDF = (
  reportData: StudentAchievementReportData
): Blob => {
  // Placeholder for PDF generation
  return new Blob();
};

