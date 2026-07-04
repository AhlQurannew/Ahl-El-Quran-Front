// types/student.types.ts
import { BaseModel } from './model.types';
import { PersonalInfo, PersonalInfoMapper } from './personal_info.types';
import { MedicalInfo, MedicalInfoMapper } from './medical_info.types';
import { Lecture, LectureMapper } from './lecture.types';
import { StudentRelations, StudentRelationsMapper } from './student_relations.types';
import {AccountInfo, AccountInfoMapper, AccountType} from '../forms/account_info';


// Définitions temporaires ou locales pour les objets non encore typés
export interface ContactInfo { phoneNumber?: string; email?: string; [key: string]: unknown; }
export interface Guardian { [key: string]: unknown; }
export interface FormalEducationInfo { [key: string]: unknown; }
export interface SubscriptionInfo { [key: string]: unknown; }

export interface Student extends BaseModel {
  id: number | null;
  personalInfo: PersonalInfo;
  accountInfo: AccountInfo;
  contactInfo: ContactInfo;
  medicalInfo: MedicalInfo;
  guardian: Guardian;
  lectures: Lecture[];
  studentRelations: StudentRelations;
  formalEducationInfo: FormalEducationInfo;
  subscriptionInfo: SubscriptionInfo;
}

/**
 * Utilitaires de conversion pour le modèle agrégé Student
 */
export const StudentMapper = {
  createEmpty(): Student {
    return {
      id: null,
      personalInfo: PersonalInfoMapper.fromJson({}),
      // Utilisation du modèle d'origine initialisé par son propre Mapper
      accountInfo: AccountInfoMapper.fromJson({}),
      contactInfo: { phoneNumber: '', email: '' },
      medicalInfo: MedicalInfoMapper.fromJson({}),
      guardian: {},
      lectures: [],
      studentRelations: StudentRelationsMapper.fromJson({}),
      formalEducationInfo: {},
      subscriptionInfo: {},
      isComplete: false
    };
  },

  fromJson(json: Record<string, unknown>): Student {
    const topLevelId = json.id;

    const personalInfo = json.personalInfo 
      ? PersonalInfoMapper.fromJson(json.personalInfo as Record<string, unknown>)
      : PersonalInfoMapper.fromJson({});

    if (topLevelId != null) {
      personalInfo.studentId = topLevelId as number | string;
    }

    // Reconstruction propre via le AccountInfoMapper dédié
    const accountInfo = json.accountInfo
      ? AccountInfoMapper.fromJson(json.accountInfo as Record<string, unknown>)
      : AccountInfoMapper.fromJson({});

    const contactInfo = (json.contactInfo as ContactInfo) ?? { phoneNumber: '', email: '' };

    const medicalInfo = json.medicalInfo
      ? MedicalInfoMapper.fromJson(json.medicalInfo as Record<string, unknown>)
      : MedicalInfoMapper.fromJson({});

    const guardian = (json.guardian as Guardian) ?? {};
    
    const studentRelations = json.student
      ? StudentRelationsMapper.fromJson(json.student as Record<string, unknown>)
      : StudentRelationsMapper.fromJson({});

    const rawLectures = json.lectures;
    const lectures = Array.isArray(rawLectures)
      ? rawLectures.map((l) => LectureMapper.fromJson(l as Record<string, unknown>))
      : [];

    const formalEducationInfo = (json.formalEducationInfo as FormalEducationInfo) ?? {};
    const subscriptionInfo = (json.subscriptionInfo as SubscriptionInfo) ?? {};

    // Validation stricte basée sur les valeurs réelles typées
    const isComplete = !!(
      personalInfo.firstNameAr && personalInfo.firstNameAr.trim() !== '' &&
      personalInfo.lastNameAr && personalInfo.lastNameAr.trim() !== '' &&
      personalInfo.sex && personalInfo.sex.trim() !== '' &&
      accountInfo.username && accountInfo.username.trim() !== '' &&
      accountInfo.passcode && accountInfo.passcode.trim() !== '' &&
      contactInfo.phoneNumber && contactInfo.phoneNumber.trim() !== '' &&
      contactInfo.email && contactInfo.email.trim() !== ''
    );

    let finalId: number | null = null;
    if (typeof personalInfo.studentId === 'number') {
      finalId = personalInfo.studentId;
    } else if (typeof personalInfo.studentId === 'string') {
      const parsed = parseInt(personalInfo.studentId, 10);
      finalId = !isNaN(parsed) ? parsed : null;
    }

    return {
      id: finalId,
      personalInfo,
      accountInfo,
      contactInfo,
      medicalInfo,
      guardian,
      lectures,
      studentRelations,
      formalEducationInfo,
      subscriptionInfo,
      isComplete
    };
  },

  toJson(student: Student): Record<string, unknown> {
    return {
      'personalInfo': PersonalInfoMapper.toJson(student.personalInfo),
      // Sérialisation déléguée au mapper AccountInfo
      'accountInfo': AccountInfoMapper.toJson(student.accountInfo),
      'contactInfo': student.contactInfo,
      'medicalInfo': MedicalInfoMapper.toJson(student.medicalInfo),
      'guardian': student.guardian,
      'student': StudentRelationsMapper.toJson(student.studentRelations),
      'lectures': student.lectures.map((l) => LectureMapper.toJson(l)),
      'formalEducationInfo': student.formalEducationInfo,
      'subscriptionInfo': student.subscriptionInfo,
    };
  }
};