'use client';

import { logout } from '@/utils/auth';
import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck,
  BarChart3,
  FileText,
  Calendar,
  UserCheck,
  MessageSquare,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import type { AxiosError } from 'axios';
import presidentAPI from '@/app/API/president';
import teacherAPI from '@/app/API/teacher';
import { useAuthStore } from '@/store/authStore';
import { useAdminView } from '@/contexts/AdminViewContext';

interface DashboardCard {
  title: string;
  count?: number;
  icon: React.ReactNode;
  href: string;
  variant: 'stat' | 'action' | 'report' | 'disabled';
}

interface StatsSummary {
  total_students: number;
  total_teachers: number;
  total_supervisors: number;
  present_today: number;
  total_pages_memorized: number;
  total_lectures: number;
}

export function DashboardCards() {
  const user = useAuthStore((state) => state.user);
  const { isResolved: isAdminViewResolved, isAdminViewing, viewingSchoolId } = useAdminView();
  const isTeacher = user?.role === 'TEACHER';
  const isChiefSupervisor = user?.role === 'CHIEF_SUPERVISOR' || user?.role === 'PRESIDENT';
  const isSupervisor = user?.role === 'SUPERVISOR';

  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const invalidSchoolContext = isAdminViewResolved && isAdminViewing && !viewingSchoolId;

  useEffect(() => {
    if (!isAdminViewResolved) return;

    if (isAdminViewing && !viewingSchoolId) return;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        let data: StatsSummary;
        if (isTeacher) {
          data = await teacherAPI.getTeacherStatsSummary();
        } else {
          data = await presidentAPI.getStatisticsSummary(isAdminViewing ? viewingSchoolId! : undefined);
        }
        console.log('Dashboard stats received:', data);
        setStats(data);
      } catch (err: unknown) {
        const requestError = err as AxiosError<{ detail?: string }>;
        console.error('Error fetching dashboard stats:', err);
        if (requestError.response?.status === 401) {
          logout(true);
          return;
        }
        setError(requestError.response?.data?.detail || requestError.message || 'فشل تحميل الإحصائيات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAdminViewResolved, isAdminViewing, isTeacher, viewingSchoolId]);

  const statsCards: DashboardCard[] = isTeacher ? [
    { title: 'الطلاب', count: stats?.total_students || 0, icon: <GraduationCap className="w-16 h-16" />, href: '/students', variant: 'stat' },
    { title: 'الحلقات', count: stats?.total_lectures || 0, icon: <BookOpen className="w-16 h-16" />, href: '/lectures', variant: 'stat' },
  ] : isSupervisor ? [
    { title: 'الطلاب', count: stats?.total_students || 0, icon: <GraduationCap className="w-16 h-16" />, href: '/students', variant: 'stat' },
    { title: 'المعلمين', count: stats?.total_teachers || 0, icon: <Users className="w-16 h-16" />, href: '/teachers', variant: 'stat' },
    { title: 'الحلقات', count: stats?.total_lectures || 0, icon: <BookOpen className="w-16 h-16" />, href: '/lectures', variant: 'stat' }
  ] : [
    { title: 'الطلاب', count: stats?.total_students || 0, icon: <GraduationCap className="w-16 h-16" />, href: '/students', variant: 'stat' },
    { title: 'المعلمين', count: stats?.total_teachers || 0, icon: <Users className="w-16 h-16" />, href: '/teachers', variant: 'stat' },
    { title: 'المشرفين', count: stats?.total_supervisors || 0, icon: <UserCheck className="w-16 h-16" />, href: '/supervisors', variant: 'stat' },
    { title: 'الحلقات', count: stats?.total_lectures || 0, icon: <BookOpen className="w-16 h-16" />, href: '/lectures', variant: 'stat' }
  ];

  const statsSmallIcons: React.ReactNode[] = [
    <GraduationCap className="w-4 h-4" key="stat-icon-0" />,
    <Users className="w-4 h-4" key="stat-icon-1" />,
    <UserCheck className="w-4 h-4" key="stat-icon-2" />,
    <BookOpen className="w-4 h-4" key="stat-icon-3" />
  ];

  const actionCards: DashboardCard[] = isTeacher ? [
    { title: 'حضور الطلاب', icon: <UserCheck className="w-16 h-16" />, href: '/attendance', variant: 'action' },
    { title: 'الخطة والمراجعة', icon: <Calendar className="w-16 h-16" />, href: '/memorization', variant: 'action' },
    { title: 'غرفة المحادثة', icon: <MessageSquare className="w-16 h-16" />, href: '/messages', variant: 'action' },
  ] : [
    { title: 'حضور الطلاب', icon: <UserCheck className="w-16 h-16" />, href: '/attendance', variant: 'action' },
    { title: 'حضور المعلمين', icon: <ClipboardCheck className="w-16 h-16" />, href: '/teacher-attendance', variant: 'action' },
    { title: 'الخطة والمراجعة', icon: <Calendar className="w-16 h-16" />, href: '/memorization', variant: 'action' },
    { title: 'أولياء الأمور', icon: <Users className="w-16 h-16" />, href: '/guardians', variant: 'action' }
  ];

  const actionSmallIcons: React.ReactNode[] = [
    <UserCheck className="w-4 h-4" key="action-icon-0" />,
    <ClipboardCheck className="w-4 h-4" key="action-icon-1" />,
    <Calendar className="w-4 h-4" key="action-icon-2" />,
    <Users className="w-4 h-4" key="action-icon-3" />
  ];

  const reportCards: DashboardCard[] = [
    { title: 'التقارير', icon: <FileText className="w-16 h-16" />, href: '/reports', variant: 'report' },
    { title: 'الإحصائيات', icon: <BarChart3 className="w-16 h-16" />, href: '/statistics', variant: 'report' },
    { title: 'غرفة المحادثة', icon: <MessageSquare className="w-16 h-16" />, href: '/messages', variant: 'report' }
  ];

  const reportSmallIcons: React.ReactNode[] = [
    <FileText className="w-4 h-4" key="report-icon-0" />,
    <BarChart3 className="w-4 h-4" key="report-icon-1" />,
    <MessageSquare className="w-4 h-4" key="report-icon-2" />
  ];

  const bannerGradient = isChiefSupervisor
    ? 'from-[#831843] to-[#500724]'
    : isTeacher
    ? 'from-sky-700 to-sky-800'
    : 'from-emerald-500 to-emerald-600';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={`bg-gradient-to-l ${bannerGradient} rounded-xl p-6 shadow-md`}>
        <h2 className="text-white text-xl font-bold mb-2">مرحبا بكم في نظام أهل القرآن</h2>
        <p className="text-white/90 text-sm">
          مرحبا بك في نظام المتابعة، نتمنى لك أيام مديدة ومقبولة لك عند الله إيمانا واحتسابا
        </p>
      </div>


      {/* Statistics Cards */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 mb-3 px-1">الإحصائيات</h3>
        {invalidSchoolContext ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            لم يتم إرسال طلب الإحصائيات لعدم توفر معرّف المدرسة.
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            تعذر تحميل إحصائيات لوحة القيادة: {error}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="relative bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-5 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden h-24"
              >
                <div className="relative z-10 flex items-center justify-between h-full text-white">
                  <div className="flex items-center gap-4">
                    <p className="text-3xl font-bold">{card.count}</p>
                    <div className="flex items-center gap-2">
                      {statsSmallIcons[index]}
                      <p className="text-base font-semibold opacity-95">{card.title}</p>
                    </div>
                  </div>
                  <div className="opacity-25 transition-opacity duration-300">
                    {card.icon}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 mb-3 px-1">الإجراءات السريعة</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actionCards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden h-28"
            >
              <div className="relative z-10 flex items-center justify-between h-full text-white">
                <div className="flex items-center gap-2">
                  {actionSmallIcons[index]}
                  <p className="text-base font-semibold">{card.title}</p>
                </div>
                <div className="opacity-25 transition-opacity duration-300">
                  {card.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Report Cards */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 mb-3 px-1">التقارير والمتابعة</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportCards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className={`
                relative rounded-xl p-5 shadow-md transition-all duration-200 group overflow-hidden h-24
                ${card.variant === 'disabled'
                  ? 'bg-gradient-to-br from-gray-400 to-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-br from-amber-400 to-amber-500 hover:shadow-lg transform hover:-translate-y-0.5'
                }
              `}
            >
              <div className="relative z-10 flex items-center justify-between h-full text-white">
                <div className="flex items-center gap-2">
                  {reportSmallIcons[index]}
                  <p className="text-base font-bold">{card.title}</p>
                </div>
                <div className="opacity-25 transition-opacity duration-300">
                  {card.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
