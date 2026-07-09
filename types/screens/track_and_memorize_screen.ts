import { Lecture } from './lecture.types';

export interface TrackAndMemorizeScreenState {
  date: string;
  selectedLecture: Lecture | null;
  lectures: Lecture[];
  isLoading: boolean;
}

export interface TrackAndMemorizeSelectionForm {
  lectureId: number | null;
  date: string;
}

export const getTodayTrackDate = (): string => {
  const today = new Date();
  return formatTrackDate(today);
};

export const formatTrackDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseTrackDate = (dateString: string): Date | null => {
  const [day, month, year] = dateString.split('-').map(Number);
  if (day && month && year) {
    return new Date(year, month - 1, day);
  }
  return null;
};

export const validateTrackSelection = (lectureId: number | null, date: string): boolean => {
  return lectureId !== null && lectureId > 0 && date.length > 0;
};

export const SESSION_EXPIRED_MESSAGE_TRACK =
  'انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى';
