import { Lecture } from './lecture.types';

export interface LectureStatsSelectionScreenState {
  startDate: string;
  endDate: string;
  selectedLecture: Lecture | null;
  lectures: Lecture[];
  isLoading: boolean;
}

export interface LectureStatsSelectionForm {
  lectureId: number | null;
  startDate: string;
  endDate: string;
}

export const getDefaultLectureStatsDateRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    startDate: formatLectureStatsDate(thirtyDaysAgo),
    endDate: formatLectureStatsDate(today),
  };
};

export const formatLectureStatsDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseLectureStatsDate = (dateString: string): Date | null => {
  const [day, month, year] = dateString.split('-').map(Number);
  if (day && month && year) {
    return new Date(year, month - 1, day);
  }
  return null;
};

export const isValidLectureStatsDateRange = (startDate: string, endDate: string): boolean => {
  const start = parseLectureStatsDate(startDate);
  const end = parseLectureStatsDate(endDate);
  return start !== null && end !== null && start <= end;
};

export interface LectureStatsHeaderConfig {
  title: string;
  backgroundColor: string;
  textColor: string;
}

export const LECTURE_STATS_HEADER: LectureStatsHeaderConfig = {
  title: 'إحصائيات الحلقة',
  backgroundColor: '#DEB059',
  textColor: '#FFFFFF',
};

export const validateLectureStatsSelection = (
  lectureId: number | null,
  startDate: string,
  endDate: string
): boolean => {
  return lectureId !== null && lectureId > 0 && isValidLectureStatsDateRange(startDate, endDate);
};
