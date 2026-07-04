// types/contact_info.types.ts
import { BaseModel } from './model.types';

export interface ContactInfo extends BaseModel {
  contactId: number | string | null;
  email: string | null;
  phoneNumber: string | null;
}

/**
 * Utilitaires de conversion pour le modèle ContactInfo
 */
export const ContactInfoMapper = {
  fromJson(json: Record<string, unknown>): ContactInfo {
    // Gestion des fallbacks camelCase / snake_case du modèle Dart
    const contactId = json.contactId ?? json.contact_id;
    const email = json.email;
    const phoneNumber = json.phoneNumber ?? json.phone_number;

    return {
      contactId: (contactId as number | string) ?? null,
      email: typeof email === 'string' ? email : null,
      phoneNumber: (typeof phoneNumber === 'string' || typeof phoneNumber === 'number') 
        ? String(phoneNumber) 
        : null,

      // Tous les champs doivent être présents pour que les coordonnées soient complètes
      isComplete: contactId != null && email != null && phoneNumber != null,
    };
  },

  toJson(contact: ContactInfo): Record<string, unknown> {
    return {
      'contact_id': contact.contactId,
      'email': contact.email,
      'phone_number': contact.phoneNumber,
    };
  },
};