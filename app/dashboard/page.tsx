"use client";

import { useState } from "react";
import PresidentCard from "@/components/PresidentCard";
import { RotateCw, LogOut, Users, CheckCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

interface President {
  id: number;
  name: string;
  email: string;
  school: string;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [presidents, setPresidents] = useState<President[]>([
    { id: 2, name: "younes pres", email: "younes@gmail.com", school: "سلمان الفارسي" },
    { id: 3, name: "ahmed attia", email: "ahmed@gmail.com", school: "مدرسة الهداية" },
    { id: 4, name: "ihab maarifi", email: "ihab@gmail.com", school: "مدرسة الهداية" },
  ]);

  const [selectedPresident, setSelectedPresident] = useState<President | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState<number | null>(null);

  const handleConfirmApprove = () => {
    if (pendingApprovalId !== null) {
      setPresidents(presidents.filter((p) => p.id !== pendingApprovalId));
      setPendingApprovalId(null);
      setSelectedPresident(null);
    }
  };

  const handleReject = (id: number) => {
    setPresidents(presidents.filter((p) => p.id !== id));
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
            onClick={() => window.location.reload()}
            className="hover:bg-white/10 p-2 rounded-full transition"
            title="تحديث"
          >
            <RotateCw size={18} />
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="hover:bg-white/10 p-2 rounded-full transition"
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
            <span className="text-sm text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
              {presidents.length} طلب
            </span>
          </div>
          <div className="h-0.5 mt-3 rounded-full" style={{ backgroundColor: '#C8963E', opacity: 0.3 }} />
        </div>

        <div className="w-full max-w-3xl space-y-4">
          {presidents.map((president) => (
            <PresidentCard
              key={president.id}
              president={president}
              onOpenDetails={(p) => setSelectedPresident(p)}
              onApprove={(id) => setPendingApprovalId(id)}
              onReject={handleReject}
            />
          ))}

          {presidents.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400">لا توجد طلبات رئيس معلقة حالياً</p>
            </div>
          )}
        </div>
      </main>

      {selectedPresident && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
              style={{ backgroundColor: '#C8963E' }}>
              {selectedPresident.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">تفاصيل الطلب</h3>
            <div className="space-y-3 text-sm text-right mb-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-400">رقم المعرف</span>
                <span className="font-bold text-gray-800">{selectedPresident.id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-400">الاسم الكامل</span>
                <span className="font-bold text-gray-800">{selectedPresident.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-400">البريد الإلكتروني</span>
                <span className="font-bold text-gray-800">{selectedPresident.email}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-400">اسم المدرسة</span>
                <span className="font-bold" style={{ color: '#C8963E' }}>{selectedPresident.school}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedPresident(null)}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium py-2.5 rounded-xl transition text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {pendingApprovalId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                className="w-full text-white py-2.5 rounded-xl font-medium transition text-sm hover:opacity-90"
                style={{ backgroundColor: '#C8963E' }}
              >
                تأكيد القبول
              </button>
              <button
                onClick={() => setPendingApprovalId(null)}
                className="w-full bg-transparent hover:bg-gray-50 text-gray-500 py-2 rounded-xl transition text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <LogOut size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">تسجيل الخروج</h3>
            <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من تسجيل الخروج؟</p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition text-sm"
              >
                تسجيل الخروج
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full bg-transparent hover:bg-gray-50 text-gray-500 py-2 rounded-xl transition text-sm"
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