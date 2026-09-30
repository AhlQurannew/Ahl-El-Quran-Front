'use client';

import React from 'react';
import { X, User, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { Supervisor } from '@/types/supervisor';

interface SupervisorDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supervisor: Supervisor | null;
}

export const SupervisorDetailsDialog: React.FC<SupervisorDetailsDialogProps> = ({
  isOpen,
  onClose,
  supervisor,
}) => {
  if (!supervisor) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const fullName = `${supervisor.firstname} ${supervisor.lastname}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">
          بيانات المشرف
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <User size={48} className="text-white" />
          </div>
        </div>

        {/* Name */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800">{fullName}</h3>
        </div>

        {/* Details Grid */}
        <div className="space-y-4">
          {/* First Name */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <User size={20} className="text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">الاسم الأول</p>
              <p className="text-sm font-semibold text-gray-800">{supervisor.firstname}</p>
            </div>
          </div>

          {/* Last Name */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <User size={20} className="text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">الاسم الأخير</p>
              <p className="text-sm font-semibold text-gray-800">{supervisor.lastname}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Mail size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
              <p className="text-sm font-semibold text-gray-800" dir="ltr">{supervisor.email}</p>
            </div>
          </div>

          {/* Created At */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">تاريخ الإنشاء</p>
              <p className="text-sm font-semibold text-gray-800">{formatDate(supervisor.created_at)}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              supervisor.is_active ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {supervisor.is_active ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <XCircle size={20} className="text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">الحالة</p>
              <p className={`text-sm font-semibold ${
                supervisor.is_active ? 'text-green-600' : 'text-red-600'
              }`}>
                {supervisor.is_active ? 'نشط' : 'غير نشط'}
              </p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">ID</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">رقم المستخدم</p>
              <p className="text-sm font-semibold text-gray-800">{supervisor.user_id}</p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            إغلاق
          </button>
        </div>
      </div>
    </Modal>
  );
};
