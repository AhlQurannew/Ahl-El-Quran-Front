// types/guardian.types.ts
import { BaseModel } from './model.types';

export interface Guardian extends BaseModel {
  guardianId: number | string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  dateOfBirth: string | null;      // Format date (YYYY-MM-DD)
  relationship: string | null;     // Lien de parenté
  guardianContactId: number | string | null;
  guardianAccountId: number | string | null;
  homeAddress: string | null;
  job: string | null;
  profileImage: string | null;     // URL ou chemin de l'image
}

/**
 * Utilitaires de conversion pour le modèle Guardian
 */
export const GuardianMapper = {
  fromJson(json: Record<string, unknown>): Guardian {
    // Gestion des fallbacks de clés exactement comme en Dart
    const guardianId = json.guardianId ?? json.guardian_id ?? json.id;
    const firstName = json.firstName ?? json.first_name;
    const lastName = json.lastName ?? json.last_name;
    const email = json.email;
    const dateOfBirth = json.dateOfBirth ?? json.date_of_birth;
    const relationship = json.relationship ?? json.relationship_to_student;
    const guardianContactId = json.guardianContactId ?? json.guardian_contact_id;
    const guardianAccountId = json.guardianAccountId ?? json.guardian_account_id;
    const homeAddress = json.homeAddress ?? json.home_address ?? json.address;
    const job = json.job;
    const profileImage = json.profileImage ?? json.profile_image;

    return {
      guardianId: (guardianId as number | string) ?? null,
      firstName: typeof firstName === 'string' ? firstName : null,
      lastName: typeof lastName === 'string' ? lastName : null,
      email: typeof email === 'string' ? email : null,
      dateOfBirth: typeof dateOfBirth === 'string' ? dateOfBirth : null,
      relationship: typeof relationship === 'string' ? relationship : null,
      guardianContactId: (guardianContactId as number | string) ?? null,
      guardianAccountId: (guardianAccountId as number | string) ?? null,
      homeAddress: typeof homeAddress === 'string' ? homeAddress : null,
      job: typeof job === 'string' ? job : null,
      profileImage: typeof profileImage === 'string' ? profileImage : null,

      // Devient complet uniquement si TOUS les champs sont renseignés (logique stricte du modèle Dart)
      isComplete:
        guardianId != null &&
        firstName != null &&
        lastName != null &&
        email != null &&
        dateOfBirth != null &&
        relationship != null &&
        guardianContactId != null &&
        guardianAccountId != null &&
        homeAddress != null &&
        job != null &&
        profileImage != null
    };
  },

  /**
   * Conversion standard (inclut tous les champs et IDs)
   */
  toJson(guardian: Guardian): Record<string, unknown> {
    return {
      'guardian_id': guardian.guardianId,
      'first_name': guardian.firstName,
      'last_name': guardian.lastName,
      'email': guardian.email,
      'date_of_birth': guardian.dateOfBirth,
      'relationship': guardian.relationship,
      'guardian_contact_id': guardian.guardianContactId,
      'guardian_account_id': guardian.guardianAccountId,
      'home_address': guardian.homeAddress,
      'job': guardian.job,
      'profile_image': guardian.profileImage,
    };
  },

  /**
   * Convertit pour l'envoi à l'API (exclut les IDs générés par le backend)
   */
  toApiJson(guardian: Guardian): Record<string, unknown> {
    return {
      'first_name': guardian.firstName,
      'last_name': guardian.lastName,
      'email': guardian.email,
      'date_of_birth': guardian.dateOfBirth,
      'relationship': guardian.relationship,
      'home_address': guardian.homeAddress,
      'job': guardian.job,
    };
  },

  /**
   * Équivalent du toString() Dart pour affichage rapide ou logs
   */
  toString(guardian: Guardian): string {
    return `[ ${guardian.guardianId} ] - ${guardian.firstName} ${guardian.lastName}`;
  }
};