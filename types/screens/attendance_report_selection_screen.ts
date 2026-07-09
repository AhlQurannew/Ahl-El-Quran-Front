import { Lecture } from './lecture.types';

export interface AttendanceReportSelectionScreenState {
  startDate: string;
  endDate: string;
  selectedLecture: Lecture | null;
  lectures: Lecture[];
  isLoading: boolean;
}

export interface AttendanceReportSelectionForm {
  lectureId: number | null;
  startDate: string;
  endDate: string;
}

export const getDefaultReportDates = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    startDate: formatDateForDisplay(thirtyDaysAgo),
    endDate: formatDateForDisplay(today),
  };
};

export const formatDateForDisplay = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseDisplayDate = (dateString: string): Date | null => {
  const [day, month, year] = dateString.split('-').map(Number);
  if (day && month && year) {
    return new Date(year, month - 1, day);
  }
  return null;
};

export interface HeaderBarStyle {
  backgroundColor: string;
  textColor: string;
  title: string;
}

export const HEADER_CONFIG: HeaderBarStyle = {
  backgroundColor: 'rgb(212, 175, 55)', // Golden color
  textColor: 'rgb(255, 255, 255)',
  title: 'تقرير المواظبة',
};
