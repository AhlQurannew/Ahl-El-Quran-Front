'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

import type { Guardian } from '@/types/guardian';

interface GuardianTableProps {
  guardians: Guardian[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onPlusClick: (guardian: Guardian) => void;
  isLoading?: boolean;
}

export const GuardianTable: React.FC<GuardianTableProps> = ({
  guardians,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPlusClick,
  isLoading,
}) => {
  const allSelected = guardians.length > 0 && guardians.every((guardian) => selectedIds.includes(guardian.id));

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
                صلة القرابة
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الهاتف
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الطلاب المرتبطون
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                اسم مستخدم الحساب
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الحالة
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <Spinner size="md" label="جاري التحميل..." />
                </td>
              </tr>
            ) : guardians.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-400 font-medium">لا يوجد أولياء أمور</p>
                    <p className="text-xs text-gray-300">انقر على إضافة لإضافة ولي أمر جديد</p>
                  </div>
                </td>
              </tr>
            ) : (
              guardians.map((guardian) => {
                const isSelected = selectedIds.includes(guardian.id);
                return (
                  <tr
                    key={guardian.id}
                    className={`hover:bg-gray-50/40 transition-colors ${
                      isSelected ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    {/* Checkbox Cell */}
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(guardian.id)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>

                    {/* Plus Icon Action Button */}
                    <td className="px-2 py-3.5 text-center">
                      <button
                        onClick={() => onPlusClick(guardian)}
                        className="w-5 h-5 rounded-full flex items-center justify-center border border-amber-500 bg-transparent text-amber-500 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                      {guardian.firstName || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">
                      {guardian.lastName || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {guardian.relationship || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600" dir="ltr">
                      {guardian.phoneNumber || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {guardian.students.length ? guardian.students.map((student) => `${student.firstName} ${student.lastName}`).join('، ') : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600" dir="ltr">
                      {guardian.username || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${guardian.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {guardian.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Row count footer */}
      {guardians.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between text-xs text-gray-400">
          <span>
            عدد الصفوف: <span className="font-semibold text-gray-600">{guardians.length}</span>
          </span>
          {selectedIds.length > 0 && (
            <span className="text-teal-600 font-semibold">
              تم تحديد {selectedIds.length} ولي أمر
            </span>
          )}
        </div>
      )}
    </div>
  );
};
