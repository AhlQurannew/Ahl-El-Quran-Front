/**
 * @file Sidebar.tsx
 * @description Main navigation sidebar component with role-based menu items
 * 
 * Features:
 * - Role-based navigation (different menu items for each user role)
 * - Collapsible sidebar (expand/collapse functionality)
 * - Mobile responsive (hamburger menu)
 * - Admin view mode indicator (shows banner when admin is viewing a school)
 * - Active link highlighting
 * - RTL support for Arabic layout
 * 
 * @author Ahl El Quran Team
 * @version 1.0.0
 */

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

/**
 * Navigation Item Interface
 * Defines the structure of a single navigation link
 */
interface NavItem {
  label: string;      // Display text (Arabic)
  href: string;       // Link URL
  icon: React.ReactNode; // Lucide icon component
}

/**
 * Navigation Group Interface
 * Groups related navigation items together (optional groupLabel for section titles)
 */
interface NavGroup {
  groupLabel?: string; // Optional section title
  items: NavItem[];    // Array of navigation items in this group
}

/**
 * Admin Navigation Configuration
 * 
 * Menu items shown to users with ADMIN role:
 * - Dashboard: System overview
 * - إدارة المدارس: Manage all schools in the system
 * - عرض مدرسة: View and manage a specific school (enables role override)
 */
