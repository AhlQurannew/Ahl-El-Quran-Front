import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { WebSocketMessage } from '@/types/message';

interface UseWebSocketOptions {
  onMessage?: (data: WebSocketMessage) => void;
  onConnected?: (data: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    onMessage,
    onConnected,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  const connect = useCallback(() => {
    if (!accessToken) {
      console.warn('[WebSocket] No access token available');
      return;
    }

    // Determine WebSocket URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // Remove /api/v1 suffix if present to get base URL
    const baseUrl = apiUrl.replace(/\/api\/v1$/, '');
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = baseUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${wsHost}/ws/messages?token=${accessToken}`;

    try {
      console.log('[WebSocket] Connecting...');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        setIsConnected(true);
        setReconnectCount(0);
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', data);

          if (data.type === 'connected' && onConnected) {
            onConnected(data);
          } else if (onMessage) {
            onMessage(data);
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        if (onError) onError(error);
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnection if not intentional close and under max attempts
        if (event.code !== 1000 && reconnectCount < maxReconnectAttempts) {
          console.log(`[WebSocket] Reconnecting in ${reconnectInterval}ms... (attempt ${reconnectCount + 1}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount((prev) => prev + 1);
            connect();
          }, reconnectInterval);
        } else if (reconnectCount >= maxReconnectAttempts) {
          console.error('[WebSocket] Max reconnection attempts reached');
        }
      };
    } catch (err) {
      console.error('[WebSocket] Connection error:', err);
    }
  }, [accessToken, reconnectInterval, maxReconnectAttempts, reconnectCount, onMessage, onConnected, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      console.log('[WebSocket] Disconnecting...');
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
    setReconnectCount(0);
  }, []);

  const sendMessage = useCallback((data: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
      return false;
    }
  }, []);

  const sendChatMessage = useCallback((message: string, senderRole: string) => {
    return sendMessage({
      type: 'message',
      message,
      sender_role: senderRole,
    });
  }, [sendMessage]);

  const sendDeleteMessage = useCallback((messageId: number) => {
    return sendMessage({
      type: 'delete',
      message_id: messageId,
    });
  }, [sendMessage]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    return sendMessage({
      type: 'typing',
      is_typing: isTyping,
    });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    reconnectCount,
    sendChatMessage,
    sendDeleteMessage,
    sendTypingIndicator,
    disconnect,
    reconnect: connect,
  };
};
