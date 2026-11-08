"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSearchParams } from "next/navigation";
import { useAdminView } from "@/contexts/AdminViewContext";
import { School, Search, Loader2, Eye, EyeOff, Edit, Trash2, Plus, X, Power, PowerOff } from "lucide-react";
import { SchoolImagePicker, NO_IMAGE_CHANGE, type SchoolImageChange } from '@/components/schools/SchoolImagePicker';
import adminAPI, { schoolImageSrc } from "@/app/API/admin";
import accountsAPI from "@/app/API/accounts";
import { t } from '@/i18n';
import { useConfirm } from '@/components/ui/ConfirmProvider';

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
  image_url?: string | null;
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
      "Email already exists": t("هذا البريد الإلكتروني مستخدم بالفعل. استخدم بريداً آخر."),
      "Email is already in use": t("هذا البريد الإلكتروني مستخدم بالفعل. استخدم بريداً آخر."),
    };
    return knownMessages[detail] ?? detail;
  }

  if (apiError.response?.status === 422) return t("تحقق من البيانات المدخلة وحاول مرة أخرى.");
  return fallback;
}

export default function SchoolsManagementPage() {
  const confirm = useConfirm();
  const { setSelectedSchool: setAdminSchool } = useAdminView();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [createError, setCreateError] = useState<string>("");
  const [editError, setEditError] = useState<string>("");
  const [deleteError, setDeleteError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  // Deep link from the dashboard quick links: /dashboard/schools?new=1 opens the create dialog.
  const searchParams = useSearchParams();
  const [showCreateDialog, setShowCreateDialog] = useState(() => searchParams.get("new") === "1");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [imageChange, setImageChange] = useState<SchoolImageChange>(NO_IMAGE_CHANGE);
  
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
      setError(t("فشل تحميل المدارس"));
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
      setCreateError(t("يرجى ملء جميع الحقول المطلوبة"));
      return;
    }

    const normalizedEmail = formData.email.trim().toLowerCase();
    if (schools.some((school) => school.email.trim().toLowerCase() === normalizedEmail)) {
      setCreateError(t("هذا البريد الإلكتروني مستخدم بالفعل. استخدم بريداً آخر."));
      return;
    }

    if (!(await confirm({ title: t('تأكيد الإضافة'), message: t('هل أنت متأكد من إضافة المدرسة {name}؟', { name: formData.school_name.trim() }), confirmText: t('نعم، أضف') }))) return;

    try {
      setIsSubmitting(true);
      setCreateError("");
      const created = await adminAPI.createSchool({
        ...formData,
        school_name: formData.school_name.trim(),
        chief_supervisor_firstname: formData.chief_supervisor_firstname.trim(),
        chief_supervisor_lastname: formData.chief_supervisor_lastname.trim(),
        email: normalizedEmail,
        phone_number: formData.phone_number.trim(),
      });
      const newId = created?.school?.id;
      if (imageChange.file && newId) {
        try {
          await adminAPI.uploadSchoolImage(newId, imageChange.file);
        } catch (imageError: unknown) {
          // The school exists; only the picture failed. Say so instead of failing the whole creation.
          setError(getRequestErrorMessage(imageError, t("تم إنشاء المدرسة لكن تعذر رفع صورتها")));
        }
      }
      setShowCreateDialog(false);
      resetForm();
      fetchSchools();
    } catch (requestError: unknown) {
      setCreateError(getRequestErrorMessage(requestError, t("فشل إنشاء المدرسة")));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSchool) return;

    if (!(await confirm({ title: t('تأكيد الحفظ'), message: t('هل أنت متأكد من حفظ تعديلات المدرسة {name}؟', { name: selectedSchool.school_name }), confirmText: t('نعم، احفظ') }))) return;

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
      if (imageChange.file) await adminAPI.uploadSchoolImage(selectedSchool.id, imageChange.file);
      else if (imageChange.remove) await adminAPI.deleteSchoolImage(selectedSchool.id);
      setShowEditDialog(false);
      resetForm();
      setSelectedSchool(null);
      fetchSchools();
    } catch (requestError: unknown) {
      setEditError(getRequestErrorMessage(requestError, t("فشل تحديث المدرسة")));
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
      setDeleteError(getRequestErrorMessage(requestError, t("فشل حذف المدرسة")));
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
    setImageChange(NO_IMAGE_CHANGE);
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
    setImageChange(NO_IMAGE_CHANGE);
    setError("");
    setCreateError("");
    setEditError("");
    setDeleteError("");
  };

  // تفعيل / تعطيل a school = its chief supervisor's account (signed out at once when deactivated).
  const toggleSchool = async (school: SchoolData) => {
    const activate = !school.is_active;
    const ok = await confirm(activate
      ? { title: t('تفعيل الحساب'), message: t('هل أنت متأكد من تفعيل المدرسة {name}؟ سيتمكن مشرفها العام من الدخول مجدداً.', { name: school.school_name }), confirmText: t('نعم، فعّل') }
      : { title: t('إلغاء تفعيل الحساب'), message: t('هل أنت متأكد من إلغاء تفعيل المدرسة {name}؟ سيتم تسجيل خروج مشرفها العام ولن يتمكن من الدخول حتى يُعاد تفعيلها.', { name: school.school_name }), confirmText: t('نعم، ألغِ التفعيل'), variant: 'danger' });
    if (!ok) return;
    try {
      await accountsAPI.setAccountActive(school.user_id, activate);
      fetchSchools();
    } catch (requestError: unknown) {
      setError(getRequestErrorMessage(requestError, t('تعذر تغيير حالة الحساب')));
    }
  };

  const handleEnterSchool = (school: SchoolData) => {
    setAdminSchool(school.id, school.school_name);
  };

  return (
    <AppLayout title={t("إدارة المدارس")} breadcrumb={t("لوحة التحكم / إدارة المدارس")}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}>
              <School size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t("إدارة المدارس")}</h2>
              <p className="text-sm text-gray-500">{t("عرض وإدارة جميع المدارس المسجلة")}</p>
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
            {t("إضافة مدرسة")}
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
            <Search className="absolute inset-s-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t("ابحث عن مدرسة...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-start"
            />
          </div>
        </div>

        {/* Schools Table */}
        <div className="relative bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C8963E' }} />
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <School size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">
                {searchQuery ? t("لا توجد نتائج للبحث") : t("لا توجد مدارس مسجلة حالياً")}
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[48rem]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-3 py-3 text-start text-xs font-semibold text-gray-600">{t("اسم المدرسة")}</th>
                  <th className="px-3 py-3 text-start text-xs font-semibold text-gray-600">{t("الرئيس")}</th>
                  <th className="px-3 py-3 text-start text-xs font-semibold text-gray-600">{t("البريد الإلكتروني")}</th>
                  <th className="px-3 py-3 text-start text-xs font-semibold text-gray-600">{t("رقم الهاتف")}</th>
                  <th className="px-3 py-3 text-start text-xs font-semibold text-gray-600">{t("الطلاب")}</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600">{t("الإجراءات")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-50">
                          {school.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element -- image served by the API
                            <img src={schoolImageSrc(school.image_url) ?? ''} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <School size={18} className="text-amber-600" aria-hidden="true" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block min-w-40 font-medium text-gray-900">{school.school_name}</span>
                          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${school.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                            {school.is_active ? `● ${t("نشط")}` : `○ ${t("غير مفعّل")}`}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600">{school.president_name}</td>
                    <td className="px-3 py-3 text-sm text-gray-600">{school.email}</td>
                    <td className="px-3 py-3 text-sm text-gray-600">{school.phone_number}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {school.student_count}{' '}{t("طالب")}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => void toggleSchool(school)}
                          className={`p-2 rounded-lg transition-colors ${school.is_active ? 'hover:bg-amber-50' : 'hover:bg-emerald-50'}`}
                          title={school.is_active ? t("إلغاء التفعيل") : t("تفعيل")}
                          aria-label={school.is_active ? t("إلغاء التفعيل") : t("تفعيل")}
                        >
                          {school.is_active ? <PowerOff size={18} className="text-amber-600" /> : <Power size={18} className="text-emerald-600" />}
                        </button>
                        <button
                          onClick={() => handleEnterSchool(school)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t("دخول المدرسة")}
                        >
                          <Eye size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => openEditDialog(school)}
                          className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                          title={t("تعديل")}
                        >
                          <Edit size={18} className="text-yellow-600" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(school)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title={t("حذف")}
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
                <h3 id="create-school-title" className="text-xl font-bold text-gray-900">{t("إضافة مدرسة جديدة")}</h3>
                <button aria-label={t("إغلاق")} onClick={() => setShowCreateDialog(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              {createError && (
                <div role="alert" aria-live="assertive" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <div className="space-y-4">
                <SchoolImagePicker currentUrl={null} value={imageChange} onChange={setImageChange} />
                <label className="block text-sm font-medium text-gray-700">{t("اسم المدرسة")}{' '}<span className="text-red-500">*</span>
                  <input type="text" autoComplete="organization" placeholder={t("مثال: مدرسة النور")} value={formData.school_name} onChange={(e) => setFormData({...formData, school_name: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-start focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">{t("الاسم الأول للمشرف العام")}{' '}<span className="text-red-500">*</span>
                    <input type="text" autoComplete="given-name" placeholder={t("مثال: أحمد")} value={formData.chief_supervisor_firstname} onChange={(e) => setFormData({...formData, chief_supervisor_firstname: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-start focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">{t("اسم العائلة للمشرف العام")}{' '}<span className="text-red-500">*</span>
                    <input type="text" autoComplete="family-name" placeholder={t("مثال: اليعقوبي")} value={formData.chief_supervisor_lastname} onChange={(e) => setFormData({...formData, chief_supervisor_lastname: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-start focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                </div>
                <label className="block text-sm font-medium text-gray-700">{t("البريد الإلكتروني")}{' '}<span className="text-red-500">*</span>
                  <input type="email" autoComplete="email" dir="ltr" placeholder="name@example.com" value={formData.email} onChange={(e) => { setFormData({...formData, email: e.target.value}); setCreateError(""); }} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <label className="block text-sm font-medium text-gray-700">{t("كلمة المرور")}{' '}<span className="text-red-500">*</span>
                  <span className="relative mt-1.5 block">
                    <input type={showCreatePassword ? "text" : "password"} autoComplete="new-password" placeholder={t("أدخل كلمة مرور للمشرف")} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pe-12 text-start focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <button type="button" aria-label={showCreatePassword ? t("إخفاء كلمة المرور") : t("إظهار كلمة المرور")} aria-pressed={showCreatePassword} onClick={() => setShowCreatePassword((visible) => !visible)} className="absolute inset-e-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                      {showCreatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>
                <label className="block text-sm font-medium text-gray-700">{t("رقم الهاتف")}{' '}<span className="font-normal text-gray-400">{t("(اختياري)")}</span>
                  <input type="tel" autoComplete="tel" dir="ltr" placeholder={t("مثال: 0555 123 456")} value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}
                >
                  {isSubmitting ? t("جاري الإضافة...") : t("إضافة")}
                </button>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  {t("إلغاء")}
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
                <h3 id="edit-school-title" className="text-xl font-bold text-gray-900">{t("تعديل المدرسة")}</h3>
                <button aria-label={t("إغلاق")} onClick={() => setShowEditDialog(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              {editError && (
                <div role="alert" aria-live="assertive" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {editError}
                </div>
              )}

              <div className="space-y-4">
                <SchoolImagePicker currentUrl={schoolImageSrc(selectedSchool.image_url)} value={imageChange} onChange={setImageChange} />
                <label className="block text-sm font-medium text-gray-700">{t("اسم المدرسة")}
                  <input type="text" autoComplete="organization" placeholder={t("اسم المدرسة")} value={formData.school_name} onChange={(e) => setFormData({...formData, school_name: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-start focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">{t("الاسم الأول للمشرف العام")}
                    <input type="text" autoComplete="given-name" placeholder={t("الاسم الأول")} value={formData.chief_supervisor_firstname} onChange={(e) => setFormData({...formData, chief_supervisor_firstname: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-start focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">{t("اسم العائلة للمشرف العام")}
                    <input type="text" autoComplete="family-name" placeholder={t("اسم العائلة")} value={formData.chief_supervisor_lastname} onChange={(e) => setFormData({...formData, chief_supervisor_lastname: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-start focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </label>
                </div>
                <label className="block text-sm font-medium text-gray-700">{t("البريد الإلكتروني")}
                  <input type="email" autoComplete="email" dir="ltr" placeholder="name@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
                <label className="block text-sm font-medium text-gray-700">{t("كلمة مرور جديدة")}{' '}<span className="font-normal text-gray-400">{t("(اختياري)")}</span>
                  <span className="relative mt-1.5 block">
                    <input type={showEditPassword ? "text" : "password"} autoComplete="new-password" placeholder={t("اتركها فارغة دون تغيير")} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pe-12 text-start focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    <button type="button" aria-label={showEditPassword ? t("إخفاء كلمة المرور") : t("إظهار كلمة المرور")} aria-pressed={showEditPassword} onClick={() => setShowEditPassword((visible) => !visible)} className="absolute inset-e-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                      {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>
                <label className="block text-sm font-medium text-gray-700">{t("رقم الهاتف")}{' '}<span className="font-normal text-gray-400">{t("(اختياري)")}</span>
                  <input type="tel" autoComplete="tel" dir="ltr" placeholder={t("مثال: 0555 123 456")} value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEdit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}
                >
                  {isSubmitting ? t("جاري التحديث...") : t("تحديث")}
                </button>
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  {t("إلغاء")}
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
                <h3 className="text-xl font-bold text-gray-900">{t("تأكيد الحذف")}</h3>
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
                {t("هل أنت متأكد من حذف مدرسة")}{' '}<strong>{selectedSchool.school_name}</strong>{t("؟ سيتم حذف جميع البيانات المرتبطة بها (المعلمين، الطلاب، إلخ). هذا الإجراء لا يمكن التراجع عنه.")}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium disabled:opacity-50"
                >
                  {isSubmitting ? t("جاري الحذف...") : t("حذف")}
                </button>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  {t("إلغاء")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
