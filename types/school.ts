export interface School {
  id: number;
  user_id: number;
  school_name: string;
  president_name: string;
  email: string;
  phone_number: string;
  student_count: number;
  teacher_count: number;
  supervisor_count: number;
  guardian_count: number;
  president_count: number;
  approval_date: string | null;
  created_at: string | null;
  is_active: boolean;
}

export interface SchoolsResponse {
  total: number;
  schools: School[];
}

export interface AdminStatistics {
  total_schools: number;
  total_presidents: number;
  pending_requests: number;
  performance: any;
}

export interface SchoolStatistics {
  school_name: string;
  student_count: number;
  president_name: string;
  percentage: number;
}

export interface SchoolsStatisticsResponse {
  total_students: number;
  schools: SchoolStatistics[];
}
