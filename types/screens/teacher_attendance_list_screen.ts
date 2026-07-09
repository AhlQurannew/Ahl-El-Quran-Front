import { Teacher } from './teacher.types';
import { TeacherAttendance } from './teacher_attendance.types';

export interface TeacherAttendanceListScreenState {
  date: string | null;
  teachers: Teacher[];
  attendanceRecords: Record<number, TeacherAttendance | undefined>;
  isLoading: boolean;
}

export interface TeacherAttendanceListScreenParams {
  date?: string;
}

export interface TeacherAttendanceStatus {
  value: 'present' | 'late' | 'absent' | 'excused';
  label: string;
  color: string;
}

export interface TeacherAttendanceRecord {
  teacherId: number;
  teacherName: string;
  status: TeacherAttendanceStatus['value'];
  timestamp?: string;
}

export const TEACHER_ATTENDANCE_STATUS_OPTIONS: TeacherAttendanceStatus[] = [
  { value: 'present', label: 'حضور', color: '#4CAF50' },
  { value: 'late', label: 'تأخر', color: '#FFA726' },
  { value: 'absent', label: 'غياب', color: '#EF5350' },
  { value: 'excused', label: 'عذر', color: '#42A5F5' },
];

export const getTeacherStatusColor = (status: string): string => {
  const option = TEACHER_ATTENDANCE_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || '#757575';
};

export const getTeacherStatusLabel = (status: string): string => {
  const option = TEACHER_ATTENDANCE_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label || status;
};

export const sortTeachersByName = (teachers: Teacher[]): Teacher[] => {
  return [...teachers].sort((a, b) => {
    const nameA = a.firstNameAr || a.firstNameEn || '';
    const nameB = b.firstNameAr || b.firstNameEn || '';
    return nameA.localeCompare(nameB, 'ar');
  });
};
