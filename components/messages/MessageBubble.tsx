'use client';

import React from 'react';
import { Trash2, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Message } from '@/types/message';
import { getSenderRoleColor, getSenderRoleLabel, formatMessageTime } from '@/types/message';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (messageId: number) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onDelete,
}) => {
  const isSenderAdmin =
    message.sender_role === 'president' ||
    (message.sender_role as string) === 'admin' ||
    message.sender_name?.trim() === 'الرئيس' ||
    message.sender_name?.toLowerCase() === 'admin' ||
    message.sender_name === 'مسؤول النظام';

  const isSenderChiefSupervisor =
    !isSenderAdmin &&
    (message.sender_role as string) === 'chief_supervisor';

  const isSenderSupervisor =
    !isSenderAdmin &&
    !isSenderChiefSupervisor &&
    message.sender_role === 'supervisor';

  const isSenderTeacher =
    !isSenderAdmin &&
    !isSenderChiefSupervisor &&
    !isSenderSupervisor &&
    message.sender_role === 'teacher';

  // Match sidebar colors for each role
  const roleColor = isSenderAdmin
    ? '#C8963E'  // Admin - Gold/Amber
    : isSenderChiefSupervisor
    ? '#831843'  // Chief Supervisor - Deep Burgundy/Wine
    : isSenderSupervisor
    ? '#047857'  // Supervisor - Emerald Green
    : isSenderTeacher
    ? '#0369a1'  // Teacher - Sky Blue
    : getSenderRoleColor(message.sender_role);

  const roleLabel = isSenderAdmin
    ? 'الرئيس'
    : isSenderChiefSupervisor
    ? 'مشرف عام'
    : isSenderSupervisor
    ? 'مشرف'
    : getSenderRoleLabel(message.sender_role);

  const timeLabel = formatMessageTime(message.created_at);

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md"
        style={{ backgroundColor: roleColor }}
      >
        <User size={18} />
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
        {/* Sender Info */}
        <div className={cn('flex items-center gap-2 mb-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-sm font-bold text-gray-800">{message.sender_name}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
            style={{ backgroundColor: roleColor }}
          >
            {roleLabel}
          </span>
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            'relative px-4 py-3 rounded-2xl shadow-sm',
            isOwn
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md'
              : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.message}
          </p>

          {/* Delete Button (only for own messages) */}
          {isOwn && onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 cursor-pointer"
              title="حذف الرسالة"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 mt-1 px-1">
          {timeLabel}
        </span>
      </div>
    </div>
  );
};