// types/personal_info.types.ts
import { BaseModel } from './model.types';

export interface PersonalInfo extends BaseModel {
  studentId: number | string | null;
  firstNameAr: string;
  lastNameAr: string;
  firstNameEn: string;
  lastNameEn: string;
  nationality: string | null;
  sex: string | null;
  dateOfBirth: string | null;  // Format de date sous forme de texte (ISO ou DD/MM/YYYY)
  placeOfBirth: string | null;
  homeAddress: string | null;
  fatherStatus: string | null;
  motherStatus: string | null;
  profileImage: string | null; // URL ou chemin de l'image de profil (optionnel)
}

/**
 * Utilitaires de conversion et fonctions pratiques pour PersonalInfo
 */
export const PersonalInfoMapper = {
  fromJson(json: Record<string, unknown>): PersonalInfo {
    const studentId = json.studentId ?? json.student_id;
    const firstNameAr = json.firstNameAr ?? json.first_name_ar;
    const lastNameAr = json.lastNameAr ?? json.last_name_ar;
    const firstNameEn = json.firstNameEn ?? json.first_name_en;
    const lastNameEn = json.lastNameEn ?? json.last_name_en;
    const nationality = json.nationality;
    const sex = json.sex;
    const dateOfBirth = json.dateOfBirth ?? json.date_of_birth;
    const placeOfBirth = json.placeOfBirth ?? json.place_of_birth;
    const homeAddress = json.homeAddress ?? json.home_address;
    const fatherStatus = json.fatherStatus ?? json.father_status;
    const motherStatus = json.motherStatus ?? json.mother_status;
    const profileImage = json.profileImage ?? json.profile_image;

    return {
      studentId: (studentId as number | string) ?? null,
      firstNameAr: typeof firstNameAr === 'string' ? firstNameAr : '',
      lastNameAr: typeof lastNameAr === 'string' ? lastNameAr : '',
      firstNameEn: typeof firstNameEn === 'string' ? firstNameEn : '',
      lastNameEn: typeof lastNameEn === 'string' ? lastNameEn : '',
      nationality: typeof nationality === 'string' ? nationality : null,
      sex: typeof sex === 'string' ? sex : null,
      dateOfBirth: typeof dateOfBirth === 'string' ? dateOfBirth : null,
      placeOfBirth: typeof placeOfBirth === 'string' ? placeOfBirth : null,
      homeAddress: typeof homeAddress === 'string' ? homeAddress : null,
      fatherStatus: typeof fatherStatus === 'string' ? fatherStatus : null,
      motherStatus: typeof motherStatus === 'string' ? motherStatus : null,
      profileImage: typeof profileImage === 'string' ? profileImage : null,
      isComplete:
        firstNameAr != null && firstNameAr !== '' &&
        lastNameAr != null && lastNameAr !== '' &&
        firstNameEn != null && firstNameEn !== '' &&
        lastNameEn != null && lastNameEn !== '' &&
        nationality != null &&
        sex != null &&
        dateOfBirth != null &&
        placeOfBirth != null &&
        homeAddress != null &&
        fatherStatus != null &&
        motherStatus != null
    };
  },

  toJson(personalInfo: PersonalInfo): Record<string, unknown> {
    // Note d'origine : 'student_id' et 'profile_image' sont gérés par le backend, on ne les envoie pas
    return {
      'first_name_ar': personalInfo.firstNameAr,
      'last_name_ar': personalInfo.lastNameAr,
      'first_name_en': personalInfo.firstNameEn,
      'last_name_en': personalInfo.lastNameEn,
      'nationality': personalInfo.nationality,
      'sex': personalInfo.sex,
      'date_of_birth': personalInfo.dateOfBirth,
      'place_of_birth': personalInfo.placeOfBirth,
      'home_address': personalInfo.homeAddress,
      'father_status': personalInfo.fatherStatus,
      'mother_status': personalInfo.motherStatus,
    };
  },

  /** Equivalent de getFullArName() */
  getFullArName(personalInfo: PersonalInfo): string {
    return `${personalInfo.firstNameAr} ${personalInfo.lastNameAr}`.trim();
  },

  /** Equivalent de getFullEnName() */
  getFullEnName(personalInfo: PersonalInfo): string {
    return `${personalInfo.firstNameEn} ${personalInfo.lastNameEn}`.trim();
  }
};