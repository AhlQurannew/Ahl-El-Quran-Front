"use client";

import { useState, useEffect, useCallback } from "react";
import PresidentCard from "@/components/PresidentCard";
import { RotateCw, LogOut, Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const [presidents, setPresidents] = useState<PendingPresident[]>([]);
  const [selectedPresident, setSelectedPresident] = useState<PendingPresident | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  
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

  
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push('/login');
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
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: '#F9F4E4' }} dir="rtl">

      
      <header className="text-white px-6 py-3 shadow-md flex justify-between items-center sticky top-0 z-10"
        style={{ backgroundColor: '#C8963E' }}>
        <div className="flex items-center gap-2">
          <Users size={20} />
          <h1 className="text-lg font-bold">لوحة تحكم المسؤول</h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchPendingPresidents}
            disabled={isLoading}
            className="hover:bg-white/10 p-2 rounded-full transition disabled:opacity-50 cursor-pointer"
            title="تحديث"
          >
            <RotateCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="hover:bg-white/10 p-2 rounded-full transition cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      
      <main className="flex-1 flex flex-col items-center py-8 px-4">

        
        <div className="w-full max-w-3xl mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-700">طلبات الرؤساء</h2>
            <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-xs">
              {isLoading ? '...' : `${presidents.length} طلب`}
            </span>
          </div>
          <div className="h-0.5 mt-3 rounded-full" style={{ backgroundColor: '#C8963E', opacity: 0.3 }} />
        </div>

        
        {errorMsg && (
          <div className="w-full max-w-3xl mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

    
        <div className="w-full max-w-3xl space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
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
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-xs">
                  <Users size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-400 font-medium">لا توجد طلبات رئيس معلقة حالياً</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      
      {selectedPresident && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
              style={{ backgroundColor: '#C8963E' }}>
              {getFullName(selectedPresident).charAt(0).toUpperCase()}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4">تفاصيل الطلب</h3>

            <div className="space-y-3 text-sm text-right mb-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-400">رقم المعرف</span>
                <span className="font-bold text-gray-800">{selectedPresident.id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-400">الاسم الكامل</span>
                <span className="font-bold text-gray-800">{getFullName(selectedPresident)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-400">البريد الإلكتروني</span>
                <span className="font-bold text-gray-800">{selectedPresident.email}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-400">اسم المدرسة</span>
                <span className="font-bold" style={{ color: '#C8963E' }}>{getSchoolName(selectedPresident)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPresident(null)}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium py-2.5 rounded-xl transition text-sm cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      
      {pendingApprovalId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#C8963E20' }}>
              <CheckCircle size={28} style={{ color: '#C8963E' }} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">قبول الطلب</h3>
            <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من قبول طلب هذا الرئيس؟</p>

            <div className="space-y-2">
              <button
                onClick={handleConfirmApprove}
                disabled={isApproving}
                className="w-full text-white py-2.5 rounded-xl font-medium transition text-sm hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                style={{ backgroundColor: '#C8963E' }}
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
                className="w-full bg-transparent hover:bg-gray-50 text-gray-500 py-2 rounded-xl transition text-sm cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      
      {pendingRejectId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">رفض الطلب</h3>
            <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من رفض طلب هذا الرئيس؟</p>

            <div className="space-y-2">
              <button
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
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
                className="w-full bg-transparent hover:bg-gray-50 text-gray-500 py-2 rounded-xl transition text-sm cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <LogOut size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">تسجيل الخروج</h3>
            <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من تسجيل الخروج؟</p>

            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition text-sm cursor-pointer"
              >
                تسجيل الخروج
              </button>

              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full bg-transparent hover:bg-gray-50 text-gray-500 py-2 rounded-xl transition text-sm cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}