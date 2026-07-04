// types/teacher_attendance.types.ts
import { BaseModel } from './model.types';

export interface TeacherAttendance extends BaseModel {
  id: number | null;
  teacherId: number;
  date: string;          // Format attendu : DD-MM-YYYY
  status: string;        // "present", "late", "absent", "excused"
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Utilitaires de conversion et d'affichage pour TeacherAttendance
 */
export const TeacherAttendanceMapper = {
  fromJson(json: Record<string, unknown>): TeacherAttendance {
    const id = json.id;
    const teacherId = json.teacher_id ?? json.teacherId;
    const date = json.date;
    const status = json.status;
    const notes = json.notes;
    const createdAt = json.created_at ?? json.createdAt;
    const updatedAt = json.updated_at ?? json.updated_at;

    return {
      id: typeof id === 'number' ? id : null,
      teacherId: typeof teacherId === 'number' ? teacherId : 0, // Fallback par défaut si manquant
      date: typeof date === 'string' ? date : '',
      status: typeof status === 'string' ? status : 'absent',   // Statut par défaut logique
      notes: typeof notes === 'string' ? notes : null,
      createdAt: typeof createdAt === 'string' ? createdAt : null,
      updatedAt: typeof updatedAt === 'string' ? updatedAt : null,
      // On valide la complétude sur les champs requis dans le constructeur Dart
      isComplete: typeof teacherId === 'number' && typeof date === 'string' && typeof status === 'string'
    };
  },

  toJson(attendance: TeacherAttendance): Record<string, unknown> {
    const json: Record<string, unknown> = {
      'teacher_id': attendance.teacherId,
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
   * Retourne le texte du statut en Arabe
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
   * Équivalent de getStatusColor()
   * Retourne la couleur au format Hexadécimal (String) réutilisable par le CSS ou les frameworks UI
   */
  getStatusColorHex(status: string): string {
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
   * Équivalent du pattern copyWith en Dart
   */
  copyWith(attendance: TeacherAttendance, update: Partial<TeacherAttendance>): TeacherAttendance {
    return {
      ...attendance,
      ...update
    };
  }
};