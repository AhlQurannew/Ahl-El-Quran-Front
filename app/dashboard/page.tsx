"use client";

import { useAuthStore } from '@/store/authStore';
import { addressed } from '@/utils/address';
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SchoolCard } from "@/components/SchoolCard";
import { useAdminView } from "@/contexts/AdminViewContext";
import {
  Shield,
  School,
  Loader2,
  ChevronLeft,
  PlusCircle,
  Eye,
  Images,
  Settings,
  ChartNoAxesCombined,
  MessageSquare,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import adminAPI, { PlatformStatistics } from "@/app/API/admin";
import authAPI from "@/app/API/auth";
import { PlatformOverview } from "@/components/dashboard/PlatformOverview";
import { AcademicsOverview } from "@/components/dashboard/AcademicsOverview";
import { t } from '@/i18n';
import { useAdminTheme } from '@/utils/adminTheme';

interface Statistics {
  total_schools: number;
  total_presidents: number;
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
  const [isMainAdmin, setIsMainAdmin] = useState<boolean | null>(null);

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
    authAPI.getCurrentAdmin()
      .then((me: { is_main?: boolean }) => setIsMainAdmin(!!me.is_main))
      .catch(() => setIsMainAdmin(false));
  }, []);

  const theme = useAdminTheme();
  useAuthStore((state) => state.user?.honorific); // re-render the greeting once it is known
  // Stays blank until the account is known, so the main admin never sees the other greeting first.
  const greeting = isMainAdmin === null
    ? '\u00a0'
    : isMainAdmin
      ? t("مرحباً بكم سيدنا الشيخ في لوحة التحكم")
      : addressed(theme.isInspector ? t("مرحباً بك في لوحة المفتش") : t("مرحباً بك في لوحة المسؤول"));
  const quickLinks: { href: string; label: string; hint: string; icon: React.ReactNode }[] = [
    {
      href: "/dashboard/analytics",
      label: t("لوحة التحليلات"),
      hint: t("مؤشرات تفاعلية وتقرير PDF احترافي"),
      icon: <ChartNoAxesCombined size={18} />,
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
      href: "/dashboard/messages",
      label: t("المحادثات"),
      hint: t("تواصل مع أي مدرسة من حسابك"),
      icon: <MessageSquare size={18} />,
    },
    ...(theme.isInspector ? [] : [{
      href: "/dashboard/admins",
      label: t("المسؤولون"),
      hint: t("إنشاء حسابات المسؤولين وإدارتها"),
      icon: <UserCog size={18} />,
    }]),
    ...(theme.isInspector ? [] : [{
      href: "/dashboard/inspectors",
      label: t("المفتشون"),
      hint: t("إنشاء حسابات المفتشين وإدارتها"),
      icon: <ShieldCheck size={18} />,
    }]),
    ...(theme.isInspector ? [] : [{
      href: "/dashboard/login-slides",
      label: t("صور صفحة الدخول"),
      hint: t("غيّر صورة الدخول أو أضف عرض شرائح"),
      icon: <Images size={18} />,
    }]),
    {
      href: "/dashboard/settings",
      label: t("الملف الشخصي والإعدادات"),
      hint: t("الصورة، البريد الإلكتروني وكلمة المرور"),
      icon: <Settings size={18} />,
    },
  ];

  return (
    <AppLayout title={theme.isInspector ? t("لوحة تحكم المفتش") : t("لوحة تحكم المسؤول")} breadcrumb={t("الرئيسية")}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-2xl p-6 text-white shadow-lg"
          style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.dark})` }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{greeting}</h2>
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
              style={{ color: theme.primary, backgroundColor: theme.soft }}>
              {t("عرض الكل")}
              <ChevronLeft className="ltr:-scale-x-100" size={16} />
            </button>
          </div>

          {isLoadingSchools ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primary }} />
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
        <PlatformOverview stats={platformStats} totals={stats} isLoading={isLoadingPlatform || isLoading} />

        {/* Specialities & exams across schools */}
        <AcademicsOverview />

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
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color: theme.primary }}>
                  {link.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-gray-800">{link.label}</span>
                  <span className="block truncate text-xs text-gray-500">{link.hint}</span>
                </span>
                <ChevronLeft size={16} className="ltr:-scale-x-100 text-gray-300 transition-colors group-hover:text-amber-600" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
