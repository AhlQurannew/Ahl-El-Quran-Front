// types/message.types.ts

// 1. Définition du rôle de l'expéditeur
export type SenderRole = 'teacher' | 'supervisor' | 'president';

// Mappings pour centraliser les rôles, les libellés arabes et les couleurs hexadécimales
export const SenderRoleDetails: Record<SenderRole, { displayName: string; color: string }> = {
  teacher: { displayName: 'معلم', color: '#4CAF50' },
  supervisor: { displayName: 'مشرف عام', color: '#2196F3' },
  president: { displayName: 'الرئيس', color: '#E53935' },
};

export const getSenderRoleFromString = (role: string): SenderRole => {
  switch (role?.toLowerCase()) {
    case 'supervisor':
      return 'supervisor';
    case 'president':
      return 'president';
    case 'teacher':
  default:
    return 'teacher';
  }
};

// 2. Interface principale du Message
export interface Message {
  id: number | null;
  senderId: number | null;
  senderName: string;
  senderRole: SenderRole;
  message: string;
  createdAt: string | null; // Stocké sous forme de chaîne ISO (string)
}

// 3. Interface pour la liste paginée ou groupée
export interface MessageList {
  messages: Message[];
  total: number;
}

/**
 * Utilitaires de conversion et fonctions utilitaires pour les messages
 */
export const MessageMapper = {
  fromJson(json: Record<string, unknown>): Message {
    const id = json.id;
    const senderId = json.sender_id ?? json.senderId;
    const senderName = json.sender_name ?? json.senderName;
    const senderRole = json.sender_role ?? json.senderRole;
    const message = json.message;
    const createdAt = json.created_at ?? json.createdAt;

    return {
      id: typeof id === 'number' ? id : null,
      senderId: typeof senderId === 'number' ? senderId : null,
      senderName: typeof senderName === 'string' ? senderName : '',
      senderRole: getSenderRoleFromString(typeof senderRole === 'string' ? senderRole : ''),
      message: typeof message === 'string' ? message : '',
      createdAt: typeof createdAt === 'string' ? createdAt : null,
    };
  },

  toJson(message: Message): Record<string, unknown> {
    return {
      'message': message.message,
      'sender_role': message.senderRole,
    };
  },

  /**
   * Équivalent de getFormattedTime() en Dart pour l'affichage en arabe
   */
  getFormattedTime(createdAt: string | null): string {
    if (!createdAt) return '';

    const createdDate = new Date(createdAt);
    if (isNaN(createdDate.getTime())) return '';

    const now = new Date();
    const differenceInMs = now.getTime() - createdDate.getTime();
    
    const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
    const differenceInHours = Math.floor(differenceInMs / (1000 * 60 * 60));
    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

    if (differenceInMinutes < 1) {
      return 'الآن';
    } else if (differenceInHours < 1) {
      return `منذ ${differenceInMinutes} دقيقة`;
    } else if (differenceInDays < 1) {
      return `منذ ${differenceInHours} ساعة`;
    } else {
      return `${createdDate.getDate()}/${createdDate.getMonth() + 1}/${createdDate.getFullYear()}`;
    }
  }
};

export const MessageListMapper = {
  fromJson(json: Record<string, unknown>): MessageList {
    const rawMessages = json.messages;
    const total = json.total;

    const messagesList = Array.isArray(rawMessages)
      ? rawMessages.map((m) => MessageMapper.fromJson(m as Record<string, unknown>))
      : [];

    return {
      messages: messagesList,
      total: typeof total === 'number' ? total : 0,
    };
  }
};