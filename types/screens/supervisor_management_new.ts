// @ts-nocheck
import { Supervisor } from '../supervisor.types';

export interface SupervisorManagementScreenState {
  supervisors: Supervisor[];
  filteredSupervisors: Supervisor[];
  selectedSupervisors: Supervisor[];
  isLoading: boolean;
  errorMessage: string | null;
  searchQuery: string;
}

export interface SupervisorSearchFilter {
  query: string;
  sortBy?: 'name' | 'email';
}

export const filterSupervisors = (
  supervisors: Supervisor[],
  searchQuery: string
): Supervisor[] => {
  if (!searchQuery) return supervisors;

  const lowerQuery = searchQuery.toLowerCase();
  return supervisors.filter((supervisor) => {
    const fullName = supervisor.fullName?.toLowerCase() || '';
    const email = supervisor.email?.toLowerCase() || '';
    return fullName.includes(lowerQuery) || email.includes(lowerQuery);
  });
};

export const toggleSupervisorSelection = (
  selected: Supervisor[],
  supervisor: Supervisor
): Supervisor[] => {
  const exists = selected.some((s) => s.id === supervisor.id);
  if (exists) {
    return selected.filter((s) => s.id !== supervisor.id);
  }
  return [...selected, supervisor];
};

export const isSupervisorSelected = (
  selected: Supervisor[],
  supervisor: Supervisor
): boolean => {
  return selected.some((s) => s.id === supervisor.id);
};

export const getSelectedSupervisorIds = (selected: Supervisor[]): number[] => {
  return selected.map((s) => s.id);
};

export const SUPERVISOR_MANAGEMENT_MESSAGES = {
  loginRequired: 'يجب تسجيل الدخول أولاً',
  loadingError: 'فشل تحميل البيانات',
  deletionSuccess: 'تم حذف المشرفين بنجاح',
  deletionError: 'فشل حذف المشرفين',
  confirmDelete: 'هل أنت متأكد من حذف المشرفين المحددين؟',
  sessionExpired: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
};

