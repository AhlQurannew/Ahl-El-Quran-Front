'use client';

import React from 'react';
import { Bell, LogOut } from 'lucide-react';

interface TopbarProps {
  title: string;
  breadcrumb?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title, breadcrumb }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
      {/* Left: page title */}
      <div>
        {breadcrumb && (
          <p className="text-xs text-gray-400 mb-0.5">{breadcrumb}</p>
        )}
        <h1 className="text-base font-bold text-gray-900">{title}</h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Logout */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer">
          <LogOut size={16} />
          <span className="hidden sm:block">تسجيل الخروج</span>
        </button>
      </div>
    </header>
  );
};
