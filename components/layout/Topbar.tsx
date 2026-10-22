'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { useAdminView } from '@/contexts/AdminViewContext';
import { logout } from '@/utils/auth';

interface TopbarProps {
  title: string;
  breadcrumb?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title, breadcrumb }) => {
  const { isAdminViewing } = useAdminView();

  const handleLogout = () => {
    logout();
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

          {/* Logout - disabled when admin is viewing a school */}
          <button 
            onClick={handleLogout}
            disabled={isAdminViewing}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              isAdminViewing
                ? 'text-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 cursor-pointer'
            }`}
            title={isAdminViewing ? 'استخدم زر "العودة للوحة التحكم" للخروج من عرض المدرسة' : 'تسجيل الخروج'}
          >
            <LogOut size={16} />
            <span className="hidden sm:block">تسجيل الخروج</span>
          </button>
        </div>
    </header>
  );
};
