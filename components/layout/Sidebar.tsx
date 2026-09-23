'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  ChevronsRight,
  ChevronsLeft,
  School,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAdminView } from '@/contexts/AdminViewContext';
import { useAuthStore } from '@/store/authStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

// Admin navigation - empty for now, will be added as we go
const adminNavGroups: NavGroup[] = [
  {
    items: [
      { label: 'لوحة التحكم', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
      { label: 'قبول الرؤساء', href: '/dashboard/approvals', icon: <UserCheck size={18} /> },
      { label: 'إدارة المدارس', href: '/dashboard/schools', icon: <School size={18} /> },
      { label: 'بيانات المدرسة', href: '/dashboard/school-data', icon: <School size={18} /> },
      { label: 'عرض مدرسة', href: '/dashboard/view-school', icon: <BookOpen size={18} /> },
    ],
  },
];

// President navigation
const presidentNavGroups: NavGroup[] = [
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
      { label: 'الحلقات', href: '/lectures', icon: <BookOpen size={18} /> },
      { label: 'الحفظ والمراجعة', href: '/memorization', icon: <GraduationCap size={18} /> },
      { label: 'الإحصاءات', href: '/statistics', icon: <LayoutDashboard size={18} /> },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAdminViewing } = useAdminView();
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Determine if we're on admin pages (but not when viewing as school)
  const isAdmin = pathname.startsWith('/dashboard') && !isAdminViewing;
  
  // Choose navigation based on role - if admin is viewing, show president nav
  const navGroups = isAdmin ? adminNavGroups : presidentNavGroups;

  // Set sidebar colors based on role - if admin is viewing, use emerald green
  const sidebarGradient = isAdmin 
    ? 'linear-gradient(to bottom, #C8963E, #B8832E)' // Golden for admin
    : 'linear-gradient(to bottom, #047857, #064e3b)'; // Emerald green (700-900) for others
  
  const sidebarColor = isAdmin ? '#C8963E' : '#047857';

  // Get user display data
  const userName = user ? `${user.firstname} ${user.lastname}` : 'مستخدم';
  const userInitial = user?.firstname ? user.firstname.charAt(0).toUpperCase() : 'م';
  
  // Role labels in Arabic
  const roleLabels: Record<string, string> = {
    ADMIN: 'المسؤول',
    PRESIDENT: 'الرئيس',
    SUPERVISOR: 'المشرف',
    TEACHER: 'المعلم',
    GUARDIAN: 'ولي الأمر',
    STUDENT: 'الطالب',
  };
  const userRole = user?.role ? roleLabels[user.role] : 'مستخدم';

  const NavContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.groupLabel && !isCollapsed && (
            <p className="text-xs font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
                        : 'hover:bg-white/10',
                      isCollapsed && 'justify-center'
                    )}
                    style={{ color: active ? '#fff' : 'rgba(255, 255, 255, 0.85)' }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span style={{ color: active ? '#fff' : 'rgba(255, 255, 255, 0.7)' }}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {active && <ChevronRight size={14} className="opacity-60" />}
                      </>
                    )}
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
      <aside 
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-60'
        )}
        style={{ background: sidebarGradient }}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-3 px-5 py-5 border-b border-white/10 transition-all duration-300',
          collapsed && 'justify-center px-3'
        )}>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            {isAdmin ? <Shield size={18} className="text-white" /> : <BookOpen size={18} className="text-white" />}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">
                {isAdmin ? 'لوحة المسؤول' : 'نظام أهل القرآن'}
              </p>
              <p className="text-xs whitespace-nowrap" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {isAdmin ? 'إدارة المنصة' : 'لوحة الإدارة'}
              </p>
            </div>
          )}
        </div>

        <NavContent isCollapsed={collapsed} />

        {/* User profile at bottom */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className={cn(
            'flex items-center gap-3',
            collapsed && 'justify-center'
          )}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 text-white font-bold text-sm ring-2 ring-white/30">
              {userInitial}
            </div>
            {!collapsed && (
              <div className="min-w-0 overflow-hidden">
                <p className="text-white text-sm font-semibold truncate">{userName}</p>
                <p className="text-xs truncate" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{userRole}</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse/Expand Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'absolute -left-4 top-20 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 border-2 border-white/20 hover:border-white/40 z-50',
            'group'
          )}
          style={{ backgroundColor: sidebarColor }}
          title={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {collapsed ? (
            <ChevronsLeft size={16} className="transition-transform group-hover:scale-110" />
          ) : (
            <ChevronsRight size={16} className="transition-transform group-hover:scale-110" />
          )}
        </button>
      </aside>

      {/* Mobile: hamburger button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
        style={{ backgroundColor: sidebarColor }}
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
          <aside className="lg:hidden fixed right-0 top-0 h-full w-64 z-50 flex flex-col shadow-2xl"
            style={{ background: sidebarGradient }}>
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  {isAdmin ? <Shield size={16} className="text-white" /> : <BookOpen size={16} className="text-white" />}
                </div>
                <p className="text-white font-bold text-sm">
                  {isAdmin ? 'لوحة المسؤول' : 'نظام أهل القرآن'}
                </p>
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
