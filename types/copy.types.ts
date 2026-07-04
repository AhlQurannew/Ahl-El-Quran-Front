// types/copy.types.ts
import { BaseModel } from './model.types';

export interface Copy extends BaseModel {
  schoolName: string | null;
  country: string | null;
  schoolAddress: string | null;
  name: string | null;
  supervisorName: string | null;
  phoneNumber: string | null;
  email: string | null;
}

/**
 * Utilitaires de conversion pour le modèle Copy
 */
export const CopyMapper = {
  fromJson(json: Record<string, unknown>): Copy {
    const schoolName = json.schoolName;
    const country = json.country;
    const schoolAddress = json.schoolAddress;
    const name = json.name;
    const supervisorName = json.nameOfSupervisor; // Attention à la clé imbriquée 'nameOfSupervisor' dans le JSON
    const phoneNumber = json.phoneNumber;
    const email = json.email;

    return {
      schoolName: typeof schoolName === 'string' ? schoolName : null,
      country: typeof country === 'string' ? country : null,
      schoolAddress: typeof schoolAddress === 'string' ? schoolAddress : null,
      name: typeof name === 'string' ? name : null,
      supervisorName: typeof supervisorName === 'string' ? supervisorName : null,
      phoneNumber: typeof phoneNumber === 'string' ? phoneNumber : null,
      email: typeof email === 'string' ? email : null,

      // Toutes les chaînes de caractères doivent être non-nulles pour valider l'objet
      isComplete:
        schoolName != null &&
        country != null &&
        schoolAddress != null &&
        name != null &&
        supervisorName != null &&
        phoneNumber != null &&
        email != null,
    };
  },

  toJson(copy: Copy): Record<string, unknown> {
    return {
      'schoolName': copy.schoolName,
      'country': copy.country,
      'schoolAddress': copy.schoolAddress,
      'name': copy.name,
      'nameOfSupervisor': copy.supervisorName, // Respecte la clé mappée en Dart
      'phoneNumber': copy.phoneNumber,
      'email': copy.email,
    };
  },
};