// types/achievement.types.ts
import { BaseModel } from './model.types';
import { getSurahByNumber } from '../data/quran_data';

export type AchievementType = 'normal' | 'small' | 'big';

export interface Achievement extends BaseModel {
  id: number | null;
  studentId: number;
  fromSurah: number;  // Numéro de la sourate
  toSurah: number;    // Numéro de la sourate
  fromVerse: number;  // Numéro du verset
  toVerse: number;    // Numéro du verset
  note: string | null;
  achievementType: AchievementType | string; // "normal", "small", "big"
  date: string;       // Format: DD-MM-YYYY
  createdAt: string | null; // ISO String
  updatedAt: string | null; // ISO String
}

/**
 * Utilitaires de conversion et d'affichage pour le modèle Achievement
 */
export const AchievementMapper = {
  fromJson(json: Record<string, unknown>): Achievement {
    const id = json.id;
    const studentId = json.student_id;
    const fromSurah = json.from_surah;
    const toSurah = json.to_surah;
    const fromVerse = json.from_verse;
    const toVerse = json.to_verse;
    const note = json.note;
    const achievementType = json.achievement_type;
    const date = json.date;
    const createdAt = json.created_at;
    const updatedAt = json.updated_at;

    return {
      id: typeof id === 'number' ? id : null,
      studentId: typeof studentId === 'number' ? studentId : 0,
      fromSurah: typeof fromSurah === 'number' ? fromSurah : 0,
      toSurah: typeof toSurah === 'number' ? toSurah : 0,
      fromVerse: typeof fromVerse === 'number' ? fromVerse : 0,
      toVerse: typeof toVerse === 'number' ? toVerse : 0,
      note: typeof note === 'string' ? note : null,
      achievementType: typeof achievementType === 'string' ? achievementType : 'normal',
      date: typeof date === 'string' ? date : '',
      createdAt: typeof createdAt === 'string' ? new Date(createdAt).toISOString() : null,
      updatedAt: typeof updatedAt === 'string' ? new Date(updatedAt).toISOString() : null,

      // Validation stricte sur les champs indispensables requis par le constructeur Dart
      isComplete:
        typeof studentId === 'number' &&
        typeof fromSurah === 'number' &&
        typeof toSurah === 'number' &&
        typeof fromVerse === 'number' &&
        typeof toVerse === 'number' &&
        typeof date === 'string'
    };
  },

  toJson(achievement: Achievement): Record<string, unknown> {
    const json: Record<string, unknown> = {
      'student_id': achievement.studentId,
      'from_surah': achievement.fromSurah,
      'to_surah': achievement.toSurah,
      'from_verse': achievement.fromVerse,
      'to_verse': achievement.toVerse,
      'note': achievement.note,
      'achievement_type': achievement.achievementType,
      'date': achievement.date,
    };

    if (achievement.id != null) json['id'] = achievement.id;
    if (achievement.createdAt != null) json['created_at'] = achievement.createdAt;
    if (achievement.updatedAt != null) json['updated_at'] = achievement.updatedAt;

    return json;
  },

  /**
   * Équivalent de getAchievementTypeArabic()
   */
  getAchievementTypeArabic(type: string): string {
    switch (type) {
      case 'normal':
        return 'حفظ';
      case 'small':
        return 'مراجعة صغيرة';
      case 'big':
        return 'مراجعة كبيرة';
      default:
        return type;
    }
  },

  /**
   * Équivalent de getFromSurahName()
   * Passe en paramètre ta fonction ou ton dictionnaire issu de quran_data.ts
   */
  getFromSurahName(fromSurah: number, getSurahByNumber: (num: number) => { name: string } | null): string {
    const surah = getSurahByNumber(fromSurah);
    return surah?.name ?? `سورة ${fromSurah}`;
  },

  /**
   * Équivalent de getToSurahName()
   */
  getToSurahName(toSurah: number, getSurahByNumber: (num: number) => { name: string } | null): string {
    const surah = getSurahByNumber(toSurah);
    return surah?.name ?? `سورة ${toSurah}`;
  },

  /**
   * Équivalent de copyWith()
   */
  copyWith(achievement: Achievement, updates: Partial<Omit<Achievement, 'isComplete'>>): Achievement {
    const updated = {
      ...achievement,
      ...updates,
    };

    updated.isComplete =
      typeof updated.studentId === 'number' &&
      typeof updated.fromSurah === 'number' &&
      typeof updated.toSurah === 'number' &&
      typeof updated.fromVerse === 'number' &&
      typeof updated.toVerse === 'number' &&
      typeof updated.date === 'string';

    return updated;
  },
};