import { Lecture } from './lecture.types';

export interface LectureManagementScreenState {
  lectures: LectureFormData[];
  filteredLectures: LectureFormData[];
  selectedLectures: LectureFormData[];
  isLoading: boolean;
  isTeacher: boolean;
  searchQuery: string;
  sortBy?: 'name' | 'date' | 'status';
}

export interface LectureFormData {
  lectureId: number;
  lectureNameAr: string;
  lectureNameEn?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'archived';
  teacherId?: number;
  studentCount?: number;
}

export interface LectureManagementActions {
  addLecture: () => void;
  editLecture: (lecture: LectureFormData) => void;
  duplicateLecture: (lecture: LectureFormData) => void;
  deleteLectures: (lectures: LectureFormData[]) => Promise<void>;
  exportLectures: (lectures: LectureFormData[]) => void;
  searchLectures: (query: string) => void;
}

export const getLectureTableColumns = () => {
  return [
    { key: 'lectureNameAr', label: 'اسم الحلقة', width: '30%' },
    { key: 'lectureNameEn', label: 'Lecture Name', width: '20%' },
    { key: 'startDate', label: 'تاريخ البدء', width: '15%' },
    { key: 'studentCount', label: 'عدد الطلاب', width: '10%' },
    { key: 'status', label: 'الحالة', width: '15%' },
    { key: 'actions', label: 'الإجراءات', width: '10%' },
  ];
};

export const filterLecturesByStatus = (
  lectures: LectureFormData[],
  status: 'active' | 'inactive' | 'archived'
): LectureFormData[] => {
  return lectures.filter((lecture) => lecture.status === status);
};

export const searchLectures = (
  lectures: LectureFormData[],
  query: string
): LectureFormData[] => {
  if (!query) return lectures;
  const lowerQuery = query.toLowerCase();
  return lectures.filter((lecture) => {
    return (
      lecture.lectureNameAr.toLowerCase().includes(lowerQuery) ||
      lecture.lectureNameEn?.toLowerCase().includes(lowerQuery) ||
      false
    );
  });
};

export const LECTURE_MANAGEMENT_MESSAGES = {
  headerTeacher: 'حلقاتي',
  headerAdmin: 'الصفحة الرئيسية  /  إعدادات  /  إدارة الحلقات',
  addButton: 'إضافة',
  editButton: 'تعديل',
  duplicateButton: 'تكرار',
  deleteButton: 'حذف',
  exportButton: 'تصدير',
  searchPlaceholder: 'البحث...',
};