const adminNavGroups: NavGroup[] = [
  {
    items: [
      { label: 'لوحة التحكم', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
      { label: 'إدارة المدارس', href: '/dashboard/schools', icon: <School size={18} /> },
      { label: 'عرض مدرسة', href: '/dashboard/view-school', icon: <BookOpen size={18} /> },
    ],
  },
];

/**
 * President (School Owner) Navigation Configuration
 * 
 * Menu items shown to users with PRESIDENT role:
 * - Dashboard: School overview and statistics
 * - الطلاب: Manage students
 * - المعلمون: Manage teachers
 * - المشرفون: Manage supervisors
 * - الحلقات: Manage lectures (study circles)
 * - الحضور: Attendance tracking
 * - الحفظ: Memorization tracking
 * - الرسائل: Internal messaging
 * - التقارير: Reports and analytics
 * - الإعدادات: School settings
 */
const presidentNavGroups: NavGroup[] = [
  {
    items: [
      { label: 'لوحة القيادة', href: '/', icon: <LayoutDashboard size={18} /> },
      { label: 'المشرفين', href: '/supervisors', icon: <UserCheck size={18} /> },
      { label: 'غرفة المحادثة', href: '/messages', icon: <MessageSquare size={18} /> },
      
    ],
  },
  {
    groupLabel: 'الشؤون الإدارية',
    items: [
      { label: 'الطلاب', href: '/students', icon: <Users size={18} /> },
      { label: 'المعلمين', href: '/teachers', icon: <UserCheck size={18} /> },
      { label: 'الحلقات', href: '/lectures', icon: <BookOpen size={18} /> },
      { label: 'الحفظ والمراجعة', href: '/memorization', icon: <GraduationCap size={18} /> },
      { label: 'الإحصاءات', href: '/statistics', icon: <LayoutDashboard size={18} /> },
      { label: 'التقارير', href: '/reports', icon: <BookOpen size={18} /> },
    ],
  },
];

// Teacher navigation - only what a teacher can access
// Supervisor navigation
const supervisorNavGroups: NavGroup[] = [
  {
    items: [
      { label: 'لوحة القيادة', href: '/', icon: <LayoutDashboard size={18} /> },
      { label: 'غرفة المحادثة', href: '/messages', icon: <MessageSquare size={18} /> },
      
    ],
  },
  {
    groupLabel: 'الشؤون الإدارية',
    items: [
      { label: 'الطلاب', href: '/students', icon: <Users size={18} /> },
      { label: 'المعلمين', href: '/teachers', icon: <UserCheck size={18} /> },
      { label: 'الحلقات', href: '/lectures', icon: <BookOpen size={18} /> },
      { label: 'الحفظ والمراجعة', href: '/memorization', icon: <GraduationCap size={18} /> },
      { label: 'الإحصاءات', href: '/statistics', icon: <LayoutDashboard size={18} /> },
      { label: 'التقارير', href: '/reports', icon: <BookOpen size={18} /> },
    ],
  },
];

const teacherNavGroups: NavGroup[] = [
  {
    items: [
      { label: 'لوحة القيادة', href: '/', icon: <LayoutDashboard size={18} /> },
      { label: 'غرفة المحادثة', href: '/messages', icon: <MessageSquare size={18} /> },
    ],
  },
  {
    groupLabel: 'الشؤون التعليمية',
    items: [
      { label: 'الطلاب', href: '/students', icon: <Users size={18} /> },
      { label: 'الحلقات', href: '/lectures', icon: <BookOpen size={18} /> },
      { label: 'حضور الطلاب', href: '/attendance', icon: <UserCheck size={18} /> },
      { label: 'الحفظ والمراجعة', href: '/memorization', icon: <GraduationCap size={18} /> },
    ],
  },
  {
    groupLabel: 'التقارير والإحصاءات',
    items: [
      { label: 'الإحصاءات', href: '/statistics', icon: <LayoutDashboard size={18} /> },
      { label: 'التقارير', href: '/reports', icon: <BookOpen size={18} /> },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isAdminViewing } = useAdminView();
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Determine if we're on admin pages (but not when viewing as school)
  const isAdmin = pathname.startsWith('/dashboard') && !isAdminViewing;
  
  // Determine if logged-in user is a teacher
  const isTeacher = user?.role === 'TEACHER';
  const isChiefSupervisor = user?.role === 'CHIEF_SUPERVISOR' || user?.role === 'PRESIDENT';
  const isSupervisor = user?.role === 'SUPERVISOR';

  // Choose navigation based on role
  const navGroups = isAdmin
    ? adminNavGroups
    : isTeacher
    ? teacherNavGroups
    : isSupervisor
    ? supervisorNavGroups
    : presidentNavGroups;

  // Set sidebar colors based on role:
  // - المشرف العام (CHIEF_SUPERVISOR / PRESIDENT): Deep Burgundy / Wine
  // - المشرف (SUPERVISOR): Emerald Green
  // - المعلم (TEACHER): Sky Blue
  // - المسؤول (ADMIN): Gold / Amber
  const sidebarGradient = isAdmin
    ? 'linear-gradient(to bottom, #C8963E, #B8832E)'
    : isChiefSupervisor
    ? 'linear-gradient(to bottom, #831843, #500724)'
    : isTeacher
    ? 'linear-gradient(to bottom, #0369a1, #075985)'
    : 'linear-gradient(to bottom, #047857, #064e3b)';

  const sidebarColor = isAdmin
    ? '#C8963E'
    : isChiefSupervisor
    ? '#831843'
    : isTeacher
    ? '#0369a1'
    : '#047857';

  // Get user display data
  const userName = user ? `${user.firstname} ${user.lastname}` : 'مستخدم';
  const userInitial = user?.firstname ? user.firstname.charAt(0).toUpperCase() : 'م';
  
  // Role labels in Arabic
  const roleLabels: Record<string, string> = {
    ADMIN: 'المسؤول',
    PRESIDENT: 'المشرف العام',
    CHIEF_SUPERVISOR: 'المشرف العام',
    SUPERVISOR: 'المشرف',
    TEACHER: 'المعلم',
    GUARDIAN: 'ولي الأمر',
    STUDENT: 'الطالب',
  };
  const userRole = user?.role ? roleLabels[user.role] : 'مستخدم';

  const renderNavContent = (isCollapsed = false) => (
    <nav className={cn('flex-1 overflow-y-auto overflow-x-hidden py-4 px-3', isCollapsed ? 'space-y-2' : 'space-y-6')}>
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.groupLabel && (
            <p
              aria-hidden={isCollapsed}
              className={cn(
                'overflow-hidden whitespace-nowrap px-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 ease-in-out',
                isCollapsed ? 'mb-0 max-h-0 opacity-0' : 'mb-2 max-h-6 opacity-100'
              )}
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
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
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out',
                      active
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'hover:bg-white/10',
                      isCollapsed && 'justify-center gap-0 px-2'
                    )}
                    style={{ color: active ? '#fff' : 'rgba(255, 255, 255, 0.85)' }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="flex shrink-0 items-center" style={{ color: active ? '#fff' : 'rgba(255, 255, 255, 0.7)' }}>
                      {item.icon}
                    </span>
                    <span
                      aria-hidden={isCollapsed}
                      className={cn(
                        'min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
                        isCollapsed ? 'max-w-0 opacity-0' : 'max-w-50 opacity-100'
                      )}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <ChevronRight
                        size={14}
                        aria-hidden="true"
                        className={cn('shrink-0 transition-all duration-300 ease-in-out', isCollapsed ? 'w-0 opacity-0' : 'opacity-60')}
                      />
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
          collapsed ? 'w-16' : 'w-60'
        )}
        style={{ background: sidebarGradient }}
      >
        {/* Branding and collapse control stay together in the sidebar header. */}
        <div className={cn(
          'flex min-h-18 items-center border-b border-white/10 transition-all duration-300 ease-in-out',
          collapsed ? 'justify-center px-2' : 'gap-3 px-4 py-4'
        )}>
          <div className={cn(
            'flex min-w-0 items-center gap-3 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
            collapsed ? 'max-w-0 flex-none opacity-0' : 'max-w-full flex-1 opacity-100'
          )} aria-hidden={collapsed}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
              {isAdmin ? <Shield size={18} className="text-white" /> : <BookOpen size={18} className="text-white" />}
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="whitespace-nowrap text-sm font-bold leading-tight text-white">
                {isAdmin ? 'لوحة المسؤول' : 'نظام أهل القرآن'}
              </p>
              <p className="whitespace-nowrap text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {isAdmin ? 'إدارة المنصة' : 'لوحة الإدارة'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            style={collapsed ? { backgroundColor: sidebarColor } : undefined}
            title={collapsed ? 'توسيع القائمة (Expand sidebar)' : 'طي القائمة (Collapse sidebar)'}
            aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
            aria-expanded={!collapsed}
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              <ChevronsRight
                size={16}
                aria-hidden="true"
                className={cn('absolute transition-all duration-200', collapsed ? 'scale-75 opacity-0' : 'opacity-100 group-hover:scale-110')}
              />
              <BookOpen
                size={16}
                aria-hidden="true"
                className={cn('absolute transition-opacity duration-200', collapsed ? 'opacity-100 group-hover:opacity-0 group-focus-visible:opacity-0' : 'opacity-0')}
              />
              <ChevronsLeft
                size={16}
                aria-hidden="true"
                className={cn('absolute transition-opacity duration-200', collapsed ? 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100' : 'opacity-0')}
              />
            </span>
          </button>
        </div>

        {renderNavContent(collapsed)}

        {/* User profile at bottom */}
        <div className={cn('border-t border-white/10 px-4 py-4', collapsed && 'px-2')}>
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center gap-0')}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-sm font-bold text-white ring-2 ring-white/30">
              {userInitial}
            </div>
            <div className={cn(
              'min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
              collapsed ? 'max-w-0 opacity-0' : 'max-w-45 opacity-100'
            )} aria-hidden={collapsed}>
              <p className="truncate text-sm font-semibold text-white">{userName}</p>
              <p className="truncate text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{userRole}</p>
            </div>
          </div>
        </div>
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
            {renderNavContent()}
          </aside>
        </>
      )}
    </>
  );
};
