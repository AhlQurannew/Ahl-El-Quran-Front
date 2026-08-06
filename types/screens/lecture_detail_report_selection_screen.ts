import { Lecture } from '../lecture.types';

export interface LectureDetailReportSelectionScreenState {
  startDate: string;
  endDate: string;
  selectedLecture: Lecture | null;
  lectures: Lecture[];
  isLoading: boolean;
}

export interface LectureDetailReportSelectionForm {
  lectureId: number | null;
  startDate: string;
  endDate: string;
}

export const getDefaultLectureReportDates = () => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return {
    startDate: formatLectureReportDate(sevenDaysAgo),
    endDate: formatLectureReportDate(today),
  };
};

export const formatLectureReportDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseLectureReportDate = (dateString: string): Date | null => {
  const [day, month, year] = dateString.split('-').map(Number);
  if (day && month && year) {
    return new Date(year, month - 1, day);
  }
  return null;
};

export const isValidLectureReportDateRange = (startDate: string, endDate: string): boolean => {
  const start = parseLectureReportDate(startDate);
  const end = parseLectureReportDate(endDate);
  return start !== null && end !== null && start <= end;
};

export interface LectureReportHeaderConfig {
  title: string;
  backgroundColor: string;
  textColor: string;
}

export const LECTURE_REPORT_HEADER: LectureReportHeaderConfig = {
  title: 'التقرير التفصيلي للحلقات',
  backgroundColor: '#DEB059',
  textColor: '#FFFFFF',
};

export const validateLectureReportSelection = (
  lectureId: number | null,
  startDate: string,
  endDate: string
): boolean => {
  return (
    lectureId !== null && lectureId > 0 && isValidLectureReportDateRange(startDate, endDate)
  );
};
