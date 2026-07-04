// types/student_lecture_achievement.types.ts
import { BaseModel } from './model.types';

export interface StudentLectureAchievements extends BaseModel {
  lectureId: number | string | null;
  studentId: number | string | null;
  achievementType: string | null; // Type d'accomplissement (ex: Hifz, Murajaa)
  lectureDate: string | null;
  fromSurah: number | string | null;
  fromAyah: number | string | null;
  toSurah: number | string | null;
  toAyah: number | string | null;
  teacherNote: string | null;     // Note ou remarque de l'enseignant (optionnel)
}

/**
 * Utilitaires de conversion pour StudentLectureAchievements
 */
export const StudentLectureAchievementsMapper = {
  fromJson(json: Record<string, unknown>): StudentLectureAchievements {
    const lectureId = json.lecture_id ?? json.lectureId;
    const studentId = json.student_id ?? json.studentId;
    const achievementType = json.achievement_type ?? json.achievementType;
    const lectureDate = json.lecture_date ?? json.lectureDate;
    const fromSurah = json.from_surah ?? json.fromSurah;
    const fromAyah = json.from_ayah ?? json.fromAyah;
    const toSurah = json.to_surah ?? json.toSurah;
    const toAyah = json.to_ayha ?? json.toAyah; // Gère une éventuelle typo courante
    const teacherNote = json.teacher_note ?? json.teacherNote;

    return {
      lectureId: (lectureId as number | string) ?? null,
      studentId: (studentId as number | string) ?? null,
      achievementType: typeof achievementType === 'string' ? achievementType : null,
      lectureDate: typeof lectureDate === 'string' ? lectureDate : null,
      fromSurah: (fromSurah as number | string) ?? null,
      fromAyah: (fromAyah as number | string) ?? null,
      toSurah: (toSurah as number | string) ?? null,
      toAyah: (toAyah as number | string) ?? null,
      teacherNote: typeof teacherNote === 'string' ? teacherNote : null,
      isComplete:
        lectureId != null &&
        studentId != null &&
        achievementType != null &&
        lectureDate != null &&
        fromSurah != null &&
        fromAyah != null &&
        toSurah != null &&
        toAyah != null
    };
  },

  toJson(achievement: StudentLectureAchievements): Record<string, unknown> {
    return {
      'lecture_id': achievement.lectureId,
      'student_id': achievement.studentId,
      'achievement_type': achievement.achievementType,
      'lecture_date': achievement.lectureDate,
      'from_surah': achievement.fromSurah,
      'from_ayah': achievement.fromAyah,
      'to_surah': achievement.toSurah,
      'to_ayah': achievement.toAyah,
      'teacher_note': achievement.teacherNote,
    };
  }
};