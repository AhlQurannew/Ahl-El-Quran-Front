import React from 'react';
import { MemorizationRow } from './MemorizationRow';
import { Spinner } from '@/components/ui/Spinner';
import type { MemorizationRecord } from '@/types/memorization';

interface MemorizationTableProps {
  records: MemorizationRecord[];
  isLoading?: boolean;
  onEdit: (record: MemorizationRecord) => void;
  onDelete: (record: MemorizationRecord) => void;
}

export const MemorizationTable: React.FC<MemorizationTableProps> = ({
  records,
  isLoading,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center w-12">
                #
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                الطالب
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                الإنجاز (السور المحفوظة)
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right w-28">
                الحالة
              </th>
              <th className="px-6 py-4 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <Spinner size="md" label="جاري التحميل..." />
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-gray-400 font-medium">لا توجد سجلات</p>
                    <p className="text-xs text-gray-300">ابدأ بإضافة سجل إنجاز جديد</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record, i) => (
                <MemorizationRow
                  key={record.id}
                  record={record}
                  index={i + 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer row count */}
      {records.length > 0 && (
        <div className="px-6 py-3.5 border-t border-gray-50 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            إجمالي: <span className="font-semibold text-gray-600">{records.length}</span> طالب
          </p>
        </div>
      )}
    </div>
  );
};
