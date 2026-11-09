'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { syncAuthCookies } from '@/utils/auth';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAdminView } from '@/contexts/AdminViewContext';
import { useAuthStore } from '@/store/authStore';
import accountSettingsAPI from '@/app/API/accountSettings';
import { X, Eye } from 'lucide-react';
import { t } from '@/i18n';

/** Pages a role never has in its menu; their APIs refuse it, so it should not land there. */
const BLOCKED_ROUTES: Record<string, string[]> = {
  TEACHER: ['/teachers', '/supervisors', '/guardians', '/teacher-attendance', '/track-memorization', '/dashboard'],
  SUPERVISOR: ['/supervisors', '/notes', '/dashboard'],
  CHIEF_SUPERVISOR: ['/notes', '/dashboard'],
};

const isBlockedRoute = (role: string | undefined, pathname: string) =>
  (BLOCKED_ROUTES[role ?? ''] ?? []).some((route) => pathname === route || pathname.startsWith(`${route}/`));

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, breadcrumb }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isResolved, isAdminSession, isAdminViewing, viewingSchoolName, exitAdminView } = useAdminView();
  const adminOutsideSchool = isResolved && isAdminSession && !pathname.startsWith('/dashboard') && !isAdminViewing;

  useEffect(() => {
    const verifySession = () => {
      const token = localStorage.getItem('access_token');
      const hasCookie = document.cookie.split('; ').some((cookie) => cookie.startsWith('access_token='));
      if (!token && !hasCookie) {
        window.location.replace('/login');
        return;
      }
      syncAuthCookies();
    };

    verifySession();
    window.addEventListener('pageshow', verifySession);
    window.addEventListener('popstate', verifySession);
    return () => {
      window.removeEventListener('pageshow', verifySession);
      window.removeEventListener('popstate', verifySession);
    };
  }, [pathname]);

  useEffect(() => {
    if (adminOutsideSchool) router.replace('/dashboard');
  }, [adminOutsideSchool, router]);

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const blocked = isResolved && !isAdminSession && isBlockedRoute(user?.role, pathname);

  useEffect(() => {
    if (blocked) router.replace('/');
  }, [blocked, router]);

  // Sessions opened before this preference existed, or just signed in, learn it once.
  useEffect(() => {
    if (!user || user.honorific !== undefined) return;
    accountSettingsAPI.getAccountSettings()
      .then((settings) => setUser({ ...user, honorific: settings.preferences?.honorific ?? null }))
      .catch(() => {});
  }, [user, setUser]);

  return (
    <div className="flex h-dvh bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Viewing Banner */}
        {isAdminViewing && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-2 shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Eye size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">{t("وضع عرض المسؤول")}</p>
                <p className="text-xs opacity-90">{t("تشاهد حالياً:")}{' '}{viewingSchoolName || t("مدرسة")}</p>
              </div>
            </div>
            <button
              onClick={exitAdminView}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <X size={16} />
              {t("العودة إلى لوحة المسؤول")}
            </button>
          </div>
        )}
        
        <Topbar title={title} breadcrumb={breadcrumb} />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6">
          {isResolved && !adminOutsideSchool && !blocked ? children : null}
        </main>
      </div>
    </div>
  );
};
