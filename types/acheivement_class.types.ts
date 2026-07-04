// types/acheivement_class.types.ts
import { BaseModel } from './model.types';

export interface AcheivementClass extends BaseModel {
  studentId: number;
  studentName: string;
}

/**
 * Utilitaires de conversion et accesseurs pour le modèle Acheivement
 */
export const AcheivementClassMapper = {
  fromJson(json: Record<string, unknown>): AcheivementClass {
    const studentId = json.student_id;
    const studentName = json.full_name;

    return {
      studentId: typeof studentId === 'number' ? studentId : 0,
      studentName: typeof studentName === 'string' ? studentName : '',

      // Correspond exactement au getter "isComplete => studentID != 0 && studentName.isNotEmpty"
      isComplete: typeof studentId === 'number' && studentId !== 0 && typeof studentName === 'string' && studentName.trim() !== '',
    };
  },

  toJson(acheivement: AcheivementClass): Record<string, unknown> {
    return {
      'student_id': acheivement.studentId,
      'full_name': acheivement.studentName,
    };
  },

  /**
   * Équivalent de getId()
   */
  getId(acheivement: AcheivementClass): number {
    return acheivement.studentId;
  },

  /**
   * Équivalent de getStudentName()
   */
  getStudentName(acheivement: AcheivementClass): string {
    return acheivement.studentName;
  },
};