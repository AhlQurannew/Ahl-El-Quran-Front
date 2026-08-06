export interface OnboardingPage {
  title: string;
  description: string;
  imageUrl: string;
}

export interface OnboardingScreenState {
  currentPage: number;
  totalPages: number;
}

export const getOnboardingPages = (): OnboardingPage[] => {
  return [
    {
      title: 'أهل القرآن',
      description:
        'نظام أهل القرآن هو نظام سحابي متكامل بهدف لتوظيف آخر ما توصلت إليه التقنية في خدمة تعليم القرآن الكريم',
      imageUrl: 'assets/logo.png',
    },
    {
      title: 'تطوير وبرمجة',
      description:
        'شركة للبرمجة المتخصصة في تصميم وتطوير المواقع الإلكترونية والتطبيقات الذكية.',
      imageUrl: 'assets/logo2.png',
    },
  ];
};

export const ONBOARDING_TEXT = {
  skip: 'تخطي',
  done: 'تخطي',
  next: 'التالي',
  previous: 'السابق',
};

export const ONBOARDING_COLORS = {
  primaryBackground: '#FFFFFF',
  primaryColor: 'rgb(63, 81, 181)',
  dotsSize: { width: 10, height: 10 },
  activeDotSize: { width: 22, height: 10 },
};

export interface OnboardingNavigation {
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentPageIndex: number;
}

export const getOnboardingNavigation = (
  currentPage: number,
  totalPages: number
): OnboardingNavigation => {
  return {
    canGoNext: currentPage < totalPages - 1,
    canGoPrevious: currentPage > 0,
    currentPageIndex: currentPage,
  };
};

export const navigateToLogin = (): void => {
  // Placeholder for navigation to login
  console.log('Navigating to login...');
};
