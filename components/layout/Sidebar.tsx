'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Shield,
  MessageSquare,
  Settings,
  ChevronRight,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { label: 'لوحة القيادة', href: '/', icon: <LayoutDashboard size={18} /> },
      { label: 'المشرفين', href: '/supervisors', icon: <UserCheck size={18} /> },
      { label: 'غرفة المحادثة', href: '/chat', icon: <MessageSquare size={18} /> },
      { label: 'الإعدادات', href: '/settings', icon: <Settings size={18} /> },
    ],
  },
  {
    groupLabel: 'الشؤون الإدارية',
    items: [
      { label: 'الطلاب', href: '/students', icon: <Users size={18} /> },
      { label: 'المعلمين', href: '/teachers', icon: <UserCheck size={18} /> },
      { label: 'أولياء الأمور', href: '/guardians', icon: <Shield size={18} /> },
      { label: 'الحلقات', href: '/halaqat', icon: <BookOpen size={18} /> },
      { label: 'الحفظ والمراجعة', href: '/memorization', icon: <GraduationCap size={18} /> },
      { label: 'الإحصاءات', href: '/statistics', icon: <LayoutDashboard size={18} /> },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.groupLabel && (
            <p className="text-xs font-bold text-emerald-300/70 uppercase tracking-widest px-3 mb-2">
              {group.groupLabel}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <span className={active ? 'text-white' : 'text-emerald-300/70'}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={14} className="opacity-60" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-gradient-to-b from-emerald-700 to-emerald-900 h-screen sticky top-0 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">نظام أهل القرآن</p>
            <p className="text-emerald-300/70 text-xs">لوحة الإدارة</p>
          </div>
        </div>

        <NavContent />

        {/* User profile at bottom */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 text-white font-bold text-sm ring-2 ring-white/30">
              ر
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">raouf fer</p>
              <p className="text-emerald-300/70 text-xs truncate">المشرف العام</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile: hamburger button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center text-white shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile: overlay sidebar */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed right-0 top-0 h-full w-64 bg-gradient-to-b from-emerald-700 to-emerald-900 z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <BookOpen size={16} className="text-white" />
                </div>
                <p className="text-white font-bold text-sm">نظام أهل القرآن</p>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <NavContent />
          </aside>
        </>
      )}
    </>
  );
};
