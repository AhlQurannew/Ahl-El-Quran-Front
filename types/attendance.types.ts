// types/attendance.types.ts
import { BaseModel } from './model.types';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export interface Attendance extends BaseModel {
  id: number | null;
  studentId: number;
  date: string;       // Format: DD-MM-YYYY
  status: AttendanceStatus | string;
  notes: string | null;
  createdAt: string | null; // ISO String
  updatedAt: string | null; // ISO String
}

/**
 * Utilitaires de conversion et d'affichage pour le modèle Attendance
 */
export const AttendanceMapper = {
  fromJson(json: Record<string, unknown>): Attendance {
    const id = json.id;
    const studentId = json.student_id;
    const date = json.date;
    const status = json.status;
    const notes = json.notes;
    const createdAt = json.created_at;
    const updatedAt = json.updated_at;

    return {
      id: typeof id === 'number' ? id : null,
      studentId: typeof studentId === 'number' ? studentId : 0,
      date: typeof date === 'string' ? date : '',
      status: typeof status === 'string' ? status : 'absent',
      notes: typeof notes === 'string' ? notes : null,
      createdAt: typeof createdAt === 'string' ? new Date(createdAt).toISOString() : null,
      updatedAt: typeof updatedAt === 'string' ? new Date(updatedAt).toISOString() : null,

      // Validation basée sur les champs requis du constructeur Dart
      isComplete: typeof studentId === 'number' && typeof date === 'string' && typeof status === 'string'
    };
  },

  toJson(attendance: Attendance): Record<string, unknown> {
    const json: Record<string, unknown> = {
      'student_id': attendance.studentId,
      'date': attendance.date,
      'status': attendance.status,
    };

    if (attendance.id != null) json['id'] = attendance.id;
    if (attendance.notes != null) json['notes'] = attendance.notes;
    if (attendance.createdAt != null) json['created_at'] = attendance.createdAt;
    if (attendance.updatedAt != null) json['updated_at'] = attendance.updatedAt;

    return json;
  },

  /**
   * Équivalent de getStatusArabic()
   */
  getStatusArabic(status: string): string {
    switch (status) {
      case 'present':
        return 'حاضر';
      case 'late':
        return 'متأخر';
      case 'absent':
        return 'غائب';
      case 'excused':
        return 'غائب بعذر';
      default:
        return status;
    }
  },

  /**
   * Équivalent de getStatusColor() - Renvoie le code couleur hexadécimal CSS
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'present':
        return '#4CAF50'; // Vert
      case 'late':
        return '#FFA726'; // Orange
      case 'absent':
        return '#EF5350'; // Rouge
      case 'excused':
        return '#42A5F5'; // Bleu
      default:
        return '#9E9E9E'; // Gris (Colors.grey)
    }
  },

  /**
   * Équivalent de copyWith() pour créer une nouvelle instance modifiée
   */
  copyWith(attendance: Attendance, updates: Partial<Omit<Attendance, 'isComplete'>>): Attendance {
    const updated = {
      ...attendance,
      ...updates,
    };
    
    // Recalcul de isComplete après modification
    updated.isComplete = 
      typeof updated.studentId === 'number' && 
      typeof updated.date === 'string' && 
      typeof updated.status === 'string';

    return updated;
  }
};