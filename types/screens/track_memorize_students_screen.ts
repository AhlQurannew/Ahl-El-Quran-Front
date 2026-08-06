// @ts-nocheck
import { Lecture } from '../lecture.types';
import { Student } from '../student.types';
import { Achievement } from '../achievement.types';
import { Attendance } from '../attendance.types';

export interface TrackMemorizeStudentsScreenState {
  lecture: Lecture | null;
  date: string | null;
  students: Student[];
  latestAchievements: Record<number, Achievement | undefined>;
  attendanceRecords: Record<number, Attendance | undefined>;
  isLoading: boolean;
  isTeacher: boolean;
}

export interface TrackMemorizeStudentsScreenParams {
  lectureId?: string;
  lectureName?: string;
  date?: string;
}

export interface TrackMemorizeStudentsScreenArgs {
  lecture?: Lecture;
  date?: string;
}

export interface StudentAchievementTrack {
  studentId: number;
  studentName: string;
  latestAchievement: Achievement | null;
  attendance: Attendance | null;
}

export const getStudentTracking = (
  students: Student[],
  achievements: Record<number, Achievement | undefined>,
  attendances: Record<number, Attendance | undefined>
): StudentAchievementTrack[] => {
  return students.map((student) => ({
    studentId: student.id || 0,
    studentName: student.firstNameAr || '',
    latestAchievement: achievements[student.id!] || null,
    attendance: attendances[student.id!] || null,
  }));
};

