'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import type { Student } from '@/types/student';

interface StudentTableProps {
  students: Student[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPlusClick: (student: Student) => void;
  isLoading?: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPlusClick,
  isLoading,
}) => {
  const allSelected = students.length > 0 && selectedIds.length === students.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-teal-800 text-white border-b border-teal-900">
              {/* Checkbox Header */}
              <th className="px-4 py-3.5 text-center w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
              </th>
              {/* Spacer/Plus Header */}
              <th className="px-2 py-3.5 w-10" />
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الاسم
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الكنية
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الجنس
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الحلقات
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                اسم المستخدم
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                تاريخ الميلاد
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                مكان الميلاد
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الجنسية
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                نوع الهوية
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={11} className="py-16 text-center">
                  <Spinner size="md" label="جاري التحميل..." />
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-400 font-medium">لا يوجد طلاب</p>
                    <p className="text-xs text-gray-300">انقر على إضافة لإضافة طالب جديد</p>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const isSelected = selectedIds.includes(student.id);
                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-gray-50/40 transition-colors ${
                      isSelected ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    {/* Checkbox Cell */}
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(student.id)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>

                    {/* Plus Icon Action Button */}
                    <td className="px-2 py-3.5 text-center">
                      <button
                        onClick={() => onPlusClick(student)}
                        className="w-5 h-5 rounded-full flex items-center justify-center border border-amber-500 bg-transparent text-amber-500 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                      {student.firstName}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">
                      {student.lastName}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {student.gender === 'male' ? 'ذكر' : 'أنثى'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {student.halqa || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {student.username}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {student.dob}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {student.pob}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {student.nationality}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {student.idType || <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Row count footer */}
      {students.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between text-xs text-gray-400">
          <span>
            عدد الصفوف: <span className="font-semibold text-gray-600">{students.length}</span>
          </span>
          {selectedIds.length > 0 && (
            <span className="text-teal-600 font-semibold">
              تم تحديد {selectedIds.length} طالب
            </span>
          )}
        </div>
      )}
    </div>
  );
};
