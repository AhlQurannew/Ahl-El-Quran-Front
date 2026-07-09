import { Achievement } from './achievement.types';
import { Lecture } from './lecture.types';
import { Student } from './student.types';

export interface AchievementStatsScreenState {
  lectureName: string | null;
  studentName: string | null;
  studentId: number | null;
  startDate: string | null;
  endDate: string | null;
  achievements: Achievement[];
  isLoading: boolean;
  normalPages: number;
  smallPages: number;
  bigPages: number;
}

export interface AchievementStatsScreenParams {
  lectureName?: string;
  studentName?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AchievementPageStats {
  normalPages: number;
  smallPages: number;
  bigPages: number;
  totalPages: number;
}

export interface FilteredAchievements {
  all: Achievement[];
  normal: Achievement[];
  small: Achievement[];
  big: Achievement[];
}

export const calculatePages = (achievements: Achievement[]): number => {
  return achievements.reduce((sum, achievement) => sum + (achievement.pages || 0), 0);
};

export const filterAchievementsByDateRange = (
  achievements: Achievement[],
  startDate: string,
  endDate: string
): Achievement[] => {
  return achievements.filter((achievement) => {
    const achDate = parseDate(achievement.date);
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!achDate || !start || !end) return false;

    return achDate >= start && achDate <= end;
  });
};

const parseDate = (dateString: string): Date | null => {
  try {
    return new Date(dateString);
  } catch {
    return null;
  }
};
