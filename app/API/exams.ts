import axios from 'axios';
import { setupInterceptors } from '@/app/API/interceptors';
import { API_BASE_URL } from '@/utils/apiConfig';

export type ExamAttendance = 'present' | 'absent' | 'excused';
export type ExamType = 'monthly' | 'term' | 'final' | 'tajwid' | 'other';

export interface ExamStats {
  total: number;
  present: number;
  absent: number;
  excused: number;
  graded: number;
  /** Present students without a mark yet */
  pending: number;
  average: number | null;
  average_pct: number | null;
  highest: number | null;
  lowest: number | null;
  passed: number;
  pass_rate: number | null;
  attendance_rate: number | null;
}

export interface Exam {
  id: number;
  title: string;
  exam_type: ExamType | null;
  exam_date: string;
  lecture_id: number;
  lecture_name_ar: string;
  lecture_name_en: string | null;
  max_mark: number;
  pass_mark: number;
  notes: string | null;
  can_edit: boolean;
  stats: ExamStats;
}

export interface ExamResult {
  student_id: number;
  name: string;
  registration_number: string | null;
  speciality_name: string | null;
  attendance: ExamAttendance;
  mark: number | null;
  percent: number | null;
  passed: boolean | null;
  /** Competition rank (1, 1, 3) among present graded students */
  rank: number | null;
  notes: string | null;
}

export interface ExamCandidate {
  student_id: number;
  name: string;
  registration_number: string | null;
  /** Enrolled in the exam's circle */
  in_lecture: boolean;
}

export interface ExamDetail extends Exam {
  results: ExamResult[];
  candidates: ExamCandidate[];
}

export interface ExamPayload {
  lecture_id: number;
  title: string;
  exam_type: ExamType | null;
  exam_date: string;
  max_mark: number;
  pass_mark: number;
  notes: string | null;
}

export interface ExamResultPayload {
  student_id: number;
  attendance: ExamAttendance;
  mark: number | null;
  notes: string | null;
}

export interface ExamLecture {
  lecture_id: number;
  lecture_name_ar: string;
  lecture_name_en: string | null;
  student_count: number;
}

export interface StandingRow {
  student_id: number;
  name: string;
  registration_number: string | null;
  average_pct: number | null;
  average_20: number | null;
  rank: number | null;
  circles_graded: number;
}

export interface SpecialitySummary {
  speciality_id: number;
  name: string;
  is_common: boolean;
  student_count: number;
  circle_count: number;
  average_pct: number | null;
  ranked_count: number;
  top: StandingRow[];
}

export interface SpecialityStanding {
  speciality_id: number;
  speciality_name: string;
  circles: { lecture_id: number; lecture_name_ar: string; lecture_name_en: string | null; coefficient: number }[];
  rows: StandingRow[];
}

export interface ExamOverview {
  exam_count: number;
  upcoming_count: number;
  graded_results: number;
  average_pct: number | null;
  pass_rate: number | null;
  attendance_rate: number | null;
  speciality_count: number;
  specialities: SpecialitySummary[];
  recent: Exam[];
  upcoming: Exam[];
  by_lecture: { lecture_id: number; lecture_name_ar: string; lecture_name_en: string | null; exam_count: number; average_pct: number | null }[];
}

const client = axios.create({
  baseURL: `${API_BASE_URL}/exams`,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
});
// School-scoped: admins viewing a school send its school_id like the other school APIs.
setupInterceptors(client);

const listExams = async (params?: { lecture_id?: number; date_from?: string; date_to?: string }): Promise<Exam[]> =>
  (await client.get<Exam[]>('/', { params })).data;

const getOverview = async (): Promise<ExamOverview> => (await client.get<ExamOverview>('/overview')).data;

const listLectures = async (): Promise<ExamLecture[]> => (await client.get<ExamLecture[]>('/lectures')).data;

const getExam = async (id: number): Promise<ExamDetail> => (await client.get<ExamDetail>(`/${id}`)).data;

const createExam = async (payload: ExamPayload, includeStudents = true): Promise<ExamDetail> =>
  (await client.post<ExamDetail>('/', payload, { params: { include_students: includeStudents } })).data;

const updateExam = async (id: number, payload: ExamPayload): Promise<ExamDetail> =>
  (await client.put<ExamDetail>(`/${id}`, payload)).data;

/** Replaces the whole roster: students left out are removed from the exam. */
const saveResults = async (id: number, results: ExamResultPayload[]): Promise<ExamDetail> =>
  (await client.put<ExamDetail>(`/${id}/results`, { results })).data;

const deleteExam = async (id: number): Promise<void> => {
  await client.delete(`/${id}`);
};

const getStandings = async (specialityId: number): Promise<SpecialityStanding> =>
  (await client.get<SpecialityStanding>(`/specialities/${specialityId}/standings`)).data;

const examsAPI = { listExams, getOverview, listLectures, getExam, createExam, updateExam, saveResults, deleteExam, getStandings };

export default examsAPI;
