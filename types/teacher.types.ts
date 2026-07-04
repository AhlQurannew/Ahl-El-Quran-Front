// types/teacher.types.ts
import { BaseModel } from './model.types';

export interface Teacher extends BaseModel {
  teacherId: number | string | null;
  workHours: number | string | null;
  teacherContactId: number | string | null;
  teacherAccountId: number | string | null;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
}

/**
 * Utilitaires de conversion et d'aide pour le modèle Teacher
 */
export const TeacherMapper = {
  fromJson(json: Record<string, unknown>): Teacher {
    // Gestion des fallbacks de clés comme dans le factory Dart
    const teacherId = json.teacher_id ?? json.id;
    const workHours = json.work_hours ?? json.workHours;
    const teacherContactId = json.teacher_contact_id ?? json.teacherContactId;
    const teacherAccountId = json.teacher_account_id ?? json.user_id ?? json.teacherAccountId;
    const firstName = json.first_name ?? json.firstname ?? json.firstName;
    const lastName = json.last_name ?? json.lastname ?? json.lastName;
    const profileImage = json.profile_image ?? json.profileImage;

    return {
      teacherId: (teacherId as number | string) ?? null,
      workHours: (workHours as number | string) ?? null,
      teacherContactId: (teacherContactId as number | string) ?? null,
      teacherAccountId: (teacherAccountId as number | string) ?? null,
      firstName: typeof firstName === 'string' ? firstName : null,
      lastName: typeof lastName === 'string' ? lastName : null,
      profileImage: typeof profileImage === 'string' ? profileImage : null,
      
      // La règle de complétude stricte du fichier Dart
      isComplete:
        teacherId != null &&
        workHours != null &&
        teacherContactId != null &&
        teacherAccountId != null &&
        firstName != null &&
        lastName != null
    };
  },

  toJson(teacher: Teacher): Record<string, unknown> {
    return {
      'teacher_id': teacher.teacherId,
      'work_hours': teacher.workHours,
      'teacher_contact_id': teacher.teacherContactId,
      'teacher_account_id': teacher.teacherAccountId,
      'first_name': teacher.firstName,
      'last_name': teacher.lastName,
      'profile_image': teacher.profileImage,
    };
  },

  /**
   * Équivalent du toString() Dart pour l'affichage ou le débogage
   * Exemple : "[12] Mohamed Benali"
   */
  toString(teacher: Teacher): string {
    return `[${teacher.teacherId ?? 'null'}] ${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim();
  },

  /**
   * Équivalent de la surcharge de l'opérateur ==
   * Compare deux enseignants sur leur identifiant unique
   */
  isEqual(teacherA: Teacher | null, teacherB: Teacher | null): boolean {
    if (!teacherA || !teacherB) return false;
    return teacherA.teacherId === teacherB.teacherId;
  }
};