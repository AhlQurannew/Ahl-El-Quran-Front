'use client';

import React from 'react';
import { Search, Printer, Edit, Trash2, CheckSquare, XCircle, PlusCircle, FileSpreadsheet } from 'lucide-react';

interface StudentSearchProps {
  query: string;
  onQueryChange: (v: string) => void;
  selectedCount: number;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onCancelSelection: () => void;
  onPrint: () => void;
  onExportExcel?: () => void;
}

export const StudentSearch: React.FC<StudentSearchProps> = ({
  query,
  onQueryChange,
  selectedCount,
  onAdd,
  onEdit,
  onDelete,
  onSelectAll,
  onCancelSelection,
  onPrint,
  onExportExcel,
}) => {  
  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="w-full">
        <div className="relative">
          <input
            type="text"
            placeholder="البحث..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 pointer-events-none">
            <Search size={18} />
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex flex-wrap gap-2.5 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Add */}
          <button
            onClick={onAdd}
            className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            إضافة
          </button>

          {/* Edit */}
          <button
            onClick={onEdit}
            disabled={selectedCount !== 1}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 ${
              selectedCount === 1
                ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Edit size={14} />
            تعديل
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            disabled={selectedCount === 0}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 ${
              selectedCount > 0
                ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Trash2 size={14} />
            حذف
          </button>

          {/* Select All */}
          <button
            onClick={onSelectAll}
            className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <CheckSquare size={14} />
            تحديد الكل
          </button>

          {/* Cancel */}
          <button
            onClick={onCancelSelection}
            disabled={selectedCount === 0}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 ${
              selectedCount > 0
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <XCircle size={14} />
            إلغاء
          </button>
        </div>

        {/* Export Excel & Print */}
        <div className="flex items-center gap-2">
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="px-5 py-2 text-xs font-bold rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/70 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14} />
              تصدير Excel
            </button>
          )}

          <button
            onClick={onPrint}
            className="px-5 py-2 text-xs font-bold rounded-xl border border-amber-500 text-amber-600 hover:bg-amber-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Printer size={14} />
            طباعة
          </button>
        </div>
      </div>
    </div>
  );
};
