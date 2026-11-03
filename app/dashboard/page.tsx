"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SchoolCard } from "@/components/SchoolCard";
import { useAdminView } from "@/contexts/AdminViewContext";
import { 
  Users, 
  Shield,
  TrendingUp,
  School,
  CheckCircle,
  Loader2,
  ChevronLeft,
  PlusCircle,
  Eye,
  Images,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import adminAPI, { PlatformStatistics } from "@/app/API/admin";
import { PlatformOverview } from "@/components/dashboard/PlatformOverview";
import { t } from '@/i18n';

interface Statistics {
  total_schools: number;
  total_presidents: number;
  pending_requests: number;
  performance: number | null;
}

interface SchoolData {
  school_id: number;
  school_name: string;
  president_name: string;
  student_count: number;
  percentage: number;
}

interface SchoolsStatistics {
  total_students: number;
  schools: SchoolData[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { setSelectedSchool } = useAdminView();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [schoolsStats, setSchoolsStats] = useState<SchoolsStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  const [error, setError] = useState<string>("");
  const [platformStats, setPlatformStats] = useState<PlatformStatistics | null>(null);
  const [isLoadingPlatform, setIsLoadingPlatform] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        const data = await adminAPI.getAdminStatistics();
        setStats(data);
      } catch (err: unknown) {
        console.error("Error fetching statistics:", err);
        setError(t("تعذر تحميل الإحصاءات"));
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSchoolsStatistics = async () => {
      try {
        setIsLoadingSchools(true);
        const data = await adminAPI.getSchoolsStatistics(3);
        setSchoolsStats(data);
      } catch (err: unknown) {
        console.error("Error fetching schools statistics:", err);
      } finally {
        setIsLoadingSchools(false);
      }
    };

    fetchStatistics();
    fetchSchoolsStatistics();
    adminAPI.getPlatformStatistics()
      .then(setPlatformStats)
      .catch((err: unknown) => console.error("Error fetching platform statistics:", err))
      .finally(() => setIsLoadingPlatform(false));
  }, []);

  const pending = stats?.pending_requests ?? 0;
  const quickLinks: { href: string; label: string; hint: string; icon: React.ReactNode; badge?: number }[] = [
    {
      href: "/dashboard/approvals",
      label: t("قبول الرؤساء"),
      hint: pending > 0 ? t("{count} طلب بانتظار المراجعة", { count: pending }) : t("لا توجد طلبات معلقة"),
      icon: <CheckCircle size={18} />,
      badge: pending > 0 ? pending : undefined,
    },
    {
      href: "/dashboard/schools?new=1",
      label: t("إضافة مدرسة جديدة"),
      hint: t("إنشاء مدرسة وحساب مشرفها العام"),
      icon: <PlusCircle size={18} />,
    },
    {
      href: "/dashboard/schools",
      label: t("إدارة المدارس"),
      hint: stats ? t("{count} مدرسة مسجلة", { count: stats.total_schools }) : t("تعديل وحذف المدارس"),
      icon: <School size={18} />,
    },
    {
      href: "/dashboard/view-school",
      label: t("عرض مدرسة"),
      hint: t("ادخل إلى مدرسة لمتابعة طلابها وحلقاتها"),
      icon: <Eye size={18} />,
    },
    {
      href: "/dashboard/login-slides",
      label: t("صور صفحة الدخول"),
      hint: t("غيّر صورة الدخول أو أضف عرض شرائح"),
      icon: <Images size={18} />,
    },
    {
      href: "/dashboard/settings",
      label: t("الملف الشخصي والإعدادات"),
      hint: t("الصورة، البريد الإلكتروني وكلمة المرور"),
      icon: <Settings size={18} />,
    },
  ];

  return (
    <AppLayout title={t("لوحة تحكم المسؤول")} breadcrumb={t("الرئيسية")}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-2xl p-6 text-white shadow-lg"
          style={{ background: 'linear-gradient(to right, #C8963E, #B8832E)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t("مرحباً بك في لوحة المسؤول")}</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{t("إدارة المنصة والإشراف على المدارس")}</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield size={40} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Schools */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <School size={24} className="text-blue-600" />
              </div>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              ) : (
                <span className="text-2xl font-bold text-gray-900">{stats?.total_schools || 0}</span>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{t("إجمالي المدارس")}</h3>
            <p className="text-xs text-gray-400">{t("عدد المدارس المسجلة")}</p>
          </div>

          {/* Total Presidents */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-purple-600" />
              </div>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              ) : (
                <span className="text-2xl font-bold text-gray-900">{stats?.total_presidents || 0}</span>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{t("عدد الرؤساء")}</h3>
            <p className="text-xs text-gray-400">{t("الرؤساء المعتمدين")}</p>
          </div>

          {/* Pending Approvals */}
          <Link href="/dashboard/approvals">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(200, 150, 62, 0.1)' }}>
                  <CheckCircle size={24} style={{ color: '#C8963E' }} />
                </div>
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <span className="text-2xl font-bold text-gray-900">{stats?.pending_requests || 0}</span>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t("طلبات معلقة")}</h3>
              <p className="text-xs" style={{ color: '#C8963E' }}>{t("انقر للمراجعة")}</p>
            </div>
          </Link>

          {/* Performance */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">--</span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{t("معدل الأداء")}</h3>
            <p className="text-xs text-gray-400">{t("قريباً")}</p>
          </div>
        </div>

        {/* Schools Distribution Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t("توزيع الطلاب حسب المدارس")}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {schoolsStats?.total_students || 0}{' '}{t("طالب في المجموع")}
              </p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/schools')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors"
              style={{ color: '#C8963E', backgroundColor: 'rgba(200, 150, 62, 0.1)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(200, 150, 62, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(200, 150, 62, 0.1)'}>
              {t("عرض الكل")}
              <ChevronLeft className="ltr:-scale-x-100" size={16} />
            </button>
          </div>

          {isLoadingSchools ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C8963E' }} />
            </div>
          ) : schoolsStats && schoolsStats.schools.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {schoolsStats.schools.map((school) => (
                <SchoolCard
                  key={school.school_id}
                  schoolName={school.school_name}
                  presidentName={school.president_name}
                  studentCount={school.student_count}
                  percentage={school.percentage}
                  onClick={() => setSelectedSchool(school.school_id, school.school_name)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <School size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">{t("لا توجد مدارس مسجلة حالياً")}</p>
            </div>
          )}
        </div>

        {/* Platform at a glance */}
        <PlatformOverview stats={platformStats} isLoading={isLoadingPlatform} />

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t("روابط سريعة")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-xl border border-transparent bg-gray-50 px-4 py-3 transition-colors hover:border-amber-200 hover:bg-amber-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                  {link.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-gray-800">{link.label}</span>
                  <span className="block truncate text-xs text-gray-500">{link.hint}</span>
                </span>
                {link.badge ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#C8963E' }}>
                    {link.badge}
                  </span>
                ) : (
                  <ChevronLeft size={16} className="ltr:-scale-x-100 text-gray-300 transition-colors group-hover:text-amber-600" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
