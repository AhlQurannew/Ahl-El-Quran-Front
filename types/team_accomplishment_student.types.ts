// types/team_accomplishment_student.types.ts
import { BaseModel } from './model.types';

export interface TeamAccomplishmentStudent extends BaseModel {
  teamAccomplishmentId: number | string | null;
  studentId: number | string | null;
}

/**
 * Utilitaires de conversion pour TeamAccomplishmentStudent
 */
export const TeamAccomplishmentStudentMapper = {
  fromJson(json: Record<string, unknown>): TeamAccomplishmentStudent {
    const teamAccomplishmentId = json.team_accomplishment_id;
    const studentId = json.student_id;

    return {
      teamAccomplishmentId: (teamAccomplishmentId as number | string) ?? null,
      studentId: (studentId as number | string) ?? null,
      // Complet uniquement si les deux identifiants de la relation sont fournis
      isComplete: teamAccomplishmentId != null && studentId != null
    };
  },

  toJson(relation: TeamAccomplishmentStudent): Record<string, unknown> {
    return {
      'team_accomplishment_id': relation.teamAccomplishmentId,
      'student_id': relation.studentId,
    };
  }
};