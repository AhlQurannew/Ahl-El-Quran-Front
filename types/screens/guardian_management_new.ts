import { Guardian } from './guardian.types';

export interface GuardianManagementNewState {
  guardians: GuardianInfoDialog[];
  filteredGuardians: GuardianInfoDialog[];
  selectedGuardians: GuardianInfoDialog[];
  isLoading: boolean;
  errorMessage: string | null;
  searchQuery: string;
}

export interface GuardianInfoDialog {
  guardian: {
    guardianId: number;
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth: string;
    job?: string;
  };
  contactInfo: {
    phoneNumber: string;
    email: string;
  };
  accountInfo: {
    accountId: number;
    username: string;
  };
  children: Array<{
    studentId?: number;
    firstNameAr?: string;
    lastNameAr?: string;
  }>;
}

export interface GuardianSearchFilter {
  query: string;
  relationship?: string;
  sortBy?: 'name' | 'date' | 'relationship';
}

export const filterGuardians = (
  guardians: GuardianInfoDialog[],
  searchQuery: string
): GuardianInfoDialog[] => {
  if (!searchQuery) return guardians;

  const lowerQuery = searchQuery.toLowerCase();
  return guardians.filter((guardian) => {
    const fullName = `${guardian.guardian.firstName} ${guardian.guardian.lastName}`.toLowerCase();
    const relationship = guardian.guardian.relationship?.toLowerCase() || '';
    return fullName.includes(lowerQuery) || relationship.includes(lowerQuery);
  });
};

export const toggleGuardianSelection = (
  selected: GuardianInfoDialog[],
  guardian: GuardianInfoDialog
): GuardianInfoDialog[] => {
  const exists = selected.some(
    (g) => g.accountInfo.accountId === guardian.accountInfo.accountId
  );
  if (exists) {
    return selected.filter((g) => g.accountInfo.accountId !== guardian.accountInfo.accountId);
  }
  return [...selected, guardian];
};

export const isGuardianSelected = (
  selected: GuardianInfoDialog[],
  guardian: GuardianInfoDialog
): boolean => {
  return selected.some((g) => g.accountInfo.accountId === guardian.accountInfo.accountId);
};

export const getSelectedGuardianIds = (selected: GuardianInfoDialog[]): number[] => {
  return selected.map((g) => g.accountInfo.accountId);
};

export const GUARDIAN_MANAGEMENT_MESSAGES = {
  loadingError: 'فشل تحميل البيانات',
  deletionSuccess: 'تم حذف الأوصياء بنجاح',
  deletionError: 'فشل حذف الأوصياء',
  confirmDelete: 'هل أنت متأكد من حذف الأوصياء المحددين؟',
};
