export interface Student {
  id: string;
  firstName: string; // الاسم
  lastName: string; // الكنية
  gender: 'male' | 'female'; // الجنس
  halqa?: string; // الحلقات (lecture name)
  halqaId?: number; // الحلقات (lecture ID)
  guardianId?: number; // ولي الأمر المرتبط
  guardianName?: string;
  guardianEmail?: string;
  username: string; // اسم المستخدم
  dob: string; // تاريخ الميلاد
  pob: string; // مكان الميلاد
  nationality: string; // الجنسية
  idType?: string; // نوع الهوية
  photo?: string;
  /** Unique school ID, e.g. S2026-0001 (generated, editable). */
  registrationNumber?: string;
  /** internal = داخلي, external = خارجي (part-time) */
  enrollmentType?: 'internal' | 'external' | '';
  startYear?: number | '';
  medicalCondition?: string;
  /** Speciality (تخصص): the student is enrolled in all of its circles. */
  specialityId?: number;
  /** Display name of the speciality (filled by the students page). */
  specialityName?: string;
  /** Names of every circle the student is enrolled in. */
  lectureNames?: string[];
}
