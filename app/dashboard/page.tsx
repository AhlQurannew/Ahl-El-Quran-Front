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
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import adminAPI from "@/app/API/admin";

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

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        const data = await adminAPI.getAdminStatistics();
        setStats(data);
      } catch (err: unknown) {
        console.error("Error fetching statistics:", err);
        setError("تعذر تحميل الإحصاءات");
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
  }, []);

  return (
    <AppLayout title="لوحة تحكم المسؤول" breadcrumb="الرئيسية">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-2xl p-6 text-white shadow-lg"
          style={{ background: 'linear-gradient(to right, #C8963E, #B8832E)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">مرحباً بك في لوحة المسؤول</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>إدارة المنصة والإشراف على المدارس</p>
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
            <h3 className="text-sm font-medium text-gray-500 mb-1">إجمالي المدارس</h3>
            <p className="text-xs text-gray-400">عدد المدارس المسجلة</p>
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
            <h3 className="text-sm font-medium text-gray-500 mb-1">عدد الرؤساء</h3>
            <p className="text-xs text-gray-400">الرؤساء المعتمدين</p>
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
              <h3 className="text-sm font-medium text-gray-500 mb-1">طلبات معلقة</h3>
              <p className="text-xs" style={{ color: '#C8963E' }}>انقر للمراجعة</p>
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
            <h3 className="text-sm font-medium text-gray-500 mb-1">معدل الأداء</h3>
            <p className="text-xs text-gray-400">قريباً</p>
          </div>
        </div>

        {/* Schools Distribution Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">توزيع الطلاب حسب المدارس</h3>
              <p className="text-sm text-gray-500 mt-1">
                {schoolsStats?.total_students || 0} طالب في المجموع
              </p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/schools')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors"
              style={{ color: '#C8963E', backgroundColor: 'rgba(200, 150, 62, 0.1)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(200, 150, 62, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(200, 150, 62, 0.1)'}>
              عرض الكل
              <ChevronLeft size={16} />
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
              <p className="text-sm">لا توجد مدارس مسجلة حالياً</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">روابط سريعة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/dashboard/approvals">
              <button className="w-full text-right px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium text-gray-700 flex items-center gap-3">
                <CheckCircle size={18} style={{ color: '#C8963E' }} />
                قبول الرؤساء
                {!isLoading && stats && stats.pending_requests > 0 && (
                  <span className="mr-auto px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#C8963E' }}>
                    {stats.pending_requests}
                  </span>
                )}
              </button>
            </Link>
            <Link href="/dashboard/schools">
              <button className="w-full text-right px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium text-gray-700 flex items-center gap-3">
                <School size={18} className="text-gray-500" />
                إدارة المدارس
              </button>
            </Link>
            <button className="w-full text-right px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium text-gray-700 flex items-center gap-3">
              <TrendingUp size={18} className="text-gray-500" />
              التقارير والإحصاءات
            </button>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">ℹ</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">لوحة المسؤول</h4>
              <p className="text-sm text-blue-700">
                استخدم القائمة الجانبية للتنقل بين الأقسام المختلفة. سيتم إضافة المزيد من الميزات قريباً.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
