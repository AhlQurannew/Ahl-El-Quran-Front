'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { syncAuthCookies } from '@/utils/auth';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAdminView } from '@/contexts/AdminViewContext';
import { X, Eye } from 'lucide-react';

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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Viewing Banner */}
        {isAdminViewing && (
          <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-3 flex items-center justify-between shadow-lg z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Eye size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">وضع عرض المسؤول</p>
                <p className="text-xs opacity-90">تشاهد حالياً: {viewingSchoolName || 'مدرسة'}</p>
              </div>
            </div>
            <button
              onClick={exitAdminView}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <X size={16} />
              العودة إلى لوحة المسؤول
            </button>
          </div>
        )}
        
        <Topbar title={title} breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-y-auto p-6">
          {isResolved && !adminOutsideSchool ? children : null}
        </main>
      </div>
    </div>
  );
};
