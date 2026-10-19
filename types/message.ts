export type SenderRole = 'teacher' | 'supervisor' | 'chief_supervisor' | 'president';

export interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_role: SenderRole;
  message: string;
  created_at: string;
}

export interface MessageList {
  messages: Message[];
  total: number;
}

export interface MessagePayload {
  message: string;
  sender_role: SenderRole;
}

export interface WebSocketMessage {
  type: 'message' | 'delete' | 'typing' | 'connected' | 'error' | 'pong';
  id?: number;
  sender_id?: number;
  sender_name?: string;
  sender_role?: string;
  message?: string;
  created_at?: string;
  is_typing?: boolean;
  user_id?: number;
  president_id?: number;
  detail?: string;
}

// Utility functions
export const getSenderRoleColor = (role: SenderRole | string): string => {
  switch (role?.toLowerCase()) {
    case 'teacher':
      return '#4CAF50'; // Green
    case 'supervisor':
    case 'chief_supervisor':
      return '#2196F3'; // Blue
    case 'president':
    case 'admin':
      return '#E53935'; // Red
    default:
      return '#9E9E9E'; // Gray
  }
};

export const getSenderRoleLabel = (role: SenderRole | string): string => {
  switch (role?.toLowerCase()) {
    case 'teacher':
      return 'معلم';
    case 'supervisor':
      return 'مشرف';
    case 'chief_supervisor':
      return 'مشرف عام';
    case 'president':
    case 'admin':
      return 'الرئيس';
    default:
      return role || 'عضو';
  }
};

export const formatMessageTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  } catch {
    return '';
  }
};
