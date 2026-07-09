import { Achievement } from './achievement.types';

export interface ProgressStatsScreenState {
  lectureName: string | null;
  studentName: string | null;
  studentId: number | null;
  startDate: string | null;
  endDate: string | null;
  achievements: Achievement[];
  isLoading: boolean;
  dailyNormalPages: Record<string, number>;
  dailySmallPages: Record<string, number>;
  dailyBigPages: Record<string, number>;
  normalSpots: ChartSpot[];
  smallSpots: ChartSpot[];
  bigSpots: ChartSpot[];
}

export interface ProgressStatsScreenParams {
  lectureName?: string;
  studentName?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ChartSpot {
  x: number;
  y: number;
}

export interface DailyProgress {
  date: string;
  normalPages: number;
  smallPages: number;
  bigPages: number;
  totalPages: number;
}

export interface ProgressChartData {
  normalPages: ChartSpot[];
  smallPages: ChartSpot[];
  bigPages: ChartSpot[];
  dateLabels: string[];
}

export const calculateDailyProgress = (achievements: Achievement[]): DailyProgress[] => {
  const dailyMap: Record<string, DailyProgress> = {};

  achievements.forEach((achievement) => {
    const date = achievement.date;
    if (!dailyMap[date]) {
      dailyMap[date] = {
        date,
        normalPages: 0,
        smallPages: 0,
        bigPages: 0,
        totalPages: 0,
      };
    }

    const pages = achievement.pages || 0;
    const type = achievement.achievementType || 'normal';

    if (type === 'normal') {
      dailyMap[date].normalPages += pages;
    } else if (type === 'small') {
      dailyMap[date].smallPages += pages;
    } else if (type === 'big') {
      dailyMap[date].bigPages += pages;
    }

    dailyMap[date].totalPages += pages;
  });

  return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
};

export const convertProgressToChartData = (progress: DailyProgress[]): ProgressChartData => {
  const dateLabels = progress.map((p) => p.date);
  const normalSpots = progress.map((p, i) => ({ x: i, y: p.normalPages }));
  const smallSpots = progress.map((p, i) => ({ x: i, y: p.smallPages }));
  const bigSpots = progress.map((p, i) => ({ x: i, y: p.bigPages }));

  return {
    normalPages: normalSpots,
    smallPages: smallSpots,
    bigPages: bigSpots,
    dateLabels,
  };
};

export const filterAchievementsByProgressDateRange = (
  achievements: Achievement[],
  startDate: string,
  endDate: string
): Achievement[] => {
  return achievements.filter((achievement) => {
    const achDate = parseProgressDate(achievement.date);
    const start = parseProgressDate(startDate);
    const end = parseProgressDate(endDate);

    if (!achDate || !start || !end) return false;

    return achDate >= start && achDate <= end;
  });
};

const parseProgressDate = (dateString: string): Date | null => {
  try {
    return new Date(dateString);
  } catch {
    return null;
  }
};
