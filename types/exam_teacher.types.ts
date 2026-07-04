// types/exam_teacher.types.ts
import { BaseModel } from './model.types';

export interface ExamTeacher extends BaseModel {
  examId: number | string | null;
  teacherId: number | string | null;
  date: string | null; // Format date (YYYY-MM-DD ou ISO string)
}

/**
 * Utilitaires de conversion pour le modèle ExamTeacher
 */
export const ExamTeacherMapper = {
  fromJson(json: Record<string, unknown>): ExamTeacher {
    const examId = json.exam_id;
    const teacherId = json.teacher_id;
    const date = json.date;

    return {
      examId: (examId as number | string) ?? null,
      teacherId: (teacherId as number | string) ?? null,
      date: typeof date === 'string' ? date : null,

      // Complet si les deux identifiants et la date sont fournis
      isComplete: examId != null && teacherId != null && date != null,
    };
  },

  toJson(examTeacher: ExamTeacher): Record<string, unknown> {
    return {
      'exam_id': examTeacher.examId,
      'teacher_id': examTeacher.teacherId,
      'date': examTeacher.date,
    };
  },
};