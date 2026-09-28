export interface Teacher {
  id: string;
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  riwaya: string;
  hire_date: string; // date-time format
  is_active: boolean;
}

export interface TeacherList {
  teachers: Teacher[];
  total: number;
}

export interface TeacherCreatePayload {
  firstname: string;
  lastname: string;
  email: string;
  riwaya: string;
  password: string;
}
