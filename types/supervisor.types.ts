// types/supervisor.types.ts
import { BaseModel } from './model.types';

export interface Supervisor extends BaseModel {
  id: number | null;
  userId: number | null;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string | null; // Chaîne ISO pour stocker la date proprement
}

/**
 * Utilitaires de conversion et d'aide pour le modèle Supervisor
 */
export const SupervisorMapper = {
  fromJson(json: Record<string, unknown>): Supervisor {
    const id = json.id;
    const userId = json.user_id ?? json.userId;
    const firstname = json.firstname;
    const lastname = json.lastname;
    const email = json.email;
    const isActive = json.is_active ?? json.isActive;
    const createdAt = json.created_at ?? json.createdAt;

    return {
      id: typeof id === 'number' ? id : null,
      userId: typeof userId === 'number' ? userId : null,
      firstname: typeof firstname === 'string' ? firstname : null,
      lastname: typeof lastname === 'string' ? lastname : null,
      email: typeof email === 'string' ? email : null,
      isActive: typeof isActive === 'boolean' ? isActive : true, // Valeur par défaut 'true' comme en Dart
      createdAt: typeof createdAt === 'string' ? createdAt : null,
      isComplete:
        id != null &&
        firstname != null &&
        lastname != null &&
        email != null
    };
  },

  toJson(supervisor: Supervisor): Record<string, unknown> {
    return {
      'id': supervisor.id,
      'user_id': supervisor.userId,
      'firstname': supervisor.firstname,
      'lastname': supervisor.lastname,
      'email': supervisor.email,
      'is_active': supervisor.isActive,
      'created_at': supervisor.createdAt,
    };
  },

  /**
   * Équivalent de la propriété calculée 'fullName' du fichier Dart
   */
  getFullName(supervisor: Supervisor): string {
    return `${supervisor.firstname ?? ''} ${supervisor.lastname ?? ''}`.trim();
  }
};