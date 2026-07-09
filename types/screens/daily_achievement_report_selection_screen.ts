import { Lecture } from './lecture.types';

export interface DailyAchievementReportSelectionScreenState {
  date: string;
  selectedLecture: Lecture | null;
  lectures: Lecture[];
  isLoading: boolean;
}

export interface DailyAchievementReportSelectionForm {
  lectureId: number | null;
  date: string;
}

export const getTodayDateString = (): string => {
  const today = new Date();
  return formatDateForDaily(today);
};

export const formatDateForDaily = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseDateForDaily = (dateString: string): Date | null => {
  const [day, month, year] = dateString.split('-').map(Number);
  if (day && month && year) {
    return new Date(year, month - 1, day);
  }
  return null;
};

export interface HeaderBarConfig {
  title: string;
  backgroundColor: string;
  textColor: string;
}

export const DAILY_REPORT_HEADER: HeaderBarConfig = {
  title: 'تقرير الإنجاز اليومي',
  backgroundColor: '#DEB059',
  textColor: '#FFFFFF',
};

export const validateDailySelection = (lectureId: number | null, date: string): boolean => {
  return lectureId !== null && lectureId > 0 && date.length > 0;
};
