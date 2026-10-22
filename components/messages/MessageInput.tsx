'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FileText, ImagePlus, LoaderCircle, Paperclip, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg',
  'pdf', 'txt', 'csv', 'docx', 'xlsx', 'pptx',
]);
const RASTER_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.svg,image/jpeg,image/png,image/webp,image/gif,image/svg+xml';
const FILE_ACCEPT = '.pdf,.txt,.csv,.docx,.xlsx,.pptx,application/pdf,text/plain,text/csv,application/vnd.openxmlformats-officedocument';

interface SelectedFile {
  id: number;
  file: File;
  previewUrl?: string;
}

interface MessageInputProps {
  onSend: (message: string, attachments: File[], onProgress: (progress: number) => void) => Promise<void> | void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} ك.ب`;
  return `${(size / (1024 * 1024)).toFixed(1)} م.ب`;
};

const getExtension = (filename: string) => filename.split('.').pop()?.toLowerCase() || '';

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'اكتب رسالتك هنا...',
}) => {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextFileIdRef = useRef(0);
  const previewUrlsRef = useRef(new Set<string>());

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  const releasePreview = (url?: string) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  };

  const addFiles = (incomingFiles: FileList | File[]) => {
    const additions: SelectedFile[] = [];
    const errors: string[] = [];
    let totalSize = selectedFiles.reduce((total, item) => total + item.file.size, 0);

    Array.from(incomingFiles).forEach((file) => {
      const extension = getExtension(file.name);
      if (!ALLOWED_EXTENSIONS.has(extension)) {
        errors.push(`نوع الملف «${file.name}» غير مسموح به`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`حجم «${file.name}» يتجاوز 25 م.ب`);
        return;
      }
      if (selectedFiles.length + additions.length >= MAX_FILES) {
        errors.push('الحد الأقصى هو 5 مرفقات');
        return;
      }
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        errors.push('إجمالي حجم المرفقات لا يمكن أن يتجاوز 50 م.ب');
        return;
      }

      const isRaster = RASTER_EXTENSIONS.has(extension);
      const previewUrl = isRaster ? URL.createObjectURL(file) : undefined;
      if (previewUrl) previewUrlsRef.current.add(previewUrl);
      additions.push({ id: nextFileIdRef.current++, file, previewUrl });
      totalSize += file.size;
    });

    if (additions.length) setSelectedFiles((current) => [...current, ...additions]);
    setError(errors.join('، '));
  };

  const removeFile = (id: number) => {
    const removed = selectedFiles.find((item) => item.id === id);
    releasePreview(removed?.previewUrl);
    setSelectedFiles((current) => current.filter((item) => item.id !== id));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const trimmed = message.trim();
    if ((!trimmed && selectedFiles.length === 0) || disabled || isSending) return;

    setIsSending(true);
    setError('');
    try {
      await onSend(trimmed, selectedFiles.map((item) => item.file), setUploadProgress);
      setMessage('');
      selectedFiles.forEach((item) => releasePreview(item.previewUrl));
      setSelectedFiles([]);
      setUploadProgress(null);
      onTyping?.(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'تعذر إرسال الرسالة. حاول مرة أخرى.');
    } finally {
      setIsSending(false);
      setUploadProgress(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit(event);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping(false), 1000);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  };

  const canSend = !disabled && !isSending && (message.trim().length > 0 || selectedFiles.length > 0);

  return (
    <form
      onSubmit={handleSubmit}
      onDragOver={(event) => {
        if (Array.from(event.dataTransfer.types).includes('Files')) {
          event.preventDefault();
          setIsDragging(true);
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
      }}
      onDrop={handleDrop}
      aria-label="إرسال رسالة أو مرفق"
      dir="rtl"
      className={cn(
        'relative flex flex-col gap-3 rounded-2xl transition-colors',
        isDragging && 'bg-emerald-50 ring-2 ring-inset ring-emerald-400',
      )}
    >
      {selectedFiles.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="المرفقات المحددة">
          {selectedFiles.map(({ id, file, previewUrl }) => (
            <li key={id} className="flex max-w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 text-right">
              {previewUrl ? (
                <Image src={previewUrl} alt={`معاينة ${file.name}`} width={48} height={48} unoptimized className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700" aria-hidden="true">
                  <FileText size={20} />
                </span>
              )}
              <span className="min-w-0">
                <span className="block max-w-40 truncate text-xs font-semibold text-gray-800" title={file.name}>{file.name}</span>
                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(id)}
                disabled={isSending || disabled}
                aria-label={`إزالة المرفق ${file.name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-2 sm:gap-3">
        <div className="flex shrink-0 items-center gap-1">
          <input
            ref={imageInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="sr-only"
            aria-label="اختيار صور"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || isSending}
            aria-label="إرفاق صورة"
            title="إرفاق صورة"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus size={19} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_ACCEPT}
            multiple
            className="sr-only"
            aria-label="اختيار مستندات"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSending}
            aria-label="إرفاق ملف"
            title="إرفاق ملف"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Paperclip size={19} />
          </button>
        </div>

        <div className="relative min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label="نص الرسالة"
            disabled={disabled || isSending}
            placeholder={placeholder}
            rows={1}
            className={cn(
              'min-h-12 max-h-30 w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-3',
              'text-sm text-gray-800 placeholder-gray-400 transition-all duration-200',
              'focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100',
              'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60',
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={!canSend}
          size="md"
          variant="primary"
          className="h-12 shrink-0"
        >
          {isSending ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
          <span>{isSending ? 'جارٍ الإرسال' : 'إرسال'}</span>
        </Button>
      </div>

      {isSending && selectedFiles.length > 0 && (
        <div className="flex items-center gap-3" aria-live="polite">
          <progress
            value={uploadProgress ?? 0}
            max={100}
            aria-label="تقدم رفع المرفقات"
            className="h-2 flex-1 overflow-hidden rounded-full accent-emerald-600"
          />
          <span className="min-w-10 text-xs font-medium text-gray-600">{uploadProgress ?? 0}%</span>
        </div>
      )}

      <p className="text-xs text-gray-500">حتى 5 مرفقات، 25 م.ب للملف الواحد و50 م.ب إجمالًا. اسحب الملفات وأفلتها هنا.</p>
      {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-emerald-50/90 text-sm font-bold text-emerald-800">
          أفلت الملفات لإرفاقها
        </div>
      )}
    </form>
  );
};
