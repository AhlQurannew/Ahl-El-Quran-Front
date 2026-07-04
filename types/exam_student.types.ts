// types/exam_student.types.ts
import { BaseModel } from './model.types';

export interface ExamStudent extends BaseModel {
  examId: number | string | null;
  studentId: number | string | null;
  appreciationId: number | string | null; // ID de l'appréciation globale
  pointHifd: number | null;               // Note de mémorisation (Hifz)
  pointTajwidApplicative: number | null;  // Note de Tajwid pratique
  pointTajwidTheoric: number | null;      // Note de Tajwid théorique
  pointPerformance: number | null;         // Note de performance/attitude
  pointDeductionTal: number | null;       // Déductions pour fautes majeures/mineures (Tal)
  pointDeductionTanbihi: number | null;   // Déductions pour avertissements/hésitations
  pointDeductionTajwidi: number | null;   // Déductions spécifiques au Tajwid
  dateTakeExam: string | null;            // Date de passage de l'examen
}

/**
 * Utilitaires de conversion pour le modèle ExamStudent
 */
export const ExamStudentMapper = {
  fromJson(json: Record<string, unknown>): ExamStudent {
    const examId = json.exam_id;
    const studentId = json.student_id;
    const appreciationId = json.appreciation_id;
    const pointHifd = json.point_hifd;
    const pointTajwidApplicative = json.point_tajwid_applicative;
    const pointTajwidTheoric = json.point_tajwid_theoric;
    const pointPerformance = json.point_performance;
    const pointDeductionTal = json.point_deduction_tal;
    const pointDeductionTanbihi = json.point_deduction_tanbihi;
    const pointDeductionTajwidi = json.point_deduction_tajwidi;
    const dateTakeExam = json.date_take_exam;

    return {
      examId: (examId as number | string) ?? null,
      studentId: (studentId as number | string) ?? null,
      appreciationId: (appreciationId as number | string) ?? null,
      pointHifd: typeof pointHifd === 'number' ? pointHifd : null,
      pointTajwidApplicative: typeof pointTajwidApplicative === 'number' ? pointTajwidApplicative : null,
      pointTajwidTheoric: typeof pointTajwidTheoric === 'number' ? pointTajwidTheoric : null,
      pointPerformance: typeof pointPerformance === 'number' ? pointPerformance : null,
      pointDeductionTal: typeof pointDeductionTal === 'number' ? pointDeductionTal : null,
      pointDeductionTanbihi: typeof pointDeductionTanbihi === 'number' ? pointDeductionTanbihi : null,
      pointDeductionTajwidi: typeof pointDeductionTajwidi === 'number' ? pointDeductionTajwidi : null,
      dateTakeExam: typeof dateTakeExam === 'string' ? dateTakeExam : null,

      // Tous les champs doivent être renseignés pour que la fiche d'examen soit complète
      isComplete:
        examId != null &&
        studentId != null &&
        appreciationId != null &&
        pointHifd != null &&
        pointTajwidApplicative != null &&
        pointTajwidTheoric != null &&
        pointPerformance != null &&
        pointDeductionTal != null &&
        pointDeductionTanbihi != null &&
        pointDeductionTajwidi != null &&
        dateTakeExam != null,
    };
  },

  toJson(examStudent: ExamStudent): Record<string, unknown> {
    return {
      'exam_id': examStudent.examId,
      'student_id': examStudent.studentId,
      'appreciation_id': examStudent.appreciationId,
      'point_hifd': examStudent.pointHifd,
      'point_tajwid_applicative': examStudent.pointTajwidApplicative,
      'point_tajwid_theoric': examStudent.pointTajwidTheoric,
      'point_performance': examStudent.pointPerformance,
      'point_deduction_tal': examStudent.pointDeductionTal,
      'point_deduction_tanbihi': examStudent.pointDeductionTanbihi,
      'point_deduction_tajwidi': examStudent.pointDeductionTajwidi,
      'date_take_exam': examStudent.dateTakeExam,
    };
  },
};