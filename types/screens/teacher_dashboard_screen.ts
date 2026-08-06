export interface TeacherDashboardState {
  firstName: string;
  lastName: string;
  userRole: string;
}

export interface TeacherDashboardTile {
  label: string;
  icon: string;
  bigIcon: string;
  route: string;
  backgroundColor?: string;
}

export const getTeacherDashboardTiles = (): TeacherDashboardTile[] => {
  return [
    {
      label: 'طلابي',
      icon: 'people',
      bigIcon: 'people-outlined',
      route: '/students',
      backgroundColor: '#4DB6AC',
    },
    {
      label: 'الحفظ والمراجعة',
      icon: 'check-box',
      bigIcon: 'check-box-outlined',
      route: '/track-memorize',
      backgroundColor: '#4DB6AC',
    },
    {
      label: 'حضور الطلاب',
      icon: 'event-available',
      bigIcon: 'event-available-outlined',
      route: '/attendance',
      backgroundColor: '#4DB6AC',
    },
    {
      label: 'التقارير',
      icon: 'description',
      bigIcon: 'description-outlined',
      route: '/reports',
      backgroundColor: '#4DB6AC',
    },
  ];
};

export const TEACHER_DASHBOARD_COLORS = {
  welcomeBackground: '#4DB6AC',
  welcomeText: '#FFFFFF',
  welcomeSubtext: '#FFFFFF70',
  gridColumns: 3,
  tileAspectRatio: 1.5,
};

export const TEACHER_DASHBOARD_TEXT = {
  welcome: (firstName: string, lastName: string) => `مرحباً ${firstName} ${lastName}`,
  role: 'معلم',
};
