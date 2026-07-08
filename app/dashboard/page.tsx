"use client";

import { useState } from "react";
import PresidentCard from "@/components/PresidentCard"; // Ajuste le chemin selon ton projet
import { RotateCw, LogOut } from "lucide-react";

interface President {
  id: number;
  name: string;
  email: string;
  school: string;
}

export default function AdminDashboard() {
  // Données statiques
  const [presidents, setPresidents] = useState<President[]>([
    { id: 2, name: "younes pres", email: "younes@gmail.com", school: "سلمان الفارسي" },
    { id: 3, name: "ahmed attia", email: "ahmed@gmail.com", school: "مدرسة الهداية" },
    { id: 4, name: "ihab maarifi ", email: "ihab@gmail.com", school: " مدرسة الهداية" },
  ]);

  const [selectedPresident, setSelectedPresident] = useState<President | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Nouvel état pour la confirmation d'approbation
  const [pendingApprovalId, setPendingApprovalId] = useState<number | null>(null);

  // Fonction appelée uniquement QUAND l'utilisateur valide dans la modale
  const handleConfirmApprove = () => {
    if (pendingApprovalId !== null) {
      setPresidents(presidents.filter((p) => p.id !== pendingApprovalId));
      setPendingApprovalId(null);
      setSelectedPresident(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col font-sans" dir="rtl">
      {/* Barre de navigation */}
      <header className="bg-[#C8963E] text-white px-6 py-2 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold text-center flex-1">لوحة تحكم المسؤول</h1>
        <button onClick={() => {/* Ajoute ta fonction refresh ici */}} className="hover:bg-black/10 p-2 rounded-full transition text-xl">
          <RotateCw className="w-4 h-4 text-white"/> {/* Changé text-gray-800 en text-white pour que ce soit visible */}
        </button>
        <button onClick={() => setShowLogoutModal(true)} className="hover:bg-black/10 p-2 rounded-full transition text-xl">
          <LogOut className="w-4 h-4 text-white" /> {/* Changé text-gray-800 en text-white pour le header */}
        </button>
      </header>

      {/* Contenu principal */}
      <main className="p-4 w-full space-y-4 mt-4">
        {presidents.map((president) => (
          <PresidentCard
            key={president.id}
            president={president}
            onOpenDetails={(p) => setSelectedPresident(p)}
            onApprove={(id) => setPendingApprovalId(id)} // Ouvre la modale au lieu de supprimer directement !
          />
        ))}

        {presidents.length === 0 && (
          <p className="text-center text-gray-400 py-12">لا توجد طلبات رئيس معلقة حالياً.</p>
        )}
      </main>

      {/* --- MODALE : DÉTAILS --- */}
      {selectedPresident && (
        <div className="w-full fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border">
            <h3 className="text-lg font-bold text-gray-900 mb-6">تفاصيل الطلب</h3>
            <div className="space-y-4 text-sm text-right mb-6 px-1">
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
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-400">اسم المدرسة</span>
                <span className="font-bold text-[#b98e3a]">{selectedPresident.school}</span>
              </div>
            </div>
            <button onClick={() => setSelectedPresident(null)} className="w-full bg-transparent hover:bg-gray-50 text-amber-600 font-medium py-2 rounded-xl transition text-sm">
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* --- NOUVELLE MODALE : CONFIRMATION D'APPROBATION --- */}
      {pendingApprovalId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border">
            <h3 className="text-lg font-bold text-gray-900 mb-2">قبول الطلب</h3>
            <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من قبول طلب هذا الرئيس؟</p>
            <div className="space-y-2">
              <button onClick={handleConfirmApprove} className="w-full bg-[#C8963E] hover:bg-[#b98e3a] text-white py-2.5 rounded-xl font-medium transition text-sm">
                تأكيد القبول
              </button>
              <button onClick={() => setPendingApprovalId(null)} className="w-full bg-transparent hover:bg-gray-50 text-gray-500 py-2 rounded-xl transition text-sm">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE : DECONNEXION --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl text-center border">
            <h3 className="text-lg font-bold text-gray-900 mb-2">تسجيل الخروج</h3>
            <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من تسجيل الخروج؟</p>
            <div className="space-y-2">
              <button onClick={() => setShowLogoutModal(false)} className="w-full bg-[#bd2130] hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition text-sm">
                تسجيل الخروج
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full bg-transparent hover:bg-gray-50 text-gray-500 py-2 rounded-xl transition text-sm">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}