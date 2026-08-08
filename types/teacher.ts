export interface Teacher {
  id: string;
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  ruaya: string;
  hire_date: string; // date-time format
  is_active: boolean;
}

export interface TeacherList {
  teachers: Teacher[];
  total: number;
}
