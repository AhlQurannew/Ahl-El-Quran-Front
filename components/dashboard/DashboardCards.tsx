import { logout } from '@/utils/auth';
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck,
  BarChart3,
  FileText,
  CheckCircle2,
  Calendar,
  UserCheck,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import presidentAPI from '@/app/API/president';

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
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await presidentAPI.getStatisticsSummary();
        console.log('Dashboard stats received:', data); // Debug log
        setStats(data);
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        if (err.response?.status === 401) {
          logout(true);
          return;
        }
        setError(err.response?.data?.detail || err.message || 'فشل تحميل الإحصائيات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards: DashboardCard[] = [
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

  const actionCards: DashboardCard[] = [
    { title: 'حضور الطلاب', icon: <UserCheck className="w-16 h-16" />, href: '/attendance', variant: 'action' },
    { title: 'حضور المعلمين', icon: <ClipboardCheck className="w-16 h-16" />, href: '/teacher-attendance', variant: 'action' },
    { title: 'الخطة والمراجعة', icon: <Calendar className="w-16 h-16" />, href: '/memorization', variant: 'action' }
  ];

  const actionSmallIcons: React.ReactNode[] = [
    <UserCheck className="w-4 h-4" key="action-icon-0" />,
    <ClipboardCheck className="w-4 h-4" key="action-icon-1" />,
    <Calendar className="w-4 h-4" key="action-icon-2" />
  ];

  const reportCards: DashboardCard[] = [
    { title: 'التقارير', icon: <FileText className="w-16 h-16" />, href: '/reports', variant: 'report' },
    { title: 'الإحصائيات', icon: <BarChart3 className="w-16 h-16" />, href: '/statistics', variant: 'report' },
    { title: 'المتابعات (قريباً)', icon: <CheckCircle2 className="w-16 h-16" />, href: '#', variant: 'disabled' }
  ];

  const reportSmallIcons: React.ReactNode[] = [
    <FileText className="w-4 h-4" key="report-icon-0" />,
    <BarChart3 className="w-4 h-4" key="report-icon-1" />,
    <CheckCircle2 className="w-4 h-4" key="report-icon-2" />
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-md">
        <h2 className="text-white text-xl font-bold mb-2">مرحبا بكم في نظام أهل القرآن</h2>
        <p className="text-emerald-50 text-sm">
          مرحبا بك في نظام المتابعة، نتمنى لك أيام مديدة ومقبولة لك عند الله إيمانا واحتسابا
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 mb-3 px-1">الإحصائيات</h3>
        {isLoading ? (
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
