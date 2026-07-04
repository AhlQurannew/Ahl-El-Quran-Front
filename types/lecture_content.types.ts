// types/lecture_content.types.ts
import { BaseModel } from './model.types';

export interface LectureContent extends BaseModel {
  id: number | string | null;
  fromSurah: number | string | null;
  fromAyah: number | string | null;
  toSurah: number | string | null;
  toAyah: number | string | null;
  observation: string | null;
  studentId: number | string | null;
  lectureId: number | string | null;
  type: string | number | null; // Représente le type de récitation ou d'activité
}

/**
 * Utilitaires de conversion pour le modèle LectureContent
 */
export const LectureContentMapper = {
  fromJson(json: Record<string, unknown>): LectureContent {
    const id = json.id;
    const fromSurah = json.from_surah;
    const fromAyah = json.from_ayah;
    const toSurah = json.to_surah;
    const toAyah = json.to_ayah;
    const observation = json.observation;
    const studentId = json.student_id;
    const lectureId = json.lecture_id;
    const type = json.type;

    return {
      id: (id as number | string) ?? null,
      fromSurah: (fromSurah as number | string) ?? null,
      fromAyah: (fromAyah as number | string) ?? null,
      toSurah: (toSurah as number | string) ?? null,
      toAyah: (toAyah as number | string) ?? null,
      observation: typeof observation === 'string' ? observation : null,
      studentId: (studentId as number | string) ?? null,
      lectureId: (lectureId as number | string) ?? null,
      type: (type as string | number) ?? null,
      
      // Validation calquée sur la logique Dart : id et observation restent optionnels
      isComplete:
        fromSurah != null &&
        fromAyah != null &&
        toSurah != null &&
        toAyah != null &&
        studentId != null &&
        lectureId != null &&
        type != null
    };
  },

  toJson(content: LectureContent): Record<string, unknown> {
    return {
      'id': content.id,
      'from_surah': content.fromSurah,
      'from_ayah': content.fromAyah,
      'to_surah': content.toSurah,
      'to_ayah': content.toAyah,
      'observation': content.observation,
      'student_id': content.studentId,
      'lecture_id': content.lectureId,
      'type': content.type,
    };
  }
};