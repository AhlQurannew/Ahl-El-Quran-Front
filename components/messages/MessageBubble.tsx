'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, FileText, LoaderCircle, Trash2, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Message, MessageAttachment } from '@/types/message';
import { getSenderRoleColor, getSenderRoleLabel, formatMessageTime } from '@/types/message';
import messagesAPI from '@/app/API/messages';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (messageId: number) => void;
}

const RASTER_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} ك.ب`;
  return `${(size / (1024 * 1024)).toFixed(1)} م.ب`;
};

const AuthenticatedImage: React.FC<{ attachment: MessageAttachment }> = ({ attachment }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    messagesAPI.getAttachment(attachment.id)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.id]);

  if (hasError) return <p className="text-xs text-red-100">تعذر تحميل معاينة الصورة</p>;
  if (!src) {
    return (
      <div className="flex h-40 w-56 max-w-full items-center justify-center rounded-lg bg-black/10" aria-label="جارٍ تحميل الصورة">
        <LoaderCircle size={22} className="animate-spin" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={attachment.filename}
      width={320}
      height={240}
      unoptimized
      className="max-h-72 max-w-full rounded-lg object-contain"
    />
  );
};

const AttachmentCard: React.FC<{ attachment: MessageAttachment }> = ({ attachment }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  const download = async () => {
    setIsDownloading(true);
    setError('');
    try {
      const blob = await messagesAPI.getAttachment(attachment.id);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setError('تعذر تنزيل الملف. حاول مرة أخرى.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex min-w-56 max-w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-gray-800 shadow-sm">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700" aria-hidden="true">
        <FileText size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold" title={attachment.filename}>{attachment.filename}</span>
        <span className="text-xs text-gray-500">{formatFileSize(attachment.size)}</span>
      </span>
      <button
        type="button"
        onClick={() => void download()}
        disabled={isDownloading}
        aria-label={`تنزيل ${attachment.filename}`}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-60"
      >
        {isDownloading ? <LoaderCircle size={18} className="animate-spin" /> : <Download size={18} />}
      </button>
      {error && <span role="alert" className="basis-full text-xs text-red-700">{error}</span>}
    </div>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, onDelete }) => {
  const isSenderAdmin =
    message.sender_role === 'president' ||
    (message.sender_role as string) === 'admin' ||
    message.sender_name?.trim() === 'الرئيس' ||
    message.sender_name?.toLowerCase() === 'admin' ||
    message.sender_name === 'مسؤول النظام';

  const isSenderChiefSupervisor = !isSenderAdmin && (message.sender_role as string) === 'chief_supervisor';
  const isSenderSupervisor = !isSenderAdmin && !isSenderChiefSupervisor && message.sender_role === 'supervisor';
  const isSenderTeacher = !isSenderAdmin && !isSenderChiefSupervisor && !isSenderSupervisor && message.sender_role === 'teacher';

  const roleColor = isSenderAdmin
    ? '#C8963E'
    : isSenderChiefSupervisor
      ? '#831843'
      : isSenderSupervisor
        ? '#047857'
        : isSenderTeacher
          ? '#0369a1'
          : getSenderRoleColor(message.sender_role);

  const roleLabel = (message.sender_role as string) === 'admin'
    ? 'مدير النظام'
    : isSenderAdmin
      ? 'الرئيس'
    : isSenderChiefSupervisor
      ? 'مشرف عام'
      : isSenderSupervisor
        ? 'مشرف'
        : getSenderRoleLabel(message.sender_role);
  const timeLabel = formatMessageTime(message.created_at);
  const attachments = message.attachments ?? [];

  return (
    <div className={cn('mb-4 flex animate-in slide-in-from-bottom-2 gap-3 fade-in duration-300', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
        style={{ backgroundColor: roleColor }}
        aria-hidden="true"
      >
        <User size={18} />
      </div>

      <div className={cn('relative flex max-w-[85%] flex-col gap-2 sm:max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
        <div className={cn('mb-1 flex items-center gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-sm font-bold text-gray-800">{message.sender_name}</span>
          <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: roleColor }}>
            {roleLabel}
          </span>
        </div>

        {message.message && (
          <div
            className={cn(
              'rounded-2xl px-4 py-3 shadow-sm',
              isOwn
                ? 'rounded-br-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                : 'rounded-bl-md border border-gray-200 bg-white text-gray-800',
            )}
          >
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.message}</p>
          </div>
        )}

        {attachments.map((attachment) => (
          <div key={attachment.id} className="max-w-full">
            {RASTER_IMAGE_TYPES.has(attachment.content_type.toLowerCase()) ? (
              <AuthenticatedImage attachment={attachment} />
            ) : (
              <AttachmentCard attachment={attachment} />
            )}
          </div>
        ))}

        {isOwn && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(message.id)}
            aria-label="حذف الرسالة"
            title="حذف الرسالة"
            className="absolute -left-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all duration-200 hover:scale-110 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <Trash2 size={12} />
          </button>
        )}

        <span className="mt-1 px-1 text-xs text-gray-500">{timeLabel}</span>
      </div>
    </div>
  );
};
