// types/golden_record.types.ts
import { BaseModel } from './model.types';

export interface GoldenRecord extends BaseModel {
  goldenRecordId: number | string | null;
  studentId: number | string | null;
  recordType: string | null;        // Type de distinction ou niveau d'accomplissement
  riwayah: string | null;           // La variante de lecture (ex: Warsh, Hafs...)
  dateOfCompletion: string | null;  // Format date (YYYY-MM-DD)
  schoolName: string | null;
}

/**
 * Utilitaires de conversion pour le modèle GoldenRecord
 */
export const GoldenRecordMapper = {
  fromJson(json: Record<string, unknown>): GoldenRecord {
    const goldenRecordId = json.golden_record_id;
    const studentId = json.student_id;
    const recordType = json.record_type;
    const riwayah = json.riwayah;
    const dateOfCompletion = json.date_of_completion;
    const schoolName = json.school_name;

    return {
      goldenRecordId: (goldenRecordId as number | string) ?? null,
      studentId: (studentId as number | string) ?? null,
      recordType: typeof recordType === 'string' ? recordType : null,
      riwayah: typeof riwayah === 'string' ? riwayah : null,
      dateOfCompletion: typeof dateOfCompletion === 'string' ? dateOfCompletion : null,
      schoolName: typeof schoolName === 'string' ? schoolName : null,
      
      // Validation stricte : tous les champs doivent être présents pour que le record soit complet
      isComplete:
        goldenRecordId != null &&
        studentId != null &&
        recordType != null &&
        riwayah != null &&
        dateOfCompletion != null &&
        schoolName != null
    };
  },

  toJson(record: GoldenRecord): Record<string, unknown> {
    return {
      'golden_record_id': record.goldenRecordId,
      'student_id': record.studentId,
      'record_type': record.recordType,
      'riwayah': record.riwayah,
      'date_of_completion': record.dateOfCompletion,
      'school_name': record.schoolName,
    };
  }
};