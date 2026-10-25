export interface GuardianStudent {
  id: number;
  firstName: string;
  lastName: string;
  username: string | null;
}

export interface Guardian {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  email: string | null;
  job: string | null;
  address: string | null;
  username: string;
  studentIds: number[];
  students: GuardianStudent[];
  isActive: boolean;
}

export interface GuardianStudentOption {
  id: number;
  firstName: string;
  lastName: string;
  username: string | null;
}

export interface GuardianApiResponse {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  relationship_to_student: string;
  date_of_birth: string | null;
  phone_number: string | null;
  email: string | null;
  job: string | null;
  address: string | null;
  username: string | null;
  student_id: number | null;
  student_ids: number[];
  students: Array<{
    id: number;
    first_name: string;
    last_name: string;
    username: string | null;
  }>;
  is_active: boolean;
}

export interface GuardianListApiResponse {
  guardians: GuardianApiResponse[];
  total: number;
}

export interface GuardianStudentsApiResponse {
  students: Array<{
    id: number;
    first_name: string;
    last_name: string;
    username: string | null;
  }>;
  total: number;
}

export const mapGuardianResponse = (guardian: GuardianApiResponse): Guardian => ({
  id: guardian.id,
  userId: guardian.user_id,
  firstName: guardian.first_name,
  lastName: guardian.last_name,
  relationship: guardian.relationship_to_student,
  dateOfBirth: guardian.date_of_birth,
  phoneNumber: guardian.phone_number,
  email: guardian.email,
  job: guardian.job,
  address: guardian.address,
  username: guardian.username ?? '',
  studentIds: guardian.student_ids ?? guardian.students?.map((student) => student.id) ??
    (guardian.student_id ? [guardian.student_id] : []),
  students: (guardian.students ?? []).map((student) => ({
    id: student.id,
    firstName: student.first_name,
    lastName: student.last_name,
    username: student.username,
  })),
  isActive: guardian.is_active,
});
