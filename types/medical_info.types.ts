// types/medical_info.types.ts
import { BaseModel } from './model.types';

export interface MedicalInfo extends BaseModel {
  studentId: number | string | null;
  bloodType: string | null;      // Type de groupe sanguin (ex: 'A+', 'O-')
  allergies: string | null;      // Liste ou description des allergies
  diseases: string | null;       // Maladies signalées
  diseasesCauses: string | null; // Causes ou détails sur les maladies
}

/**
 * Utilitaires de conversion (Équivalents de fromJson et toJson)
 * Sans types 'any' pour s'aligner sur les exigences strictes de validation
 */
export const MedicalInfoMapper = {
  fromJson(json: Record<string, unknown>): MedicalInfo {
    const studentId = json.student_id ?? json.studentId;
    const bloodType = json.blood_type ?? json.bloodType;
    const allergies = json.allergies;
    const diseases = json.diseases;
    const diseasesCauses = json.diseases_causes ?? json.diseasesCauses;

    return {
      studentId: (studentId as number | string) ?? null,
      bloodType: typeof bloodType === 'string' ? bloodType : null,
      allergies: typeof allergies === 'string' ? allergies : null,
      diseases: typeof diseases === 'string' ? diseases : null,
      diseasesCauses: typeof diseasesCauses === 'string' ? diseasesCauses : null,
      isComplete:
        studentId != null &&
        bloodType != null &&
        allergies != null &&
        diseases != null &&
        diseasesCauses != null
    };
  },

  toJson(medicalInfo: MedicalInfo): Record<string, unknown> {
    return {
      'student_id': medicalInfo.studentId,
      'blood_type': medicalInfo.bloodType,
      'allergies': medicalInfo.allergies,
      'diseases': medicalInfo.diseases,
      'diseases_causes': medicalInfo.diseasesCauses,
    };
  }
};