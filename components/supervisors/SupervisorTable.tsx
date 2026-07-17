'use client';

import React from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import type { Supervisor } from '@/types/supervisor';

interface SupervisorTableProps {
  supervisors: Supervisor[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  isLoading?: boolean;
}

export const SupervisorTable: React.FC<SupervisorTableProps> = ({
  supervisors,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  isLoading,
}) => {
  const allSelected = supervisors.length > 0 && selectedIds.length === supervisors.length;

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
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الاسم
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الكنية
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                البريد الإلكتروني
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                تاريخ الإنشاء
              </th>
              <th className="px-4 py-3.5 text-xs font-bold text-right uppercase tracking-wider">
                الحالة
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Spinner size="md" label="جاري التحميل..." />
                </td>
              </tr>
            ) : supervisors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-400 font-medium">لا يوجد مشرفين</p>
                  </div>
                </td>
              </tr>
            ) : (
              supervisors.map((supervisor) => {
                const isSelected = selectedIds.includes(supervisor.id);
                return (
                  <tr
                    key={supervisor.id}
                    className={`hover:bg-gray-50/40 transition-colors ${
                      isSelected ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    {/* Checkbox Cell */}
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(supervisor.id)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                      {supervisor.firstname}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">
                      {supervisor.lastname}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {supervisor.email}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {supervisor.createdAt}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={supervisor.isActive ? 'success' : 'default'}
                        dot={supervisor.isActive}
                      >
                        {supervisor.isActive ? 'نشط' : 'غير نشط'}
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
      {supervisors.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between text-xs text-gray-400">
          <span>
            عدد الصفوف: <span className="font-semibold text-gray-600">{supervisors.length}</span>
          </span>
          {selectedIds.length > 0 && (
            <span className="text-teal-600 font-semibold">
              تم تحديد {selectedIds.length} مشرف
            </span>
          )}
        </div>
      )}
    </div>
  );
};
