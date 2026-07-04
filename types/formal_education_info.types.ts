// types/formal_education_info.types.ts
import { BaseModel } from './model.types';

export interface FormalEducationInfo extends BaseModel {
  studentId: number | string | null;
  schoolName: string | null;
  schoolType: string | null; // ex: Primaire, CEM, Lycée...
  grade: string | number | null; // La classe ou l'année d'étude
  academicLevel: string | null;
}

/**
 * Utilitaires de conversion pour le modèle FormalEducationInfo
 */
export const FormalEducationInfoMapper = {
  fromJson(json: Record<string, unknown>): FormalEducationInfo {
    // Application des fallbacks camelCase / snake_case du modèle Dart
    const studentId = json.studentId ?? json.student_id;
    const schoolName = json.schoolName ?? json.school_name;
    const schoolType = json.schoolType ?? json.school_type;
    const grade = json.grade;
    const academicLevel = json.academicLevel ?? json.academic_level;

    return {
      studentId: (studentId as number | string) ?? null,
      schoolName: typeof schoolName === 'string' ? schoolName : null,
      schoolType: typeof schoolType === 'string' ? schoolType : null,
      grade: (grade as string | number) ?? null,
      academicLevel: typeof academicLevel === 'string' ? academicLevel : null,
      
      // Validation stricte : toutes les propriétés doivent être non nulles
      isComplete:
        studentId != null &&
        schoolName != null &&
        schoolType != null &&
        grade != null &&
        academicLevel != null
    };
  },

  /**
   * Export sélectif selon la structure stricte définie dans le toJson() Dart
   */
  toJson(info: FormalEducationInfo): Record<string, unknown> {
    return {
      'school_name': info.schoolName,
      'grade': info.grade,
      'academic_level': info.academicLevel,
    };
  }
};