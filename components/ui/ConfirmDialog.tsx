'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'primary',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} size="sm">
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm} size="sm">
            {variant === 'danger' && <Trash2 size={14} />}
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex gap-4 items-start">
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};
