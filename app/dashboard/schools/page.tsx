"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminView } from "@/contexts/AdminViewContext";
import { 
  School,
  Search,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Plus,
  X
} from "lucide-react";
import adminAPI from "@/app/API/admin";

interface SchoolData {
  id: number;
  user_id: number;
  school_name: string;
  president_name: string;
  email: string;
  phone_number: string;
  student_count: number;
  teacher_count?: number;
  supervisor_count?: number;
  is_active: boolean;
}

interface SchoolFormData {
  school_name: string;
  chief_supervisor_firstname: string;
  chief_supervisor_lastname: string;
  email: string;
  password: string;
  phone_number: string;
}

export default function SchoolsManagementPage() {
  const router = useRouter();
  const { setSelectedSchool: setAdminSchool } = useAdminView();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<SchoolFormData>({
    school_name: "",
    chief_supervisor_firstname: "",
    chief_supervisor_lastname: "",
    email: "",
    password: "",
    phone_number: ""
  });

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
      
      if (data && data.schools) {
        setSchools(data.schools);
        setFilteredSchools(data.schools);
      } else {
        setSchools([]);
        setFilteredSchools([]);
      }
    } catch (err: any) {
      console.error("Error fetching schools:", err);
      setError("فشل تحميل المدارس");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.school_name || !formData.chief_supervisor_firstname || !formData.chief_supervisor_lastname || 
        !formData.email || !formData.password) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await adminAPI.createSchool(formData);
      setShowCreateDialog(false);
      resetForm();
      fetchSchools();
    } catch (err: any) {
      setError(err.response?.data?.detail || "فشل إنشاء المدرسة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSchool) return;

    try {
      setIsSubmitting(true);
      setError("");
      const updateData: any = {};
      
      if (formData.school_name) updateData.school_name = formData.school_name;
      if (formData.chief_supervisor_firstname) updateData.chief_supervisor_firstname = formData.chief_supervisor_firstname;
      if (formData.chief_supervisor_lastname) updateData.chief_supervisor_lastname = formData.chief_supervisor_lastname;
      if (formData.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;
      if (formData.phone_number) updateData.phone_number = formData.phone_number;

      await adminAPI.updateSchool(selectedSchool.id, updateData);
      setShowEditDialog(false);
      resetForm();
      setSelectedSchool(null);
      fetchSchools();
    } catch (err: any) {
      setError(err.response?.data?.detail || "فشل تحديث المدرسة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSchool) return;

    try {
      setIsSubmitting(true);
      setError("");
      await adminAPI.deleteSchool(selectedSchool.id);
      setShowDeleteDialog(false);
      setSelectedSchool(null);
      fetchSchools();
    } catch (err: any) {
      setError(err.response?.data?.detail || "فشل حذف المدرسة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (school: SchoolData) => {
    setSelectedSchool(school);
    const [firstname, ...lastname] = school.president_name.split(" ");
    setFormData({
      school_name: school.school_name,
      chief_supervisor_firstname: firstname || "",
      chief_supervisor_lastname: lastname.join(" ") || "",
      email: school.email,
      password: "",
      phone_number: school.phone_number
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (school: SchoolData) => {
    setSelectedSchool(school);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      school_name: "",
      chief_supervisor_firstname: "",
      chief_supervisor_lastname: "",
      email: "",
      password: "",
      phone_number: ""
    });
    setError("");
  };

  const handleEnterSchool = (school: SchoolData) => {
    setAdminSchool(school.id, school.school_name);
    router.push('/');
  };

  return (
    <AppLayout title="إدارة المدارس" breadcrumb="لوحة التحكم / إدارة المدارس">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}>
              <School size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">إدارة المدارس</h2>
              <p className="text-sm text-gray-500">عرض وإدارة جميع المدارس المسجلة</p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowCreateDialog(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}
          >
            <Plus size={20} />
            إضافة مدرسة
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ابحث عن مدرسة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-right"
            />
          </div>
        </div>

        {/* Schools Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C8963E' }} />
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <School size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">
                {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد مدارس مسجلة حالياً"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600">اسم المدرسة</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600">الرئيس</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600">البريد الإلكتروني</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600">رقم الهاتف</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600">الطلاب</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{school.school_name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{school.president_name}</td>
                    <td className="px-6 py-4 text-gray-600">{school.email}</td>
                    <td className="px-6 py-4 text-gray-600">{school.phone_number}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {school.student_count} طالب
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEnterSchool(school)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="دخول المدرسة"
                        >
                          <Eye size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => openEditDialog(school)}
                          className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit size={18} className="text-yellow-600" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(school)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">إضافة مدرسة جديدة</h3>
                <button onClick={() => setShowCreateDialog(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="اسم المدرسة *"
                  value={formData.school_name}
                  onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="الاسم الأول (المشرف العام) *"
                    value={formData.chief_supervisor_firstname}
                    onChange={(e) => setFormData({...formData, chief_supervisor_firstname: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                  />
                  <input
                    type="text"
                    placeholder="اسم العائلة (المشرف العام) *"
                    value={formData.chief_supervisor_lastname}
                    onChange={(e) => setFormData({...formData, chief_supervisor_lastname: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                  />
                </div>
                <input
                  type="email"
                  placeholder="البريد الإلكتروني *"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                />
                <input
                  type="password"
                  placeholder="كلمة المرور *"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                />
                <input
                  type="tel"
                  placeholder="رقم الهاتف"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}
                >
                  {isSubmitting ? "جاري الإضافة..." : "إضافة"}
                </button>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        {showEditDialog && selectedSchool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">تعديل المدرسة</h3>
                <button onClick={() => setShowEditDialog(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="اسم المدرسة"
                  value={formData.school_name}
                  onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="الاسم الأول"
                    value={formData.president_firstname}
                    onChange={(e) => setFormData({...formData, president_firstname: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                  />
                  <input
                    type="text"
                    placeholder="اسم العائلة"
                    value={formData.president_lastname}
                    onChange={(e) => setFormData({...formData, president_lastname: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                  />
                </div>
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                />
                <input
                  type="password"
                  placeholder="كلمة مرور جديدة (اختياري)"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                />
                <input
                  type="tel"
                  placeholder="رقم الهاتف"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-right"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEdit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}
                >
                  {isSubmitting ? "جاري التحديث..." : "تحديث"}
                </button>
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Dialog */}
        {showDeleteDialog && selectedSchool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">تأكيد الحذف</h3>
                <button onClick={() => setShowDeleteDialog(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                هل أنت متأكد من حذف مدرسة <strong>{selectedSchool.school_name}</strong>؟ 
                سيتم حذف جميع البيانات المرتبطة بها (المعلمين، الطلاب، إلخ). هذا الإجراء لا يمكن التراجع عنه.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحذف..." : "حذف"}
                </button>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
