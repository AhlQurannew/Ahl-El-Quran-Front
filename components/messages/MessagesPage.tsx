'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MessageCircle, WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Toast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useWebSocket } from '@/utils/useWebSocket';
import { useAuthStore } from '@/store/authStore';
import { useAdminView } from '@/contexts/AdminViewContext';
import messagesAPI from '@/app/API/messages';
import type { Message, WebSocketMessage, SenderRole } from '@/types/message';
import { cn } from '@/utils/cn';

type ToastState = { visible: boolean; type: 'success' | 'info' | 'error'; message: string };

interface TypingUser {
  sender_id: number;
  sender_name: string;
}

export const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [toast, setToast] = useState<ToastState>({ visible: false, type: 'success', message: '' });
  const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const { isAdminViewing } = useAdminView();
  const effectiveRole = useAuthStore((state) => state.effectiveRole);

  const userRole: SenderRole = useMemo(() => {
    const rawUserRole = (user?.role || '').toLowerCase();
    const rawEffRole = (effectiveRole || '').toLowerCase();
    
    let hasAdminSession = false;
    if (typeof window !== 'undefined') {
      const adminView = sessionStorage.getItem('admin_viewing_school');
      if (adminView) hasAdminSession = true;
    }

    if (rawUserRole === 'admin' || rawUserRole === 'president' || rawEffRole === 'admin' || hasAdminSession || isAdminViewing) {
      return 'president';
    }
    if (rawUserRole === 'chief_supervisor' || rawEffRole === 'chief_supervisor') {
      return 'chief_supervisor' as SenderRole;
    }
    if (rawUserRole === 'supervisor' || rawEffRole === 'supervisor') {
      return 'supervisor';
    }
    if (rawUserRole === 'teacher') {
      return 'teacher';
    }
    return 'president';
  }, [user?.role, effectiveRole, isAdminViewing]);

  const showToast = (type: ToastState['type'], message: string) =>
    setToast({ visible: true, type, message });

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Load message history
  const loadMessageHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await messagesAPI.getRecentMessages(100);
      const messageList = response.messages || [];
      // Reverse to show oldest first (API returns newest first)
      setMessages(messageList.reverse());
      setTimeout(() => scrollToBottom('auto'), 100);
    } catch (err) {
      console.error('Failed to load message history:', err);
      showToast('error', 'فشل تحميل سجل الرسائل');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [scrollToBottom]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    if (data.type === 'message' && data.id) {
      const newMessage: Message = {
        id: data.id,
        sender_id: data.sender_id!,
        sender_name: data.sender_name!,
        sender_role: data.sender_role as SenderRole,
        message: data.message!,
        created_at: data.created_at!,
      };

      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      setTimeout(() => scrollToBottom(), 100);
    } else if (data.type === 'delete' && data.id) {
      setMessages((prev) => prev.filter((m) => m.id !== data.id));
    } else if (data.type === 'typing') {
      const senderId = data.sender_id!;
      const senderName = data.sender_name!;
      const isTyping = data.is_typing ?? false;

      // Clear existing timeout for this user
      const existingTimeout = typingTimeoutsRef.current.get(senderId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        typingTimeoutsRef.current.delete(senderId);
      }

      if (isTyping && senderId !== userId) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.sender_id === senderId)) return prev;
          return [...prev, { sender_id: senderId, sender_name: senderName }];
        });

        // Auto-remove after 3 seconds
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.sender_id !== senderId));
          typingTimeoutsRef.current.delete(senderId);
        }, 3000);
        typingTimeoutsRef.current.set(senderId, timeout);
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.sender_id !== senderId));
      }
    }
  }, [scrollToBottom, userId]);

  const handleConnected = useCallback((data: WebSocketMessage) => {
    console.log('Connected to chat:', data);
    showToast('success', 'تم الاتصال بالدردشة');
  }, []);

  const handleError = useCallback((error: Event) => {
    console.warn('[Chat] WebSocket error', error);
    // Don't show error toast - the connection status indicator in the header handles this
  }, []);

  const {
    isConnected,
    reconnectCount,
    sendChatMessage,
    sendDeleteMessage,
    sendTypingIndicator,
    reconnect,
  } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onConnected: handleConnected,
    onError: handleError,
  });

  // Load message history on mount
  useEffect(() => {
    loadMessageHistory();
  }, [loadMessageHistory]);

  // Cleanup typing timeouts
  useEffect(() => {
    return () => {
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
    };
  }, []);

  const handleSendMessage = (messageText: string) => {
    if (!userRole) {
      showToast('error', 'غير قادر على تحديد دورك');
      return;
    }

    // Validate role is allowed to send messages
    const allowedRoles: SenderRole[] = ['teacher', 'supervisor', 'president'];
    if (!allowedRoles.includes(userRole)) {
      showToast('error', 'غير مسموح لك بإرسال الرسائل');
      return;
    }

    const success = sendChatMessage(messageText, userRole);
    
    if (!success) {
      // Fallback to REST API if WebSocket is not available
      messagesAPI
        .createMessage({ message: messageText, sender_role: userRole })
        .then(() => {
          showToast('info', 'تم إرسال الرسالة عبر الخادم');
          loadMessageHistory();
        })
        .catch((err) => {
          console.error('Failed to send message via REST:', err);
          showToast('error', 'فشل إرسال الرسالة');
        });
    }
  };

  const handleRequestDelete = (messageId: number) => {
    setDeleteConfirmMessageId(messageId);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmMessageId) return;
    const messageId = deleteConfirmMessageId;
    setDeleteConfirmMessageId(null);

    const success = sendDeleteMessage(messageId);
    if (success) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      showToast('success', 'تم حذف الرسالة بنجاح');
    } else {
      // Fallback to REST API
      messagesAPI
        .deleteMessage(messageId)
        .then(() => {
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
          showToast('success', 'تم حذف الرسالة بنجاح');
        })
        .catch((err) => {
          console.error('Failed to delete message via REST:', err);
          showToast('error', 'فشل حذف الرسالة');
        });
    }
  };

  const handleTyping = (isTyping: boolean) => {
    sendTypingIndicator(isTyping);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <MessageCircle size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">الرسائل الجماعية</h1>
              <p className="text-sm text-gray-500">
                {isConnected ? (
                  <span className="flex items-center gap-1.5">
                    <Wifi size={14} className="text-emerald-500" />
                    <span className="text-emerald-600 font-medium">متصل</span>
                  </span>
                ) : reconnectCount > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw size={14} className="text-orange-500 animate-spin" />
                    <span className="text-orange-600 font-medium">إعادة الاتصال...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <WifiOff size={14} className="text-red-500" />
                    <span className="text-red-600 font-medium">غير متصل</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={reconnect}
            disabled={isConnected}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isConnected
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
            )}
          >
            إعادة الاتصال
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw size={32} className="text-emerald-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-600 font-medium">جاري تحميل الرسائل...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={40} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">لا توجد رسائل بعد</h2>
              <p className="text-gray-600">ابدأ محادثة جديدة بإرسال رسالتك الأولى</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === userId || (userRole === 'president' && message.sender_role === 'president')}
                onDelete={handleRequestDelete}
              />
            ))}
            <TypingIndicator typingUsers={typingUsers} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

            {/* Input Area — enabled for all roles (teacher, supervisor, president, admin) */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <MessageInput
          onSend={handleSendMessage}
          onTyping={handleTyping}
          disabled={!isConnected && reconnectCount === 0}
          placeholder={isConnected ? 'اكتب رسالتك هنا...' : 'غير متصل - جاري إعادة الاتصال...'}
        />
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmMessageId !== null}
        onClose={() => setDeleteConfirmMessageId(null)}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف الرسالة"
        message="هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        variant="danger"
      />

      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  );
};
