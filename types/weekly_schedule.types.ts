// types/weekly_schedule.types.ts
import { BaseModel } from './model.types';

export interface WeeklySchedule extends BaseModel {
  weeklyScheduleId: number | string | null;
  dayOfWeek: number | string | null; // Peut représenter un index (0-6) ou le nom du jour
  lectureId: number | string | null;
  startTime: string | null;          // Format HH:mm ou HH:mm:ss
  endTime: string | null;            // Format HH:mm ou HH:mm:ss
}

/**
 * Utilitaires de conversion pour le modèle WeeklySchedule
 */
export const WeeklyScheduleMapper = {
  fromJson(json: Record<string, unknown>): WeeklySchedule {
    const weeklyScheduleId = json.weekly_schedule_id;
    const dayOfWeek = json.day_of_week;
    const lectureId = json.lecture_id;
    const startTime = json.start_time;
    const endTime = json.end_time;

    return {
      weeklyScheduleId: (weeklyScheduleId as number | string) ?? null,
      dayOfWeek: (dayOfWeek as number | string) ?? null,
      lectureId: (lectureId as number | string) ?? null,
      startTime: typeof startTime === 'string' ? startTime : null,
      endTime: typeof endTime === 'string' ? endTime : null,
      
      // Strictement aligné sur la règle Dart : tous les champs doivent être présents
      isComplete:
        weeklyScheduleId != null &&
        dayOfWeek != null &&
        lectureId != null &&
        startTime != null &&
        endTime != null
    };
  },

  toJson(schedule: WeeklySchedule): Record<string, unknown> {
    return {
      'weekly_schedule_id': schedule.weeklyScheduleId,
      'day_of_week': schedule.dayOfWeek,
      'lecture_id': schedule.lectureId,
      'start_time': schedule.startTime,
      'end_time': schedule.endTime,
    };
  }
};