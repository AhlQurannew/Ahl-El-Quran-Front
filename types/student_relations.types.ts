// types/student_relations.types.ts
import { BaseModel } from './model.types';

export interface StudentRelations extends BaseModel {
  studentId: number | string | null;
  guardianId: number | string | null;
  studentContactId: number | string | null;
  studentAccountId: number | string | null;
}

/**
 * Utilitaires de conversion pour StudentRelations
 * Garanti sans 'any' pour valider proprement l'arbre des relations de l'étudiant
 */
export const StudentRelationsMapper = {
  fromJson(json: Record<string, unknown>): StudentRelations {
    const studentId = json.student_id ?? json.studentId;
    const guardianId = json.guardian_id ?? json.guardianId;
    const studentContactId = json.student_contact_id ?? json.studentContactId;
    const studentAccountId = json.student_account_id ?? json.studentAccountId;

    return {
      studentId: (studentId as number | string) ?? null,
      guardianId: (guardianId as number | string) ?? null,
      studentContactId: (studentContactId as number | string) ?? null,
      studentAccountId: (studentAccountId as number | string) ?? null,
      isComplete:
        studentId != null &&
        guardianId != null &&
        studentContactId != null &&
        studentAccountId != null
    };
  },

  toJson(relations: StudentRelations): Record<string, unknown> {
    return {
      'student_id': relations.studentId,
      'guardian_id': relations.guardianId,
      'student_contact_id': relations.studentContactId,
      'student_account_id': relations.studentAccountId,
    };
  }
};