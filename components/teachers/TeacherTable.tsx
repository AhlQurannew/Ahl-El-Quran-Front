'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import type { Teacher } from '@/types/teacher';

interface TeacherTableProps {
  teachers: Teacher[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPlusClick: (teacher: Teacher) => void;
  isLoading?: boolean;
}

export const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPlusClick,
  isLoading,
}) => {
  const allSelected = teachers.length > 0 && selectedIds.length === teachers.length;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

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
                اللقب
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                البريد الإلكتروني
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الرواية
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                تاريخ التوظيف
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الحالة
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <Spinner size="md" label="جاري التحميل..." />
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-400 font-medium">لا يوجد معلمين</p>
                    <p className="text-xs text-gray-300">انقر على إضافة لإضافة معلم جديد</p>
                  </div>
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => {
                const isSelected = selectedIds.includes(teacher.id);
                return (
                  <tr
                    key={teacher.id}
                    className={`hover:bg-gray-50/40 transition-colors ${
                      isSelected ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    {/* Checkbox Cell */}
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(teacher.id)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>

                    {/* Plus Icon Action Button */}
                    <td className="px-2 py-3.5 text-center">
                      <button
                        type="button"
                        aria-label={`عرض تفاصيل المعلم ${teacher.firstname} ${teacher.lastname}`}
                        title="عرض تفاصيل المعلم"
                        onClick={() => onPlusClick(teacher)}
                        className="w-5 h-5 rounded-full flex items-center justify-center border border-amber-500 bg-transparent text-amber-500 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                      {teacher.firstname}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">
                      {teacher.lastname}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600" dir="ltr">
                      {teacher.email}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {teacher.riwaya || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {formatDate(teacher.hire_date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={teacher.is_active ? 'success' : 'default'}>
                        {teacher.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Row count footer */}
      {teachers.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between text-xs text-gray-400">
          <span>
            عدد الصفوف: <span className="font-semibold text-gray-600">{teachers.length}</span>
          </span>
          {selectedIds.length > 0 && (
            <span className="text-teal-600 font-semibold">
              تم تحديد {selectedIds.length} معلم
            </span>
          )}
        </div>
      )}
    </div>
  );
};
