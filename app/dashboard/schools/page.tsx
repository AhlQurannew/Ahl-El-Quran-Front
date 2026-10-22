"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminView } from "@/contexts/AdminViewContext";
import { 
  School,
  Search,
  Loader2,
  Eye,
  EyeOff,
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

function getRequestErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as {
    response?: { status?: number; data?: { detail?: unknown } };
  };
  const detail = apiError.response?.data?.detail;

  if (typeof detail === "string") {
    const knownMessages: Record<string, string> = {
      "Email already exists": "هذا البريد الإلكتروني مستخدم بالفعل. استخدم بريداً آخر.",
      "Email is already in use": "هذا البريد الإلكتروني مستخدم بالفعل. استخدم بريداً آخر.",
    };
    return knownMessages[detail] ?? detail;
  }

  if (apiError.response?.status === 422) return "تحقق من البيانات المدخلة وحاول مرة أخرى.";
  return fallback;
}

export default function SchoolsManagementPage() {
  const { setSelectedSchool: setAdminSchool } = useAdminView();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [createError, setCreateError] = useState<string>("");
  const [editError, setEditError] = useState<string>("");
  const [deleteError, setDeleteError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<SchoolFormData>({
    school_name: "",
    chief_supervisor_firstname: "",
    chief_supervisor_lastname: "",
    email: "",
    password: "",
    phone_number: ""
  });

  const fetchSchools = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await adminAPI.getAllSchools();
      
      if (data && data.schools) {
        setSchools(data.schools);
      } else {
        setSchools([]);
      }
    } catch (requestError: unknown) {
      console.error("Error fetching schools:", requestError);
      setError("فشل تحميل المدارس");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredSchools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return schools;
    return schools.filter((school) =>
      school.school_name.toLowerCase().includes(query) ||
      school.president_name.toLowerCase().includes(query) ||
      school.email.toLowerCase().includes(query)
    );
  }, [searchQuery, schools]);

  useEffect(() => {
    void Promise.resolve().then(fetchSchools);
  }, [fetchSchools]);

  const handleCreate = async () => {
    if (!formData.school_name.trim() || !formData.chief_supervisor_firstname.trim() || !formData.chief_supervisor_lastname.trim() ||
        !formData.email.trim() || !formData.password) {
      setCreateError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const normalizedEmail = formData.email.trim().toLowerCase();
    if (schools.some((school) => school.email.trim().toLowerCase() === normalizedEmail)) {
      setCreateError("هذا البريد الإلكتروني مستخدم بالفعل. استخدم بريداً آخر.");
      return;
    }

    try {
      setIsSubmitting(true);
      setCreateError("");
      await adminAPI.createSchool({
        ...formData,
        school_name: formData.school_name.trim(),
        chief_supervisor_firstname: formData.chief_supervisor_firstname.trim(),
        chief_supervisor_lastname: formData.chief_supervisor_lastname.trim(),
        email: normalizedEmail,
        phone_number: formData.phone_number.trim(),
      });
      setShowCreateDialog(false);
      resetForm();
      fetchSchools();
    } catch (requestError: unknown) {
      setCreateError(getRequestErrorMessage(requestError, "فشل إنشاء المدرسة"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSchool) return;

    try {
      setIsSubmitting(true);
      setEditError("");
      const updateData: Partial<SchoolFormData> = {};
      
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
    } catch (requestError: unknown) {
      setEditError(getRequestErrorMessage(requestError, "فشل تحديث المدرسة"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSchool) return;

    try {
      setIsSubmitting(true);
      setDeleteError("");
      await adminAPI.deleteSchool(selectedSchool.id);
      setShowDeleteDialog(false);
      setSelectedSchool(null);
      fetchSchools();
    } catch (requestError: unknown) {
      setDeleteError(getRequestErrorMessage(requestError, "فشل حذف المدرسة"));
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
    setEditError("");
    setShowEditDialog(true);
  };

  const openDeleteDialog = (school: SchoolData) => {
    setSelectedSchool(school);
    setDeleteError("");
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
    setCreateError("");
    setEditError("");
    setDeleteError("");
  };

  const handleEnterSchool = (school: SchoolData) => {
    setAdminSchool(school.id, school.school_name);
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-labelledby="create-school-title" className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 id="create-school-title" className="text-xl font-bold text-gray-900">إضافة مدرسة جديدة</h3>
                <button aria-label="إغلاق" onClick={() => setShowCreateDialog(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              {createError && (
                <div role="alert" aria-live="assertive" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">اسم المدرسة <span className="text-red-500">*</span>
                  <input type="text" autoComplete="organization" placeholder="مثال: مدرسة النور" value={formData.school_name} onChange={(e) => setFormData({...formData, school_name: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">الاسم الأول للمشرف العام <span className="text-red-500">*</span>
                    <input type="text" autoComplete="given-name" placeholder="مثال: أحمد" value={formData.chief_supervisor_firstname} onChange={(e) => setFormData({...formData, chief_supervisor_firstname: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">اسم العائلة للمشرف العام <span className="text-red-500">*</span>
                    <input type="text" autoComplete="family-name" placeholder="مثال: اليعقوبي" value={formData.chief_supervisor_lastname} onChange={(e) => setFormData({...formData, chief_supervisor_lastname: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                </div>
                <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني <span className="text-red-500">*</span>
                  <input type="email" autoComplete="email" dir="ltr" placeholder="name@example.com" value={formData.email} onChange={(e) => { setFormData({...formData, email: e.target.value}); setCreateError(""); }} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <label className="block text-sm font-medium text-gray-700">كلمة المرور <span className="text-red-500">*</span>
                  <span className="relative mt-1.5 block">
                    <input type={showCreatePassword ? "text" : "password"} autoComplete="new-password" placeholder="أدخل كلمة مرور للمشرف" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pl-12 text-right focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <button type="button" aria-label={showCreatePassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} aria-pressed={showCreatePassword} onClick={() => setShowCreatePassword((visible) => !visible)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                      {showCreatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>
                <label className="block text-sm font-medium text-gray-700">رقم الهاتف <span className="font-normal text-gray-400">(اختياري)</span>
                  <input type="tel" autoComplete="tel" dir="ltr" placeholder="مثال: 0555 123 456" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-labelledby="edit-school-title" className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 id="edit-school-title" className="text-xl font-bold text-gray-900">تعديل المدرسة</h3>
                <button aria-label="إغلاق" onClick={() => setShowEditDialog(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              {editError && (
                <div role="alert" aria-live="assertive" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {editError}
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">اسم المدرسة
                  <input type="text" autoComplete="organization" placeholder="اسم المدرسة" value={formData.school_name} onChange={(e) => setFormData({...formData, school_name: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">الاسم الأول للمشرف العام
                    <input type="text" autoComplete="given-name" placeholder="الاسم الأول" value={formData.chief_supervisor_firstname} onChange={(e) => setFormData({...formData, chief_supervisor_firstname: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">اسم العائلة للمشرف العام
                    <input type="text" autoComplete="family-name" placeholder="اسم العائلة" value={formData.chief_supervisor_lastname} onChange={(e) => setFormData({...formData, chief_supervisor_lastname: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                </div>
                <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني
                  <input type="email" autoComplete="email" dir="ltr" placeholder="name@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <label className="block text-sm font-medium text-gray-700">كلمة مرور جديدة <span className="font-normal text-gray-400">(اختياري)</span>
                  <span className="relative mt-1.5 block">
                    <input type={showEditPassword ? "text" : "password"} autoComplete="new-password" placeholder="اتركها فارغة دون تغيير" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pl-12 text-right focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <button type="button" aria-label={showEditPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} aria-pressed={showEditPassword} onClick={() => setShowEditPassword((visible) => !visible)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                      {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>
                <label className="block text-sm font-medium text-gray-700">رقم الهاتف <span className="font-normal text-gray-400">(اختياري)</span>
                  <input type="tel" autoComplete="tel" dir="ltr" placeholder="مثال: 0555 123 456" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">تأكيد الحذف</h3>
                <button onClick={() => setShowDeleteDialog(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              {deleteError && (
                <div role="alert" aria-live="assertive" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {deleteError}
                </div>
              )}

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
