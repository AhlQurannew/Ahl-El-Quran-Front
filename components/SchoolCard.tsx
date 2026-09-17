import React from 'react';
import { CircularProgress } from './CircularProgress';
import { School, Users } from 'lucide-react';

interface SchoolCardProps {
  schoolName: string;
  presidentName: string;
  studentCount: number;
  percentage: number;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  schoolName,
  presidentName,
  studentCount,
  percentage
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="flex items-center gap-4">
        {/* Circular Progress */}
        <div className="shrink-0">
          <CircularProgress percentage={percentage} size={80} strokeWidth={6} color="#C8963E">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{percentage}%</div>
              <div className="text-xs text-gray-500">من الكل</div>
            </div>
          </CircularProgress>
        </div>

        {/* School Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <School size={18} className="text-gray-400 shrink-0 mt-0.5" />
            <h3 className="text-base font-bold text-gray-900 truncate">{schoolName}</h3>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Users size={14} className="text-gray-400" />
            <span>{studentCount} طالب</span>
          </div>

          <div className="text-xs text-gray-500">
            <span className="font-medium">الرئيس:</span> {presidentName}
          </div>
        </div>
      </div>
    </div>
  );
};
