"use client";

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import PresidentCard from "@/components/PresidentCard";
import { RotateCw, Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import adminAPI from "@/api/admin";

interface PendingPresident {
  id: number;
  user_id?: number;
  firstname?: string;
  lastname?: string;
  name?: string;
  email: string;
  school_name?: string;
  school?: string;
  phone_number?: string;
}

export default function AdminDashboard() {
  const [presidents, setPresidents] = useState<PendingPresident[]>([]);
  const [selectedPresident, setSelectedPresident] = useState<PendingPresident | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [pendingApprovalId, setPendingApprovalId] = useState<number | null>(null);
  const [pendingRejectId, setPendingRejectId] = useState<number | null>(null);

  const fetchPendingPresidents = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await adminAPI.getPendingPresidents();

      if (data && Array.isArray(data.pending_presidents)) {
        setPresidents(data.pending_presidents);
      } else if (Array.isArray(data)) {
        setPresidents(data);
      } else {
        setPresidents([]);
      }
    } catch (err: any) {
      console.error("Erreur de chargement des présidents :", err);
      setErrorMsg("تعذر تحميل قائمة الطلبات. يرجى المحاولة لاحقاً.");
      setPresidents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingPresidents();
  }, [fetchPendingPresidents]);

  const handleConfirmApprove = async () => {
    if (pendingApprovalId === null) return;

    setIsApproving(true);
    try {
      await adminAPI.approvePresident(pendingApprovalId);

      setPresidents((prev) => prev.filter((p) => (p.user_id ?? p.id) !== pendingApprovalId));
      setPendingApprovalId(null);
      setSelectedPresident(null);
    } catch (err: any) {
      console.error("Erreur lors de l'approbation :", err);
      alert("حدث خطأ أثناء قبول الطلب. يرجى المحاولة مجدداً.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmReject = async () => {
    if (pendingRejectId === null) return;

    setIsRejecting(true);
    try {
      await adminAPI.rejectPresident(pendingRejectId);

      setPresidents((prev) => prev.filter((p) => (p.user_id ?? p.id) !== pendingRejectId));
      setPendingRejectId(null);
      setSelectedPresident(null);
    } catch (err: any) {
      console.error("Erreur lors du رفض :", err);
      alert("حدث خطأ أثناء رفض الطلب. يرجى المحاولة مجدداً.");
    } finally {
      setIsRejecting(false);
    }
  };

  const getFullName = (p: PendingPresident) => {
    if (p.name) return p.name;
    const full = `${p.firstname || ''} ${p.lastname || ''}`.trim();
    return full || 'بدون اسم';
  };

  const getSchoolName = (p: PendingPresident) => {
    return p.school_name || p.school || 'غير محدد';
  };

  return (
    <AppLayout title="قبول الرؤساء" breadcrumb="لوحة التحكم / قبول الرؤساء">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)', boxShadow: '0 10px 15px -3px rgba(200, 150, 62, 0.2)' }}>
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">طلبات الرؤساء</h2>
              <p className="text-sm text-gray-500">إدارة طلبات الرؤساء المعلقة</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm">
              {isLoading ? '...' : `${presidents.length} طلب`}
            </span>
            <button
              onClick={fetchPendingPresidents}
              disabled={isLoading}
              className="px-4 py-2 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer"
              style={{ backgroundColor: '#C8963E' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B8832E'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C8963E'}
              title="تحديث"
            >
              <RotateCw size={18} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Presidents List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2 bg-white rounded-2xl border border-gray-100">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C8963E' }} />
              <p className="text-sm font-medium">جاري تحميل الطلبات المعلقة...</p>
            </div>
          ) : (
            <>
              {Array.isArray(presidents) && presidents.map((president) => (
                <PresidentCard
                  key={president.id}
                  president={{
                    ...president,
                    name: getFullName(president),
                    school: getSchoolName(president),
                  }}
                  onOpenDetails={() => setSelectedPresident(president)}
                  onApprove={(id) => setPendingApprovalId(id)}
                  onReject={(id) => setPendingRejectId(id)}
                />
              ))}

              {(!Array.isArray(presidents) || presidents.length === 0) && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Users size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-400 font-medium">لا توجد طلبات رئيس معلقة حالياً</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Selected President Details Modal */}
      {selectedPresident && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl text-center border border-gray-100">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #C8963E, #B8832E)' }}>
              {getFullName(selectedPresident).charAt(0).toUpperCase()}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-6">تفاصيل الطلب</h3>

            <div className="space-y-3 text-sm text-right mb-6 bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">رقم المعرف</span>
                <span className="font-bold text-gray-900">{selectedPresident.id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">الاسم الكامل</span>
                <span className="font-bold text-gray-900">{getFullName(selectedPresident)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-gray-500 font-medium">البريد الإلكتروني</span>
                <span className="font-bold text-gray-900 text-xs">{selectedPresident.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">اسم المدرسة</span>
                <span className="font-bold" style={{ color: '#C8963E' }}>{getSchoolName(selectedPresident)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPresident(null)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition text-sm cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {pendingApprovalId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl text-center border border-gray-100">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(200, 150, 62, 0.1)' }}>
              <CheckCircle size={32} style={{ color: '#C8963E' }} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">قبول الطلب</h3>
            <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من قبول طلب هذا الرئيس؟</p>

            <div className="space-y-3">
              <button
                onClick={handleConfirmApprove}
                disabled={isApproving}
                className="w-full text-white py-3 rounded-xl font-medium transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-sm"
                style={{ backgroundColor: '#C8963E' }}
                onMouseEnter={(e) => !isApproving && (e.currentTarget.style.backgroundColor = '#B8832E')}
                onMouseLeave={(e) => !isApproving && (e.currentTarget.style.backgroundColor = '#C8963E')}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري القبول...</span>
                  </>
                ) : (
                  'تأكيد القبول'
                )}
              </button>

              <button
                onClick={() => setPendingApprovalId(null)}
                disabled={isApproving}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition text-sm font-medium cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {pendingRejectId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl text-center border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">رفض الطلب</h3>
            <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من رفض طلب هذا الرئيس؟</p>

            <div className="space-y-3">
              <button
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-sm"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الرفض...</span>
                  </>
                ) : (
                  'تأكيد الرفض'
                )}
              </button>

              <button
                onClick={() => setPendingRejectId(null)}
                disabled={isRejecting}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition text-sm font-medium cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}