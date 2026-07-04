// types/lecture_teacher.types.ts
import { BaseModel } from './model.types';

export interface LectureTeacher extends BaseModel {
  teacherId: number | string | null;
  lectureId: number | string | null;
  lectureDate: string | null;                // Date de la leçon (format ISO ou texte)
  attendanceStatus: string | number | null; // Statut de présence de l'enseignant
}

/**
 * Utilitaires de conversion (Équivalents de fromJson et toJson)
 * Respecte les règles strictes de typage du projet
 */
export const LectureTeacherMapper = {
  fromJson(json: Record<string, unknown>): LectureTeacher {
    const teacherId = json.teacher_id ?? json.teacherId;
    const lectureId = json.lecture_id ?? json.lectureId;
    const lectureDate = json.lecture_date ?? json.lectureDate;
    const attendanceStatus = json.attendance_status ?? json.attendanceStatus;

    return {
      teacherId: (teacherId as number | string) ?? null,
      lectureId: (lectureId as number | string) ?? null,
      lectureDate: typeof lectureDate === 'string' ? lectureDate : null,
      attendanceStatus: (attendanceStatus as string | number) ?? null,
      isComplete:
        teacherId != null &&
        lectureId != null &&
        lectureDate != null &&
        attendanceStatus != null
    };
  },

  toJson(lectureTeacher: LectureTeacher): Record<string, unknown> {
    return {
      'teacher_id': lectureTeacher.teacherId,
      'lecture_id': lectureTeacher.lectureId,
      'lecture_date': lectureTeacher.lectureDate,
      'attendance_status': lectureTeacher.attendanceStatus,
    };
  }
};