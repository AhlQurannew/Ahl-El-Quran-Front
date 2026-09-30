'use client';

import React from 'react';
import { Search, Plus, Edit2, Trash2, CheckSquare, X, Printer, FileSpreadsheet } from 'lucide-react';

interface SupervisorSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  selectedCount: number;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onCancelSelection: () => void;
  onPrint: () => void;
  onExportExcel: () => void;
}

export const SupervisorSearch: React.FC<SupervisorSearchProps> = ({
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
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="البحث عن مشرف بالاسم أو البريد الإلكتروني..."
          className="w-full px-4 py-3 pr-11 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Add Button */}
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          <span>إضافة</span>
        </button>

        {/* Edit Button */}
        <button
          onClick={onEdit}
          disabled={selectedCount !== 1}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <Edit2 size={18} />
          <span>تعديل</span>
        </button>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          disabled={selectedCount === 0}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <Trash2 size={18} />
          <span>حذف</span>
        </button>

        {/* Select All Button */}
        <button
          onClick={onSelectAll}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
        >
          <CheckSquare size={18} />
          <span>تحديد الكل</span>
        </button>

        {/* Cancel Selection Button */}
        <button
          onClick={onCancelSelection}
          disabled={selectedCount === 0}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <X size={18} />
          <span>إلغاء</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Print Button */}
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium"
        >
          <Printer size={18} />
          <span>طباعة</span>
        </button>

        {/* Export Excel Button */}
        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium"
        >
          <FileSpreadsheet size={18} />
          <span>تصدير Excel</span>
        </button>
      </div>
    </div>
  );
};
