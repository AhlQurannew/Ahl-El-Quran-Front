// types/lecture.types.ts
import { BaseModel } from './model.types';

export interface Lecture extends BaseModel {
  lectureId: number | string | null;
  teamAccomplishmentId: number | string | null;
  lectureNameAr: string;
  lectureNameEn: string;
  shownOnWebsite: boolean;
  circleType: string;
  category: string;
}

/**
 * Utilitaires de conversion (Équivalents de fromJson et toJson)
 * Remplacement de 'any' par 'Record<string, unknown>' pour respecter les règles du projet
 */
export const LectureMapper = {
  fromJson(json: Record<string, unknown>): Lecture {
    const lectureId = json.lectureId ?? json.lecture_id;
    const teamAccomplishmentId = json.teamAccomplishmentId ?? json.team_accomplishment_id;
    const lectureNameAr = json.lectureNameAr ?? json.lecture_name_ar;
    const lectureNameEn = json.lectureNameEn ?? json.lecture_name_en;
    const shownOnWebsite = json.shownOnWebsite ?? json.shown_on_website;
    const circleType = json.circleType ?? json.circle_type;
    const category = json.category;

    return {
      lectureId: (lectureId as number | string) ?? null,
      teamAccomplishmentId: (teamAccomplishmentId as number | string) ?? null,
      lectureNameAr: typeof lectureNameAr === 'string' ? lectureNameAr : '',
      lectureNameEn: typeof lectureNameEn === 'string' ? lectureNameEn : '',
      shownOnWebsite: shownOnWebsite === 1 || shownOnWebsite === true,
      circleType: typeof circleType === 'string' ? circleType : '',
      category: typeof category === 'string' ? category : '',
      isComplete: 
        lectureId != null &&
        teamAccomplishmentId != null &&
        typeof lectureNameAr === 'string' && lectureNameAr.trim() !== '' &&
        typeof lectureNameEn === 'string' && lectureNameEn.trim() !== '' &&
        typeof circleType === 'string' && circleType.trim() !== ''
    };
  },

  toJson(lecture: Lecture): Record<string, unknown> {
    return {
      'lecture_id': lecture.lectureId,
      'team_accomplishment_id': lecture.teamAccomplishmentId,
      'lecture_name_ar': lecture.lectureNameAr,
      'lecture_name_en': lecture.lectureNameEn,
      'shown_on_website': lecture.shownOnWebsite ? 1 : 0,
      'circle_type': lecture.circleType,
      'category': lecture.category,
    };
  }
};