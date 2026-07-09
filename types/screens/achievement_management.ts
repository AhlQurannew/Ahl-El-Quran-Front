import { Lecture } from './lecture.types';
import { Achievement } from './achievement.types';

export interface AchievementManagementState {
  id: number | null;
  selectedDate: Date | null;
  dateString: string;
  selectedLecture: Lecture | null;
  achievements: Achievement[];
  isLoading: boolean;
}

export interface AchievementManagementProps {
  onDateChange: (date: string) => void;
  onLectureSelect: (lectureId: number) => void;
  onAchievementAdd: (achievement: Achievement) => void;
}

export interface AddAchievementForm {
  lectureId: number | null;
  date: string;
}

export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const parseDate = (dateString: string): Date | null => {
  const [year, month, day] = dateString.split('-').map(Number);
  if (year && month && day) {
    return new Date(year, month - 1, day);
  }
  return null;
};
