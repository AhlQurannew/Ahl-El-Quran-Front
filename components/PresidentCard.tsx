"use client";
import { User , Mail , School } from "lucide-react";

interface President {
  id: number;
  name: string;
  email: string;
  school: string;
}

interface PresidentCardProps {
  president: President;
  onOpenDetails: (president: President) => void;
  onApprove: (id: number) => void;
}

export default function PresidentCard({ president, onOpenDetails, onApprove }: PresidentCardProps) {
  return (
    <div className="  bg-white rounded-2xl  px-5 py-5 shadow-sm border border-gray-100 flex flex-col relative w-full">
      {/* Profil icône et Nom */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-amber-50 p-3 rounded-full text-[#C8963E] text-xl"> <User /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{president.name}</h2>
          <span className="bg-[#C8963E]/20 text-[#C8963E] text-xs px-3 py-0.5 rounded-full font-medium">
            رئيس
          </span>
        </div>
      </div>

      {/* Détails textuels */}
      <div className="space-y-1.5 mb-5 text-[#000000]  text-sm pr-1">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-[#C8963E]" /> 
          <p>
            <span className="text-gray-400 ">البريد الإلكتروني: </span> 
            {president.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <School size={16} className="text-[#C8963E]" /> {/* 2. Remplacement ici */}
          <p>
            <span className="text-gray-400 ">اسم المدرسة:</span> 
            {president.school}
          </p>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onOpenDetails(president)}
          className="bg-gray-50 hover:bg-gray-100 text-[#C8963E] font-bold text-base border border-[#C8963E] py-2.5 rounded-xl  transition "
        >
          تفاصيل
        </button>
        <button
          onClick={() => onApprove(president.id)}
          className="col-span-2 bg-[#C8963E] hover:bg-[#b98e3a] text-white py-2.5 font-bold text-base rounded-xl  transition shadow-sm "
        >
          قبول الطلب
        </button>
      </div>
    </div>
  );
}