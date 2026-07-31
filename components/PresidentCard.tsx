"use client";
import { Mail, School, CheckCircle, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface President {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  school: string;
}

interface PresidentCardProps {
  president: President;
  onOpenDetails: (president: President) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function PresidentCard({
  president,
  onOpenDetails,
  onApprove,
  onReject,
}: PresidentCardProps) {
  // Sélectionne en priorité `user_id` nécessaire pour le backend
  const targetId = president.user_id ?? president.id;

  return (
    <div className="bg-white rounded-2xl px-6 py-5 shadow-xs border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
      
      {/* En-tête : Avatar + Nom + Badge */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: '#C8963E' }}
        >
          {president.name ? president.name.charAt(0).toUpperCase() : "R"}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-gray-800 truncate">{president.name}</h2>
          <Badge variant="warning">رئيس</Badge>
        </div>
      </div>

      {/* Informations : Email + École */}
      <div className="space-y-2 text-sm bg-gray-50 rounded-xl p-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail size={15} style={{ color: '#C8963E' }} />
          <span className="truncate">{president.email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <School size={15} style={{ color: '#C8963E' }} />
          <span className="truncate">{president.school}</span>
        </div>
      </div>

      {/* Boutons d'action : Détails | Refuser | Accepter */}
      <div className="grid grid-cols-3 gap-2">
        {/* Bouton Détails */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenDetails(president)}
          className="!border-[#C8963E] !text-[#C8963E] hover:!bg-[#C8963E]/10 flex items-center justify-center gap-1 cursor-pointer"
        >
          <Info size={14} />
          تفاصيل
        </Button>

        {/* Bouton Refuser / Supprimer */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReject(targetId)}
          className="!border-red-500 !text-red-500 hover:!bg-red-50 flex items-center justify-center gap-1 cursor-pointer"
        >
          <XCircle size={14} />
          رفض
        </Button>

        {/* Bouton Accepter */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => onApprove(targetId)}
          className="!bg-[#C8963E] hover:!bg-[#b98e3a] text-white flex items-center justify-center gap-1 cursor-pointer"
        >
          <CheckCircle size={14} />
          قبول
        </Button>
      </div>

    </div>
  );
}