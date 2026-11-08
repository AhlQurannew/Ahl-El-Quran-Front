"use client";

import { useAdminView } from '@/contexts/AdminViewContext';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  School,
  Search,
  Loader2,
  Eye,
  ArrowRight,
  Users,
  ChevronLeft
} from "lucide-react";
import adminAPI from "@/api/admin";
import { schoolImageSrc } from "@/app/API/admin";
import { t } from '@/i18n';

interface SchoolData {
  id: number;
  user_id: number;
  school_name: string;
  president_name: string;
  email: string;
  phone_number: string;
  student_count: number;
  approval_date: string | null;
  created_at: string | null;
  is_active: boolean;
  image_url?: string | null;
}

export default function ViewSchoolSelectionPage() {
  const router = useRouter();
  const { setSelectedSchool } = useAdminView();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = schools.filter(school => 
        school.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.president_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools(schools);
    }
  }, [searchQuery, schools]);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await adminAPI.getAllSchools();
      
      if (data && data.schools) {
        setSchools(data.schools);
        setFilteredSchools(data.schools);
      } else {
        setSchools([]);
        setFilteredSchools([]);
      }
    } catch (err: any) {
      console.error("Error fetching schools:", err);
      if (err.response?.status === 401) {
        setError(t("غير مصرح لك بالوصول. الرجاء تسجيل الدخول كمسؤول."));
      } else if (err.response?.status === 403) {
        setError(t("ليس لديك صلاحية الوصول إلى هذه الصفحة."));
      } else {
        setError(t("حدث خطأ أثناء تحميل المدارس."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Same entry path as the dashboard and «إدارة المدارس»: the shared admin-view context sets the
  // school before navigating, so the layout never sees an admin outside a school and bounces back.
  const handleSelectSchool = (schoolId: number, schoolName: string) => setSelectedSchool(schoolId, schoolName);

  return (
    <AppLayout title={t("عرض مدرسة")} breadcrumb={t("لوحة التحكم / عرض مدرسة")}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto"
            style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}>
            <School size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t("اختر مدرسة للعرض")}</h2>
            <p className="text-gray-500 mt-2">{t("اختر المدرسة التي تريد عرض لوحة التحكم الخاصة بها")}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute inset-s-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t("ابحث عن مدرسة أو رئيس...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-10 pe-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 text-start transition-all"
            />
          </div>
        </div>

        {/* Schools List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C8963E' }} />
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <School size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-400">
              {searchQuery ? t("لا توجد نتائج للبحث") : t("لا توجد مدارس متاحة")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchools.map((school) => (
              <button
                key={school.id}
                onClick={() => handleSelectSchool(school.id, school.school_name)}
                className="group overflow-hidden rounded-xl border-2 border-gray-100 bg-white text-start transition-all duration-300 hover:border-yellow-500/50 hover:shadow-xl"
              >
                <div className="relative h-36 overflow-hidden" style={school.image_url ? undefined : { background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}>
                  {school.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- image served by the API
                    <img src={schoolImageSrc(school.image_url) ?? ''} alt={school.school_name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <School size={44} className="text-white/80" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0 space-y-1.5">
                    <h3 className="truncate text-lg font-bold text-gray-900">{school.school_name}</h3>
                    <p className="truncate text-sm text-gray-500">{school.president_name}</p>
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} className="text-gray-400" aria-hidden="true" />
                      {school.student_count}{' '}{t("طالب")}
                    </p>
                  </div>
                  <ChevronLeft size={24} className="shrink-0 text-gray-400 transition-colors group-hover:text-yellow-600 ltr:-scale-x-100" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <ArrowRight className="ltr:-scale-x-100" size={20} />
            {t("العودة إلى لوحة التحكم")}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
