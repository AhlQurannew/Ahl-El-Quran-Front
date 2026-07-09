import { Student } from './student.types';
import { Teacher } from './teacher.types';
import { Lecture } from './lecture.types';
import { Guardian } from './guardian.types';

export interface DashboardCounts {
  students: number;
  teachers: number;
  lectures: number;
  guardians: number;
}

export interface DashboardPageState {
  counts: DashboardCounts;
  isLoading: boolean;
  userRole: 'teacher' | 'admin' | 'president' | 'supervisor' | null;
}

export interface DashboardTileConfig {
  label: string;
  count?: string;
  icon: string;
  bigIcon?: string;
  route?: string;
  page?: React.ReactNode;
  isWide?: boolean;
  backgroundColor?: string;
}

export type UserRole = 'teacher' | 'admin' | 'president' | 'supervisor';

export const getDashboardTiles = (
  counts: DashboardCounts,
  userRole: UserRole | null
): DashboardTileConfig[] => {
  const isTeacher = userRole === 'teacher';
  const canManageSupervisors = userRole === 'president' || userRole === 'admin';

  const tiles: DashboardTileConfig[] = [
    {
      label: 'الطلاب',
      count: counts.students.toString(),
      icon: 'people',
      bigIcon: 'people',
      route: '/students/add',
    },
  ];

  if (!isTeacher) {
    tiles.push({
      label: 'المعلمين',
      count: counts.teachers.toString(),
      icon: 'people-outline',
      bigIcon: 'people-outline',
      route: '/teachers/add',
    });
  }

  tiles.push({
    label: 'الحلقات',
    count: counts.lectures.toString(),
    icon: 'list',
    bigIcon: 'list-alt',
    route: '/lectures/add',
  });

  if (!isTeacher) {
    tiles.push({
      label: 'أولياء الأمور',
      count: counts.guardians.toString(),
      icon: 'person',
      bigIcon: 'person',
      route: '/guardians/add',
    });
  }

  return tiles;
};

export const fetchDashboardCounts = async (userRole: UserRole | null): Promise<DashboardCounts> => {
  // Placeholder for API calls
  return {
    students: 0,
    teachers: 0,
    lectures: 0,
    guardians: 0,
  };
};
