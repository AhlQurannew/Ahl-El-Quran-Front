export interface ExamMenuOption {
  title: string;
  icon: string;
  route: string;
  description?: string;
}

export interface ExamPageState {
  selectedOption: ExamMenuOption | null;
  isLoading: boolean;
}

export const getExamMenuOptions = (): ExamMenuOption[] => {
  return [
    {
      title: 'سجل الاختبارات',
      icon: 'list',
      route: '/exams/records',
      description: 'عرض وإدارة سجلات الاختبارات',
    },
    {
      title: 'تقديرات الاختبارات',
      icon: 'list',
      route: '/exams/notes',
      description: 'إدارة تقديرات وملاحظات الاختبارات',
    },
    {
      title: 'ادارة لجنة الاختبارات',
      icon: 'list',
      route: '/exams/teachers',
      description: 'إدارة معلمي لجنة الاختبارات',
    },
    {
      title: 'انواع الاختبارات',
      icon: 'list',
      route: '/exams/types',
      description: 'إدارة أنواع الاختبارات',
    },
  ];
};

export const EXAM_PAGE_TITLE = 'Exam Management';

export const navigateToExamPage = (route: string): void => {
  // Placeholder for navigation
  console.log(`Navigating to: ${route}`);
};

export interface ExamGridCardButton {
  title: string;
  icon: string;
  onPressed: () => void;
}
