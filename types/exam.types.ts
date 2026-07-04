// types/exam.types.ts
import { BaseModel } from './model.types';

export interface Exam extends BaseModel {
  examId: number | string | null;
  examLevelId: number | string | null;
  examNameAr: string | null;
  examNameEn: string | null;
  examType: string | null;
  examSucessMinPoint: number | null; // Note minimale de réussite
  examMaxPoint: number | null;       // Note maximale
  examMemoPoint: number | null;      // Points alloués à la mémorisation (Hifz)
  examTjwidAppPoint: number | null;  // Points pour l'application du Tajwid
  examTjwidThoPoint: number | null;  // Points pour la théorie du Tajwid
  examPerformancePoint: number | null; // Points pour l'attitude/performance globale
}

/**
 * Utilitaires de conversion pour le modèle Exam
 */
export const ExamMapper = {
  fromJson(json: Record<string, unknown>): Exam {
    const examId = json.exam_id;
    const examLevelId = json.exam_level_id;
    const examNameAr = json.exam_name_ar;
    const examNameEn = json.exam_name_en;
    const examType = json.exam_type;
    const examSucessMinPoint = json.exam_sucess_min_point;
    const examMaxPoint = json.exam_max_point;
    const examMemoPoint = json.exam_memo_point;
    const examTjwidAppPoint = json.exam_tjwid_app_point;
    const examTjwidThoPoint = json.exam_tjwid_tho_point;
    const examPerformancePoint = json.exam_performance_point;

    return {
      examId: (examId as number | string) ?? null,
      examLevelId: (examLevelId as number | string) ?? null,
      examNameAr: typeof examNameAr === 'string' ? examNameAr : null,
      examNameEn: typeof examNameEn === 'string' ? examNameEn : null,
      examType: typeof examType === 'string' ? examType : null,
      examSucessMinPoint: typeof examSucessMinPoint === 'number' ? examSucessMinPoint : null,
      examMaxPoint: typeof examMaxPoint === 'number' ? examMaxPoint : null,
      examMemoPoint: typeof examMemoPoint === 'number' ? examMemoPoint : null,
      examTjwidAppPoint: typeof examTjwidAppPoint === 'number' ? examTjwidAppPoint : null,
      examTjwidThoPoint: typeof examTjwidThoPoint === 'number' ? examTjwidThoPoint : null,
      examPerformancePoint: typeof examPerformancePoint === 'number' ? examPerformancePoint : null,

      // Calqué sur Dart : complet si toutes les métadonnées et points sont définis (IDs optionnels)
      isComplete:
        examNameAr != null &&
        examNameEn != null &&
        examType != null &&
        examSucessMinPoint != null &&
        examMaxPoint != null &&
        examMemoPoint != null &&
        examTjwidAppPoint != null &&
        examTjwidThoPoint != null &&
        examPerformancePoint != null
    };
  },

  toJson(exam: Exam): Record<string, unknown> {
    return {
      'exam_id': exam.examId,
      'exam_level_id': exam.examLevelId,
      'exam_name_ar': exam.examNameAr,
      'exam_name_en': exam.examNameEn,
      'exam_type': exam.examType,
      'exam_sucess_min_point': exam.examSucessMinPoint,
      'exam_max_point': exam.examMaxPoint,
      'exam_memo_point': exam.examMemoPoint,
      'exam_tjwid_app_point': exam.examTjwidAppPoint,
      'exam_tjwid_tho_point': exam.examTjwidThoPoint,
      'exam_performance_point': exam.examPerformancePoint,
    };
  },

  /**
   * Équivalent du toString() personnalisé en Dart
   */
  toString(exam: Exam): string {
    return `${exam.examNameEn ?? ''} - ${exam.examNameAr ?? ''}`;
  }
};