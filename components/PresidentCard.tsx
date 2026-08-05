"use client";
import { User, Mail, School, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
    <div className="bg-white rounded-2xl px-6 py-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: '#C8963E' }}>
          {president.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-gray-800 truncate">{president.name}</h2>
          <Badge variant="warning">رئيس</Badge>
        </div>
      </div>

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

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenDetails(president)}
          className="!border-[#C8963E] !text-[#C8963E] hover:!bg-[#C8963E]/10 flex items-center justify-center gap-1"
        >
          <Info size={14} />
          تفاصيل
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onApprove(president.id)}
          className="col-span-2 !bg-[#C8963E] hover:!bg-[#b98e3a] flex items-center justify-center gap-1"
        >
          <CheckCircle size={14} />
          قبول الطلب
        </Button>
      </div>
    </div>
  );
}