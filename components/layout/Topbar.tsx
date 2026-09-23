'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface TopbarProps {
  title: string;
  breadcrumb?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title, breadcrumb }) => {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isAdminViewingSchool, setIsAdminViewingSchool] = useState(false);

  useEffect(() => {
    // Check if admin is viewing a school
    if (typeof window !== 'undefined') {
      const adminViewData = sessionStorage.getItem('admin_viewing_school');
      setIsAdminViewingSchool(!!adminViewData);
    }
  }, []);

  const handleLogout = () => {
    // Clear auth store
    clearAuth();

    // Clear all tokens from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token');
      localStorage.removeItem('jwt');
      sessionStorage.removeItem('admin_viewing_school');
    }

    // Redirect to login page
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 pr-16 lg:pr-6 shrink-0 sticky top-0 z-20">
      {/* Left: page title */}
      <div className="min-w-0">
        {breadcrumb && (
          <p className="text-xs text-gray-400 mb-0.5 hidden sm:block truncate">{breadcrumb}</p>
        )}
        <h1 className="text-base font-bold text-gray-900 truncate">{title}</h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Logout - disabled when admin is viewing a school */}
        <button 
          onClick={handleLogout}
          disabled={isAdminViewingSchool}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            isAdminViewingSchool
              ? 'text-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 cursor-pointer'
          }`}
          title={isAdminViewingSchool ? 'استخدم زر "الخروج" من شريط العرض للعودة إلى لوحة الإدارة' : 'تسجيل الخروج'}
        >
          <LogOut size={16} />
          <span className="hidden sm:block">تسجيل الخروج</span>
        </button>
      </div>
    </header>
  );
};
