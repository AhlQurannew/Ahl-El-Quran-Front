import { Lecture } from './lecture.types';
import { Student } from './student.types';
import { Attendance } from './attendance.types';

export interface AttendanceStudentsScreenState {
  lecture: Lecture | null;
  date: string | null;
  students: Student[];
  attendanceRecords: Record<number, Attendance | undefined>;
  isLoading: boolean;
  isTeacher: boolean;
  isSaving: boolean;
}

export interface AttendanceStatusOption {
  value: AttendanceStatus;
  label: string;
  color: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export interface StudentAttendanceRecord {
  studentId: number;
  studentName: string;
  status: AttendanceStatus;
  timestamp?: string;
}

export interface AttendanceStudentsScreenParams {
  lectureId?: string;
  lectureName?: string;
  date?: string;
}

export interface AttendanceStudentsScreenArgs {
  lecture?: Lecture;
  date?: string;
}

export const ATTENDANCE_STATUS_OPTIONS: AttendanceStatusOption[] = [
  { value: 'present', label: 'حضور', color: '#4CAF50' },
  { value: 'late', label: 'تأخر', color: '#FFA726' },
  { value: 'absent', label: 'غياب', color: '#EF5350' },
  { value: 'excused', label: 'عذر', color: '#42A5F5' },
];

export const getStatusColor = (status: AttendanceStatus): string => {
  const option = ATTENDANCE_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || '#757575';
};

export const getStatusLabel = (status: AttendanceStatus): string => {
  const option = ATTENDANCE_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label || status;
};

export const validateStudentsForAttendance = (students: Student[]): boolean => {
  return Array.isArray(students) && students.length > 0;
};

export const sortStudentsByName = (students: Student[]): Student[] => {
  return [...students].sort((a, b) => {
    const nameA = a.nameAr || a.nameEn || '';
    const nameB = b.nameAr || b.nameEn || '';
    return nameA.localeCompare(nameB, 'ar');
  });
};
