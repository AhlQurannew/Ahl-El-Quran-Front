export interface ReportsMenuTile {
  label: string;
  icon: string;
  bigIcon: string;
  route: string;
  description?: string;
}

export interface ReportsMenuScreenState {
  selectedIndex: number;
}

export const getReportsMenuTiles = (): ReportsMenuTile[] => {
  return [
    {
      label: 'تقرير الإنجاز اليومي',
      icon: 'description',
      bigIcon: 'description-outlined',
      route: '/daily-achievement-report-selection',
      description: 'عرض تقارير الإنجاز اليومية',
    },
    {
      label: 'تقرير المواظبة',
      icon: 'description',
      bigIcon: 'description-outlined',
      route: '/attendance-report-selection',
      description: 'عرض تقارير المواظبة',
    },
    {
      label: 'التقرير التفصيلي للطالب',
      icon: 'description',
      bigIcon: 'description-outlined',
      route: '/student-detail-report-selection',
      description: 'تقرير مفصل لإنجازات الطالب',
    },
    {
      label: 'التقرير التفصيلي للحلقات',
      icon: 'description',
      bigIcon: 'description-outlined',
      route: '/lecture-detail-report-selection',
      description: 'تقرير مفصل لإحصائيات الحلقات',
    },
  ];
};

export const REPORTS_MENU_COLORS = {
  headerBackground: '#DEB059',
  headerText: '#FFFFFF',
  gridColumns: 2,
};

export const REPORTS_MENU_BREADCRUMB = 'الصفحة الرئيسية / التقارير';

export const navigateToReport = (route: string): void => {
  // Placeholder for navigation
  console.log(`Navigating to report: ${route}`);
};
