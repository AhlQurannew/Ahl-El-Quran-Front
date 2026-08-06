'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  count,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200">
        
        
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>

        
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900">تأكيد حذف الحلقات</h3>
          <p className="text-sm text-gray-500">
            هل أنت متأكد من حذف عدد <span className="font-bold text-red-600">{count}</span> حلقة من السجلات؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>

        
        <div className="flex items-center justify-center gap-3 w-full mt-2">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} />
            <span>{isLoading ? 'جاري الحذف...' : 'نعم، احذف'}</span>
          </button>
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};