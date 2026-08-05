'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import type { Lecture } from '@/api/lectures';

interface LectureTableProps {
  lectures: Lecture[];
  totalCount?: number;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onPlusClick?: (lecture: Lecture) => void;
  isLoading?: boolean;
}

export const LectureTable: React.FC<LectureTableProps> = ({
  lectures,
  totalCount = lectures.length,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPlusClick,
  isLoading,
}) => {
  const allSelected = totalCount > 0 && selectedIds.length === totalCount;

 
  const formatCategory = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case 'male': 
        return 'ذكور';
      case 'female': 
        return 'إناث';
      case 'both': 
        return 'ذكور وإناث';
      default: 
        return cat || '—';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" dir="rtl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-teal-800 text-white border-b border-teal-900">
              <th className="px-4 py-3.5 text-center w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
              </th>

              <th className="px-2 py-3.5 w-10" />

              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                اسم الحلقة
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                نوع الحلقة
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الفئة
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-center uppercase tracking-wider">
                عدد الطلاب
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                المعلمون
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                التوقيت والأيام
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <Spinner size="md" label="جاري تحميل الحلقات..." />
                </td>
              </tr>
            ) : lectures.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-400 font-medium">لا توجد حلقات حالياً</p>
                    <p className="text-xs text-gray-300">انقر على إضافة لإضافة حلقة جديدة</p>
                  </div>
                </td>
              </tr>
            ) : (
              lectures.map((lecture) => {
                const isSelected = selectedIds.includes(lecture.lecture_id);

                return (
                  <tr
                    key={lecture.lecture_id}
                    className={`hover:bg-gray-50/40 transition-colors ${
                      isSelected ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(lecture.lecture_id)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>

                    <td className="px-2 py-3.5 text-center">
                      {onPlusClick && (
                        <button
                          onClick={() => onPlusClick(lecture)}
                          className="w-5 h-5 rounded-full flex items-center justify-center border border-amber-500 bg-transparent text-amber-500 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                      {lecture.lecture_name_ar}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs text-gray-600">
                        {lecture.circle_type}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {formatCategory(lecture.category)}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-center font-semibold text-teal-700">
                      {lecture.student_count ?? 0}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {lecture.teachers && lecture.teachers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {lecture.teachers.map((t, idx) => {
                            const fullName = t.firstname || t.first_name || t.lastname || t.last_name
                              ? `${t.firstname || t.first_name || ''} ${t.lastname || t.last_name || ''}`.trim()
                              : null;

                            return fullName ? (
                              <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700">
                                {fullName}
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {lecture.schedules && lecture.schedules.length > 0 ? (
                        <div className="text-xs space-y-1">
                          {lecture.schedules.map((s, idx) => (
                            <div key={idx} className="text-teal-700 bg-teal-50/50 px-2 py-0.5 rounded inline-block ml-1">
                              {s.day_of_week} ({s.start_time} - {s.end_time})
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      
      {totalCount > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between text-xs text-gray-400">
          <span>
            عرض <span className="font-semibold text-gray-600">{lectures.length}</span> من أصل <span className="font-semibold text-gray-600">{totalCount}</span> حلقة
          </span>
          {selectedIds.length > 0 && (
            <span className="text-teal-600 font-semibold">
              تم تحديد {selectedIds.length} حلقة
            </span>
          )}
        </div>
      )}
    </div>
  );
};