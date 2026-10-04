"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  School,
  Users,
  Mail,
  Phone,
  Calendar,
  Search,
  Loader2,
  MoreVertical,
  Eye,
  UserX
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
  // Role counts for circular progress
  president_count?: number;
  supervisor_count?: number;
  teacher_count?: number;
  guardian_count?: number;
}

interface RoleStats {
  label: string;
  count: number;
  total: number;
  percentage: number;
  color: string;
}

export default function SchoolsManagementPage() {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = schools.filter(school => 
        school.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.president_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.email.toLowerCase().includes(searchQuery.toLowerCase())
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
      console.log("Schools API response:", data); // Debug log
      
      if (data && data.schools) {
        console.log(`Found ${data.schools.length} schools`); // Debug log
        setSchools(data.schools);
        setFilteredSchools(data.schools);
      } else {
        console.warn("Unexpected response structure:", data); // Debug log
        setSchools([]);
        setFilteredSchools([]);
      }
    } catch (err: any) {
      console.error("Error fetching schools:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      }); // Detailed debug log
      
      // More detailed error message
      if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          setError("غير مصرح لك بالوصول. الرجاء تسجيل الدخول كمسؤول.");
        } else if (err.response.status === 403) {
          setError("ليس لديك صلاحية الوصول إلى هذه الصفحة.");
        } else {
          setError(`خطأ في الخادم: ${err.response.status} - ${err.response.data?.detail || err.message}`);
        }
      } else if (err.request) {
        // Request made but no response
        setError("تعذر الاتصال بالخادم. تأكد من تشغيل الخادم.");
      } else {
        setError(`خطأ: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-DZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateRoleStats = (school: SchoolData): RoleStats[] => {
    const total = (school.president_count || 1) + 
                  (school.supervisor_count || 0) + 
                  (school.teacher_count || 0) + 
                  (school.guardian_count || 0) + 
                  school.student_count;

    return [
      {
        label: 'الرؤساء',
        count: school.president_count || 1,
        total,
        percentage: ((school.president_count || 1) / total) * 100,
        color: '#C8963E' // Golden
      },
      {
        label: 'المشرفين',
        count: school.supervisor_count || 0,
        total,
        percentage: ((school.supervisor_count || 0) / total) * 100,
        color: '#3b82f6' // Blue
      },
      {
        label: 'المعلمين',
        count: school.teacher_count || 0,
        total,
        percentage: ((school.teacher_count || 0) / total) * 100,
        color: '#10b981' // Emerald
      },
      {
        label: 'أولياء الأمور',
        count: school.guardian_count || 0,
        total,
        percentage: ((school.guardian_count || 0) / total) * 100,
        color: '#8b5cf6' // Purple
      },
      {
        label: 'الطلاب',
        count: school.student_count,
        total,
        percentage: (school.student_count / total) * 100,
        color: '#f59e0b' // Amber
      }
    ];
  };

  const CircularProgress = ({ percentage, color, size = 120 }: { percentage: number; color: string; size?: number }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</div>
            <div className="text-xs text-gray-500">مكتمل</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout title="إدارة المدارس" breadcrumb="لوحة التحكم / إدارة المدارس">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)', boxShadow: '0 10px 15px -3px rgba(200, 150, 62, 0.2)' }}>
              <School size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">إدارة المدارس</h2>
              <p className="text-sm text-gray-500">عرض وإدارة جميع المدارس المسجلة</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{schools.length}</div>
            <div className="text-sm text-gray-500">مدرسة مسجلة</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ابحث عن مدرسة، رئيس أو بريد إلكتروني..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-right"

            />
          </div>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C8963E' }} />
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <School size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">
                {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد مدارس مسجلة حالياً"}
              </p>
            </div>
          ) : (
            filteredSchools.map((school) => {
              const roleStats = calculateRoleStats(school);
              
              return (
                <div 
                  key={school.id} 
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                          style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}>
                          <School size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{school.school_name}</h3>
                          <p className="text-sm text-gray-500">{school.president_name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedSchool(school)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="عرض التفاصيل"
                      >
                        <MoreVertical size={20} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} className="text-gray-400" />
                        <span className="truncate">{school.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        <span>{school.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{formatDate(school.approval_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role Statistics with Circular Progress */}
                  <div className="p-6">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">توزيع الأدوار</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {roleStats.map((role, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <CircularProgress 
                            percentage={role.percentage} 
                            color={role.color}
                            size={85}
                          />
                          <div className="mt-3 text-center">
                            <p className="text-xs font-medium text-gray-700">{role.label}</p>
                            <p className="text-xs text-gray-500">{role.count} عضو</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedSchool(school)}
                      className="w-full px-4 py-2 rounded-lg font-medium transition-all text-sm"
                      style={{ color: '#C8963E', backgroundColor: 'rgba(200, 150, 62, 0.1)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(200, 150, 62, 0.15)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(200, 150, 62, 0.1)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Eye size={16} className="inline ml-1" />
                      عرض التفاصيل الكاملة
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* School Details Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}>
                  <School size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedSchool.school_name}</h3>
                  <p className="text-sm text-gray-500">تفاصيل المدرسة والرئيس</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* School Information */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <School size={16} style={{ color: '#C8963E' }} />
                  معلومات المدرسة
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-sm text-gray-500">اسم المدرسة</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedSchool.school_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">عدد الطلاب</span>
                    <span className="text-sm font-semibold" style={{ color: '#C8963E' }}>
                      {selectedSchool.student_count} طالب
                    </span>
                  </div>
                </div>
              </div>

              {/* President Information */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Users size={16} style={{ color: '#C8963E' }} />
                  معلومات الرئيس
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-sm text-gray-500">الاسم الكامل</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedSchool.president_name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-sm text-gray-500">البريد الإلكتروني</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedSchool.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-sm text-gray-500">رقم الهاتف</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedSchool.phone_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">تاريخ القبول</span>
                    <span className="text-sm font-semibold text-gray-900">{formatDate(selectedSchool.approval_date)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4">
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
