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
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const reconnectCountRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  const connectRef = useRef<(() => void) | null>(null);

  const onMessageRef = useRef(onMessage);
  const onConnectedRef = useRef(onConnected);
  const onErrorRef = useRef(onError);

  const accessToken = useAuthStore((state) => state.accessToken);
  const accessTokenRef = useRef(accessToken);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectedRef.current = onConnected;
    onErrorRef.current = onError;
    accessTokenRef.current = accessToken;
  }, [accessToken, onConnected, onError, onMessage]);

  const clearPingInterval = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  };

  const connect = useCallback(() => {
    const token = accessTokenRef.current;
    if (!token) {
      console.warn('[WebSocket] No access token available');
      return;
    }

    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      const previousSocket = wsRef.current;
      previousSocket.onopen = null;
      previousSocket.onmessage = null;
      previousSocket.onerror = null;
      previousSocket.onclose = null;
      wsRef.current = null;
      previousSocket.close(1000, 'Reconnecting');
    }
    clearPingInterval();

    const apiUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL)?.replace('/api/v1', '') || 'http://localhost:8000';
    const baseUrl = apiUrl.replace(/\/api\/v1$/, '');
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = baseUrl.replace(/^https?:\/\//, '');

    let schoolIdParam = '';
    if (typeof window !== 'undefined') {
      const adminView = sessionStorage.getItem('admin_viewing_school');
      if (adminView) {
        try {
          const { id } = JSON.parse(adminView);
          if (id) schoolIdParam = `&school_id=${id}`;
        } catch {}
      }
    }

    // Pass ngrok-skip-browser-warning to bypass ngrok interstitial warning on WebSocket upgrade
    const ngrokParam = wsHost.includes('ngrok') ? '&ngrok-skip-browser-warning=true' : '';
    const wsUrl = `${wsProtocol}://${wsHost}/ws/messages?token=${token}${schoolIdParam}${ngrokParam}`;

    try {
      console.log('[WebSocket] Connecting...');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current !== ws) return;
        console.log('[WebSocket] Connected successfully');
        reconnectCountRef.current = 0;
        setIsConnected(true);
        setReconnectCount(0);

        // Keep-alive ping every 25s
        clearPingInterval();
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return;
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          if (data.type === 'pong') {
            return;
          }
          if (data.type === 'connected' && onConnectedRef.current) {
            onConnectedRef.current(data);
          } else if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        if (wsRef.current !== ws) return;
        console.warn('[WebSocket] Connection error; waiting for close/reconnect');
        if (onErrorRef.current) onErrorRef.current(error);
      };

      ws.onclose = (event) => {
        if (wsRef.current !== ws) return;
        console.log('[WebSocket] Connection closed:', event.code, event.reason);
        clearPingInterval();
        wsRef.current = null;
        setIsConnected(false);

        if (!shouldReconnectRef.current || event.code === 1000 || event.code === 4001) {
          setReconnectCount(0);
          return;
        }

        if (reconnectCountRef.current < maxReconnectAttempts) {
          reconnectCountRef.current += 1;
          const attempt = reconnectCountRef.current;
          console.log(`[WebSocket] Reconnecting in ${reconnectInterval}ms... (attempt ${attempt}/${maxReconnectAttempts})`);
          setReconnectCount(attempt);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, reconnectInterval);
        } else {
          console.error('[WebSocket] Max reconnection attempts reached');
          setReconnectCount(0);
        }
      };
    } catch (err) {
      console.error('[WebSocket] Connection error:', err);
    }
  }, [maxReconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    clearPingInterval();
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      console.log('[WebSocket] Disconnecting...');
      const socket = wsRef.current;
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      wsRef.current = null;
      if (socket.readyState < WebSocket.CLOSING) {
        socket.close(1000, 'Client disconnect');
      }
    }
    setIsConnected(false);
    setReconnectCount(0);
    reconnectCountRef.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    shouldReconnectRef.current = true;
    reconnectCountRef.current = 0;
    setReconnectCount(0);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    connect();
  }, [connect]);

  const sendMessage = useCallback((data: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    console.warn('[WebSocket] Cannot send message: not connected');
    return false;
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
      id: messageId,
    });
  }, [sendMessage]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    return sendMessage({
      type: 'typing',
      is_typing: isTyping,
    });
  }, [sendMessage]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (!accessToken) return;
    shouldReconnectRef.current = true;
    connect();
    return () => {
      disconnect();
    };
  }, [accessToken, connect, disconnect]);

  return {
    isConnected,
    reconnectCount,
    sendMessage,
    sendChatMessage,
    sendDeleteMessage,
    sendTypingIndicator,
    disconnect,
    reconnect,
  };
};
