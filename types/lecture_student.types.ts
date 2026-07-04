// types/lecture_student.types.ts
import { BaseModel } from './model.types';

export interface LectureStudent extends BaseModel {
  lectureId: number | string | null;
  studentId: number | string | null;
  attendanceStatus: string | number | null; // Statut de présence (ex: 'présent', 'absent')
  lectureDate: string | null;                // Date de la leçon (souvent une chaîne ISO ou formatée)
}

/**
 * Utilitaires de conversion (Équivalents de fromJson et toJson)
 * Conçus sans 'any' pour valider proprement les données du backend
 */
export const LectureStudentMapper = {
  fromJson(json: Record<string, unknown>): LectureStudent {
    const lectureId = json.lecture_id ?? json.lectureId;
    const studentId = json.student_id ?? json.studentId;
    const attendanceStatus = json.attendance_status ?? json.attendanceStatus;
    const lectureDate = json.lecture_date ?? json.lectureDate;

    return {
      lectureId: (lectureId as number | string) ?? null,
      studentId: (studentId as number | string) ?? null,
      attendanceStatus: (attendanceStatus as string | number) ?? null,
      lectureDate: typeof lectureDate === 'string' ? lectureDate : null,
      isComplete:
        lectureId != null &&
        studentId != null &&
        attendanceStatus != null &&
        lectureDate != null
    };
  },

  toJson(lectureStudent: LectureStudent): Record<string, unknown> {
    return {
      'lecture_id': lectureStudent.lectureId,
      'student_id': lectureStudent.studentId,
      'attendance_status': lectureStudent.attendanceStatus,
      'lecture_date': lectureStudent.lectureDate,
    };
  }
};