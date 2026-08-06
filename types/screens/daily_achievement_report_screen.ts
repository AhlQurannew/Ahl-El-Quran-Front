// @ts-nocheck
import { Lecture } from '../lecture.types';
import { Student } from '../student.types';
import { Achievement } from '../achievement.types';

export interface DailyAchievementReportScreenState {
  lecture: Lecture | null;
  date: string | null;
  students: Student[];
  allLectures: Lecture[];
  studentAchievements: Record<number, Achievement[]>;
  isLoading: boolean;
}

export interface DailyAchievementReportParams {
  lectureId?: string;
  lectureName?: string;
  date?: string;
}

export interface DailyStudentAchievements {
  studentId: number;
  studentName: string;
  achievements: Achievement[];
  totalPages: number;
}

export interface DailyReportData {
  lectureId: number;
  lectureName: string;
  date: string;
  studentReports: DailyStudentAchievements[];
  generatedAt: string;
}

export const calculateTotalPagesForStudent = (achievements: Achievement[]): number => {
  return achievements.reduce((sum, achievement) => sum + (achievement.pages || 0), 0);
};

export const groupAchievementsByType = (
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

export const generatePDFReportData = (reportData: DailyReportData) => {
  // Placeholder for PDF generation
  return {
    title: reportData.lectureName,
    date: reportData.date,
    students: reportData.studentReports,
  };
};

export const filterAchievementsByDate = (
  achievements: Achievement[],
  date: string
): Achievement[] => {
  return achievements.filter((achievement) => achievement.date === date);
};

