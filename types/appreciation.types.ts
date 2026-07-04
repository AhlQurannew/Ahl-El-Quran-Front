// types/appreciation.types.ts
import { BaseModel } from './model.types';

export interface Appreciation extends BaseModel {
  appreciationId: number | string | null;
  pointMin: number | null;
  pointMax: number | null;
  note: string | null; // L'appréciation textuelle (ex: "Excellent", "Bien")
}

/**
 * Utilitaires de conversion pour le modèle Appreciation
 */
export const AppreciationMapper = {
  fromJson(json: Record<string, unknown>): Appreciation {
    const appreciationId = json.appreciation_id;
    const pointMin = json.point_min;
    const pointMax = json.point_max;
    const note = json.note;

    return {
      appreciationId: (appreciationId as number | string) ?? null,
      pointMin: typeof pointMin === 'number' ? pointMin : null,
      pointMax: typeof pointMax === 'number' ? pointMax : null,
      note: typeof note === 'string' ? note : null,

      // Logique Dart conservée : valide si au moins un champ n'est pas nul
      isComplete:
        appreciationId != null ||
        pointMin != null ||
        pointMax != null ||
        note != null,
    };
  },

  toJson(appreciation: Appreciation): Record<string, unknown> {
    return {
      'appreciation_id': appreciation.appreciationId,
      'point_min': appreciation.pointMin,
      'point_max': appreciation.pointMax,
      'note': appreciation.note,
    };
  },

  /**
   * Équivalent du copyWith() Dart
   */
  copyWith(
    appreciation: Appreciation,
    updates: { note?: string; pointMin?: number; pointMax?: number }
  ): Appreciation {
    const updated = {
      ...appreciation,
      note: updates.note !== undefined ? updates.note : appreciation.note,
      pointMin: updates.pointMin !== undefined ? updates.pointMin : appreciation.pointMin,
      pointMax: updates.pointMax !== undefined ? updates.pointMax : appreciation.pointMax,
    };

    // Recalcul du statut de complétude
    updated.isComplete =
      updated.appreciationId != null ||
      updated.pointMin != null ||
      updated.pointMax != null ||
      updated.note != null;

    return updated;
  },
};