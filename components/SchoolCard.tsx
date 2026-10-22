import React from 'react';
import { ArrowLeft, School, Users } from 'lucide-react';
import { CircularProgress } from './CircularProgress';

interface SchoolCardProps {
  schoolName: string;
  presidentName: string;
  studentCount: number;
  percentage: number;
  onClick: () => void;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  schoolName,
  presidentName,
  studentCount,
  percentage,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`الدخول إلى مدرسة ${schoolName} في وضع عرض المسؤول`}
      className="group w-full cursor-pointer rounded-xl border border-gray-100 bg-white p-5 text-right shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <CircularProgress percentage={percentage} size={80} strokeWidth={6} color="#C8963E">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{percentage}%</div>
              <div className="text-xs text-gray-500">من الكل</div>
            </div>
          </CircularProgress>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start gap-2">
            <School size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-gray-400" />
            <h3 className="truncate text-base font-bold text-gray-900">{schoolName}</h3>
          </div>

          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <Users size={14} aria-hidden="true" className="text-gray-400" />
            <span>{studentCount} طالب</span>
          </div>

          <div className="text-xs text-gray-500">
            <span className="font-medium">الرئيس:</span> {presidentName}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-medium text-amber-700">
        <span>انقر للدخول إلى المدرسة</span>
        <ArrowLeft size={15} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
      </div>
    </button>
  );
};
