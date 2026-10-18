'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, School, X, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAdminView } from '@/contexts/AdminViewContext';
import { logout } from '@/utils/auth';

interface TopbarProps {
  title: string;
  breadcrumb?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title, breadcrumb }) => {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { isAdminViewing, viewingSchoolName, exitAdminView } = useAdminView();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
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

      {/* Admin Viewing School Banner */}
      {isAdminViewing && viewingSchoolName && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <School size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium opacity-90">عرض المسؤول - إدارة المدرسة</p>
              <p className="text-sm font-bold">{viewingSchoolName}</p>
            </div>
          </div>

          <button
            onClick={exitAdminView}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
          >
            <ArrowRight size={16} />
            <span className="hidden sm:inline">العودة للوحة التحكم</span>
            <span className="sm:hidden">عودة</span>
          </button>
        </div>
      )}
    </>
  );
};
