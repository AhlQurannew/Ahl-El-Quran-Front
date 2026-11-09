import axios from 'axios';
import { setupInterceptors } from '@/app/API/interceptors';
import { API_BASE_URL } from '@/utils/apiConfig';

export type Granularity = 'day' | 'week' | 'month';
export type AnalyticsLevel = 'platform' | 'school' | 'lecture' | 'student';
export type Health = 'good' | 'warning' | 'critical' | 'insufficient';
export type AttendanceStatusKey = 'present' | 'late' | 'excused' | 'absent';
export type AchievementTypeKey = 'normal' | 'small' | 'big';

export interface AnalyticsQuery {
  date_from?: string;
  date_to?: string;
  granularity?: Granularity;
  school_id?: number;
  lecture_id?: number;
  student_id?: number;
}

export interface PeriodSummary {
  attendance_records: number;
  attendance_rate: number | null;
  status_breakdown: Record<AttendanceStatusKey, number>;
  achievements: number;
  thumn: number;
  thumn_by_type: Record<AchievementTypeKey, number>;
}

export interface AnalyticsKpis extends PeriodSummary {
  students: number;
  active_students: number;
  schools: number;
  lectures: number;
  teachers: number | null;
  previous: PeriodSummary;
}

export interface SeriesPoint extends Record<AttendanceStatusKey, number> {
  bucket: string;
  attendance_rate: number | null;
  attendance_records: number;
  achievements: number;
  thumn: number;
  thumn_normal: number;
  thumn_small: number;
  thumn_big: number;
}

export interface BreakdownRow {
  id: number;
  name: string;
  name_en?: string | null;
  students: number;
  active_students: number;
  teachers?: number;
  lectures?: number;
  attendance_rate: number | null;
  attendance_records: number;
  status_breakdown: Record<AttendanceStatusKey, number>;
  achievements: number;
  thumn: number;
  last_activity: string | null;
  health: Health;
}

export interface StudentAlert {
  id: number;
  name: string;
  name_en?: string | null;
  school?: string | null;
  reason: 'low_attendance' | 'no_activity';
  attendance_rate: number | null;
  attendance_records: number;
  thumn: number;
}

/** A top student of a school, for one schooling mode; score is 0-100. */
export interface TopStudent {
  id: number;
  name: string;
  name_en?: string | null;
  rank: number;
  score: number;
  attendance_rate: number | null;
  thumn: number;
  exam_average: number | null;
}

export interface SchoolTopStudents {
  school_id: number;
  school: string | null;
  /** Full time */
  internal: TopStudent[];
  /** Part time (khariji) */
  external: TopStudent[];
  /** Separate rankings among boys / girls (each its own top 5). */
  male?: { internal: TopStudent[]; external: TopStudent[] };
  female?: { internal: TopStudent[]; external: TopStudent[] };
}

export interface ScopeRef {
  id: number;
  name: string;
  name_en?: string | null;
}

export interface StudentDetail {
  enrollment_date: string | null;
  sex: string | null;
  lectures: ScopeRef[];
  attendance: { day: string; status: AttendanceStatusKey; lecture: string | null }[];
  achievements: { day: string; type: AchievementTypeKey; thumn: number }[];
  cumulative_thumn: { day: string; thumn: number }[];
}

export interface AnalyticsData {
  level: AnalyticsLevel;
  scope: { school: ScopeRef | null; lecture: ScopeRef | null; student: ScopeRef | null };
  period: { from: string; to: string; granularity: Granularity; previous_from: string; previous_to: string };
  kpis: AnalyticsKpis;
  series: SeriesPoint[];
  breakdown: { level: 'school' | 'lecture' | 'student' | null; rows: BreakdownRow[] };
  alerts: StudentAlert[];
  top_students: SchoolTopStudents[];
  student: StudentDetail | null;
  generated_at: string;
}

const analyticsClient = axios.create({
  baseURL: `${API_BASE_URL}/admin/analytics`,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
});
// Platform-wide admin data: never scope it to the school the admin may be "viewing".
setupInterceptors(analyticsClient, false);

const getAnalytics = async (query: AnalyticsQuery): Promise<AnalyticsData> => {
  const params = Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ''));
  const res = await analyticsClient.get<AnalyticsData>('/', { params });
  return res.data;
};

const analyticsAPI = { getAnalytics };

export default analyticsAPI;
