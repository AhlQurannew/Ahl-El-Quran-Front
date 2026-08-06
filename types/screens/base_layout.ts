export interface BaseLayoutProps {
  title: string;
  children: React.ReactNode;
}

export interface BaseLayoutState {
  miniMode: boolean;
  isDrawerOpen: boolean;
  screenWidth: number;
}

export const RESPONSIVE_BREAKPOINTS = {
  mobile: 600,
  tablet: 1024,
  desktop: 1440,
};

export const isDesktopLayout = (screenWidth: number): boolean => {
  return screenWidth >= RESPONSIVE_BREAKPOINTS.desktop;
};

export const isTabletLayout = (screenWidth: number): boolean => {
  return screenWidth >= RESPONSIVE_BREAKPOINTS.tablet && screenWidth < RESPONSIVE_BREAKPOINTS.desktop;
};

export const isMobileLayout = (screenWidth: number): boolean => {
  return screenWidth < RESPONSIVE_BREAKPOINTS.tablet;
};

export interface HeaderConfig {
  backgroundColor: string;
  textColor: string;
  elevation: number;
}

export interface FooterConfig {
  backgroundColor: string;
  textColor: string;
  height: number;
}

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  backgroundColor: 'rgb(63, 81, 181)',
  textColor: 'rgb(255, 255, 255)',
  elevation: 1,
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  backgroundColor: 'rgb(245, 245, 245)',
  textColor: 'rgb(0, 0, 0)',
  height: 56,
};

export const toggleMiniMode = (currentState: boolean): boolean => !currentState;

export const handleDrawerToggle = (state: BaseLayoutState): BaseLayoutState => {
  return {
    ...state,
    isDrawerOpen: !state.isDrawerOpen,
  };
};
