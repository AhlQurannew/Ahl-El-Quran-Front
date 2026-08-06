import { Lecture } from '../lecture.types';
import { Student } from '../student.types';
import { Attendance } from '../attendance.types';

export interface AttendanceReportScreenState {
  lecture: Lecture | null;
  startDate: string | null;
  endDate: string | null;
  students: Student[];
  attendanceStats: Record<number, AttendanceStatistics>;
  isLoading: boolean;
}

export interface AttendanceStatistics {
  studentId: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  totalSessions: number;
  attendanceRate: number;
}

export interface AttendanceReportParams {
  lectureId?: string;
  lectureName?: string;
  startDate?: string;
  endDate?: string;
}

export interface AttendanceReportData {
  lectureId: number;
  lectureName: string;
  dateRange: {
    start: string;
    end: string;
  };
  statistics: AttendanceStatistics[];
  generatedAt: string;
}

export const calculateAttendanceRate = (stats: AttendanceStatistics): number => {
  if (stats.totalSessions === 0) return 0;
  return Math.round((stats.presentCount / stats.totalSessions) * 100);
};

export const generatePDFReport = async (reportData: AttendanceReportData): Promise<Blob> => {
  // Placeholder for PDF generation logic
  return new Blob();
};

export const formatAttendanceStats = (attendances: Attendance[]): AttendanceStatistics => {
  return {
    studentId: 0,
    presentCount: attendances.filter((a) => a.status === 'present').length,
    lateCount: attendances.filter((a) => a.status === 'late').length,
    absentCount: attendances.filter((a) => a.status === 'absent').length,
    excusedCount: attendances.filter((a) => a.status === 'excused').length,
    totalSessions: attendances.length,
    attendanceRate: 0,
  };
};
