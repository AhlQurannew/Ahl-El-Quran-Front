// types/supervisor_attendance.types.ts
import { BaseModel } from './model.types';

export interface SupervisorAttendance extends BaseModel {
  supervisorId: number | string | null;
  attendanceDate: string | null;    // Date de présence (format ISO ou YYYY-MM-DD)
  attendanceStatus: string | null;  // Statut (ex: 'present', 'absent', etc.)
  checkInTime: string | null;       // Heure d'arrivée
  checkOutTime: string | null;      // Heure de départ
}

/**
 * Utilitaires de conversion pour SupervisorAttendance
 * Sécurise les types dynamiques de Dart en types TypeScript stricts
 */
export const SupervisorAttendanceMapper = {
  fromJson(json: Record<string, unknown>): SupervisorAttendance {
    const supervisorId = json.supervisor_id;
    const attendanceDate = json.attendance_date;
    const attendanceStatus = json.attendance_status;
    const checkInTime = json.check_in_time;
    const checkOutTime = json.check_out_time;

    return {
      supervisorId: (supervisorId as number | string) ?? null,
      attendanceDate: typeof attendanceDate === 'string' ? attendanceDate : null,
      attendanceStatus: typeof attendanceStatus === 'string' ? attendanceStatus : null,
      checkInTime: typeof checkInTime === 'string' ? checkInTime : null,
      checkOutTime: typeof checkOutTime === 'string' ? checkOutTime : null,
      // La règle Dart impose que TOUS les champs soient non-nuls pour être complet
      isComplete:
        supervisorId != null &&
        attendanceDate != null &&
        attendanceStatus != null &&
        checkInTime != null &&
        checkOutTime != null
    };
  },

  toJson(attendance: SupervisorAttendance): Record<string, unknown> {
    return {
      'supervisor_id': attendance.supervisorId,
      'attendance_date': attendance.attendanceDate,
      'attendance_status': attendance.attendanceStatus,
      'check_in_time': attendance.checkInTime,
      'check_out_time': attendance.checkOutTime,
    };
  }
};