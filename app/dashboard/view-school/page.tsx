"use client";

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
}

export default function ViewSchoolSelectionPage() {
  const router = useRouter();
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
        setError("غير مصرح لك بالوصول. الرجاء تسجيل الدخول كمسؤول.");
      } else if (err.response?.status === 403) {
        setError("ليس لديك صلاحية الوصول إلى هذه الصفحة.");
      } else {
        setError("حدث خطأ أثناء تحميل المدارس.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSchool = (schoolId: number, schoolName: string) => {
    // Store selected school in session/local storage
    sessionStorage.setItem('admin_viewing_school', JSON.stringify({
      id: schoolId,
      name: schoolName,
      timestamp: new Date().toISOString()
    }));
    
    // Redirect to president view (home page) with the school context
    router.push(`/?school_id=${schoolId}`);
  };

  return (
    <AppLayout title="عرض مدرسة" breadcrumb="لوحة التحكم / عرض مدرسة">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto"
            style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}>
            <School size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">اختر مدرسة للعرض</h2>
            <p className="text-gray-500 mt-2">اختر المدرسة التي تريد عرض لوحة التحكم الخاصة بها</p>
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
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ابحث عن مدرسة أو رئيس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 text-right transition-all"
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
              {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد مدارس متاحة"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchools.map((school) => (
              <button
                key={school.id}
                onClick={() => handleSelectSchool(school.id, school.school_name)}
                className="bg-white rounded-xl border-2 border-gray-100 hover:border-yellow-500/50 p-6 text-right transition-all duration-300 hover:shadow-xl hover:scale-105 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" 
                        style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}>
                        <School size={24} className="text-white" />
                      </div>
                      <div className="text-right">
                        <h3 className="text-lg font-bold text-gray-900">{school.school_name}</h3>
                        <p className="text-sm text-gray-500">{school.president_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 pr-3">
                      <Users size={16} className="text-gray-400" />
                      <span>{school.student_count} طالب</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-gray-400 group-hover:text-yellow-600 transition-colors">
                    <ChevronLeft size={24} className="group-hover:translate-x-1 transition-transform" />
                  </div>
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
            <ArrowRight size={20} />
            العودة إلى لوحة التحكم
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
