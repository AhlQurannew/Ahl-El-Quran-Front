// types/team_accomplishment.types.ts
import { BaseModel } from './model.types';

export interface TeamAccomplishment extends BaseModel {
  teamAccomplishmentId: number | string | null;
  fromSurah: number | string | null;
  fromAyah: number | string | null;
  toSurah: number | string | null;
  toAyah: number | string | null;
  accompanyingCurriculumSubject: string | null; // Matière du programme d'accompagnement
  accompanyingCurriculumLesson: string | null;  // Leçon associée
  tajweedLesson: string | null;                 // Règle ou cours de Tajweed
}

/**
 * Utilitaires de conversion pour TeamAccomplishment
 */
export const TeamAccomplishmentMapper = {
  fromJson(json: Record<string, unknown>): TeamAccomplishment {
    const teamAccomplishmentId = json.team_accomplishment_id;
    const fromSurah = json.from_surah;
    const fromAyah = json.from_ayah;
    const toSurah = json.to_surah;
    const toAyah = json.to_ayah;
    const accompanyingCurriculumSubject = json.accompanying_curriculum_subject;
    const accompanyingCurriculumLesson = json.accompanying_curriculum_lesson;
    const tajweedLesson = json.tajweed_lesson;

    return {
      teamAccomplishmentId: (teamAccomplishmentId as number | string) ?? null,
      fromSurah: (fromSurah as number | string) ?? null,
      fromAyah: (fromAyah as number | string) ?? null,
      toSurah: (toSurah as number | string) ?? null,
      toAyah: (toAyah as number | string) ?? null,
      accompanyingCurriculumSubject: typeof accompanyingCurriculumSubject === 'string' ? accompanyingCurriculumSubject : null,
      accompanyingCurriculumLesson: typeof accompanyingCurriculumLesson === 'string' ? accompanyingCurriculumLesson : null,
      tajweedLesson: typeof tajweedLesson === 'string' ? tajweedLesson : null,
      
      // Validation selon la logique Dart : l'identifiant et la plage de lecture (Sourates/Ayats) doivent être non nuls
      isComplete:
        teamAccomplishmentId != null &&
        fromSurah != null &&
        fromAyah != null &&
        toSurah != null &&
        toAyah != null
    };
  },

  toJson(accomplishment: TeamAccomplishment): Record<string, unknown> {
    return {
      'team_accomplishment_id': accomplishment.teamAccomplishmentId,
      'from_surah': accomplishment.fromSurah,
      'from_ayah': accomplishment.fromAyah,
      'to_surah': accomplishment.toSurah,
      'to_ayah': accomplishment.toAyah,
      'accompanying_curriculum_subject': accomplishment.accompanyingCurriculumSubject,
      'accompanying_curriculum_lesson': accomplishment.accompanyingCurriculumLesson,
      'tajweed_lesson': accomplishment.tajweedLesson,
    };
  }
};