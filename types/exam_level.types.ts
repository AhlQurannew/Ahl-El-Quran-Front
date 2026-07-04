// types/exam_level.types.ts
import { BaseModel } from './model.types';

export interface ExamLevel extends BaseModel {
  examLevelId: number | string | null;
  level: number | string | null;       // Le niveau de l'examen
  fromSurah: number | string | null;   // Sourate de début
  fromAyah: number | string | null;    // Verset de début
  toSurah: number | string | null;     // Sourate de fin
  toAyah: number | string | null;      // Verset de fin
}

/**
 * Utilitaires de conversion pour le modèle ExamLevel
 */
export const ExamLevelMapper = {
  fromJson(json: Record<string, unknown>): ExamLevel {
    const examLevelId = json.exam_level_id;
    const level = json.level;
    const fromSurah = json.from_surah;
    const fromAyah = json.from_ayah;
    const toSurah = json.to_surah;
    const toAyah = json.to_ayah;

    return {
      // On accepte string ou number pour les IDs et les références de sourates/versets
      examLevelId: (examLevelId as number | string) ?? null,
      level: (level as number | string) ?? null,
      fromSurah: (fromSurah as number | string) ?? null,
      fromAyah: (fromAyah as number | string) ?? null,
      toSurah: (toSurah as number | string) ?? null,
      toAyah: (toAyah as number | string) ?? null,

      // L'objet est complet uniquement si toutes les bornes de l'examen sont définies
      isComplete:
        examLevelId != null &&
        level != null &&
        fromSurah != null &&
        fromAyah != null &&
        toSurah != null &&
        toAyah != null,
    };
  },

  toJson(examLevel: ExamLevel): Record<string, unknown> {
    return {
      'exam_level_id': examLevel.examLevelId,
      'level': examLevel.level,
      'from_surah': examLevel.fromSurah,
      'from_ayah': examLevel.fromAyah,
      'to_surah': examLevel.toSurah,
      'to_ayah': examLevel.toAyah,
    };
  },
};