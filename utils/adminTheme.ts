import { useAuthStore } from '@/store/authStore';

/**
 * Admin-area identity: the administrator keeps the gold theme, an inspector (مفتش) gets indigo so the
 * two accounts are never confused. Inspectors have the same access except the site settings
 * (login page images) and inspector accounts.
 */
export const ADMIN_THEME = {
  admin: { primary: '#C8963E', dark: '#B8832E', soft: 'rgba(200, 150, 62, 0.1)', title: 'لوحة المسؤول', role: 'المسؤول' },
  inspector: { primary: '#4F46E5', dark: '#3730A3', soft: 'rgba(79, 70, 229, 0.1)', title: 'لوحة المفتش', role: 'مفتش' },
} as const;

export function useAdminTheme() {
  const role = useAuthStore((state) => state.user?.role);
  const isInspector = role === 'INSPECTOR';
  const theme = isInspector ? ADMIN_THEME.inspector : ADMIN_THEME.admin;
  return { isInspector, ...theme, gradient: `linear-gradient(to bottom right, ${theme.primary}, ${theme.dark})` };
}
