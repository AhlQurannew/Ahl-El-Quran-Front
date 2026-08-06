import { Attendance } from '../attendance.types';

export interface AttendanceStatsScreenState {
  lectureName: string | null;
  studentName: string | null;
  studentId: number | null;
  startDate: string | null;
  endDate: string | null;
  attendances: Attendance[];
  isLoading: boolean;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
}

export interface AttendanceStatsScreenParams {
  lectureName?: string;
  studentName?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AttendanceCountStats {
  present: number;
  late: number;
  absent: number;
  excused: number;
  total: number;
}

export interface AttendanceChartData {
  status: string;
  count: number;
  color: string;
  percentage: number;
}

export const countAttendanceByStatus = (attendances: Attendance[]): AttendanceCountStats => {
  return {
    present: attendances.filter((a) => a.status === 'present').length,
    late: attendances.filter((a) => a.status === 'late').length,
    absent: attendances.filter((a) => a.status === 'absent').length,
    excused: attendances.filter((a) => a.status === 'excused').length,
    total: attendances.length,
  };
};

export const getAttendanceChartData = (stats: AttendanceCountStats): AttendanceChartData[] => {
  const { present, late, absent, excused, total } = stats;

  if (total === 0) return [];

  return [
    {
      status: 'حضور',
      count: present,
      color: '#4CAF50',
      percentage: (present / total) * 100,
    },
    {
      status: 'تأخر',
      color: '#FFA726',
      count: late,
      percentage: (late / total) * 100,
    },
    {
      status: 'غياب',
      color: '#EF5350',
      count: absent,
      percentage: (absent / total) * 100,
    },
    {
      status: 'عذر',
      color: '#42A5F5',
      count: excused,
      percentage: (excused / total) * 100,
    },
  ];
};

export const filterAttendancesByDateRange = (
  attendances: Attendance[],
  startDate: string,
  endDate: string
): Attendance[] => {
  return attendances.filter((attendance) => {
    const attDate = parseDate(attendance.date);
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!attDate || !start || !end) return false;

    return attDate >= start && attDate <= end;
  });
};

const parseDate = (dateString: string): Date | null => {
  try {
    return new Date(dateString);
  } catch {
    return null;
  }
};
