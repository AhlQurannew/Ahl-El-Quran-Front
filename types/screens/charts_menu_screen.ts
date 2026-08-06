export interface ChartMenuTile {
  label: string;
  icon: string;
  bigIcon: string;
  route: string;
  backgroundColor?: string;
}

export interface ChartsMenuScreenState {
  selectedIndex: number;
}

export const getChartMenuTiles = (): ChartMenuTile[] => {
  return [
    {
      label: 'إحصائيات الإنجاز',
      icon: 'bar-chart',
      bigIcon: 'bar-chart-outlined',
      route: '/stats/achievement-selection',
    },
    {
      label: 'إحصائيات المواظبة',
      icon: 'bar-chart',
      bigIcon: 'bar-chart-outlined',
      route: '/stats/attendance-selection',
    },
    {
      label: 'منحنى تطور الإنجاز',
      icon: 'show-chart',
      bigIcon: 'show-chart-outlined',
      route: '/stats/progress-selection',
    },
    {
      label: 'إحصائيات الحلقة',
      icon: 'bar-chart',
      bigIcon: 'bar-chart-outlined',
      route: '/stats/lecture-selection',
    },
  ];
};

export const CHARTS_MENU_COLORS = {
  headerBackground: '#DEB059',
  headerText: '#FFFFFF',
  tileBackground: '#4DB6AC',
  gridColumns: 2,
};

export const CHARTS_MENU_BREADCRUMB = 'الصفحة الرئيسية / الإحصاءات';

export const navigateToChart = (route: string): void => {
  // Placeholder for navigation
  console.log(`Navigating to: ${route}`);
};
