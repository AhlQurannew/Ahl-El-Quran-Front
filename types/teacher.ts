export interface Teacher {
  id: string;
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  riwaya: string;
  hire_date: string; // date-time format
  is_active: boolean;
  registration_number?: string | null;
  speciality?: string | null;
  date_of_birth?: string | null;
  place_of_birth?: string | null;
  phone_number?: string | null;
  address?: string | null;
  medical_condition?: string | null;
}

/** Optional teacher profile fields shared by create and update payloads. */
export interface TeacherProfileFields {
  registration_number?: string;
  speciality?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  phone_number?: string;
  address?: string;
  medical_condition?: string;
}

export interface TeacherList {
  teachers: Teacher[];
  total: number;
}

export interface TeacherCreatePayload extends TeacherProfileFields {
  firstname: string;
  lastname: string;
  email: string;
  riwaya: string;
  password: string;
}
