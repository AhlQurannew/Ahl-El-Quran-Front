export interface PendingPresident {
  id: number;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  details?: Record<string, unknown>;
}

export interface AdminDashboardState {
  pendingPresidents: PendingPresident[];
  isLoading: boolean;
  error: string | null;
  selectedPresidentId: number | null;
}

export interface AdminDashboardActions {
  fetchPendingPresidents: () => Promise<void>;
  approvePesident: (id: number) => Promise<void>;
  rejectPresident: (id: number, reason?: string) => Promise<void>;
  logout: () => void;
}

export interface LogoutDialogState {
  isConfirming: boolean;
  message: string;
}

export const ADMIN_COLORS = {
  primary: 'rgb(63, 81, 181)',
  surface: 'rgb(255, 255, 255)',
  error: 'rgb(244, 67, 54)',
  success: 'rgb(76, 175, 80)',
};

export const ADMIN_MESSAGES = {
  loading: 'جاري تحميل الطلبات...',
  noPending: 'لا توجد طلبات معلقة',
  allApproved: 'جميع الطلبات تمت الموافقة عليها',
  confirmLogout: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
  refreshTooltip: 'تحديث',
  logoutTooltip: 'تسجيل الخروج',
};
