// types/typehead.types.ts
import { BaseModel } from './model.types';

export interface Typehead extends BaseModel {
  sessionId: number;
  sessionNameAr: string;
}

/**
 * Utilitaires de conversion pour le modèle Typehead
 */
export const TypeheadMapper = {
  fromJson(json: Record<string, unknown>): Typehead {
    const sessionId = json.lecture_id ?? json.sessionId;
    const sessionNameAr = json.lecture_name_ar ?? json.sessionNameAr;

    return {
      sessionId: typeof sessionId === 'number' ? sessionId : 0,
      sessionNameAr: typeof sessionNameAr === 'string' ? sessionNameAr : '',
      
      // Les deux propriétés étant obligatoires dans le constructeur Dart
      isComplete: typeof sessionId === 'number' && typeof sessionNameAr === 'string'
    };
  },

  toJson(typehead: Typehead): Record<string, unknown> {
    return {
      'lecture_id': typehead.sessionId,
      'lecture_name_ar': typehead.sessionNameAr,
    };
  }
};