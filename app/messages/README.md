# Messages System

Real-time group chat system with WebSocket support and REST API fallback.

## Features

- **Real-time messaging** via WebSockets
- **Multi-tenancy** - isolated rooms per president_id
- **Typing indicators** - see when others are typing
- **Message deletion** - users can delete their own messages
- **Role-based display** - different colors for teachers, supervisors, and presidents
- **Auto-reconnection** - automatic reconnection on connection loss
- **REST API fallback** - works even when WebSocket is unavailable
- **Message history** - loads recent messages on connection
- **Responsive design** - modern glassmorphic UI

## Components

### MessagesPage
Main container component that handles WebSocket connection and message state.

### MessageBubble
Individual message display with role indicators and delete functionality.

### MessageInput
Text input with auto-resize, typing indicators, and keyboard shortcuts.

### TypingIndicator
Shows which users are currently typing.

## WebSocket Connection

The WebSocket connection is managed by the `useWebSocket` hook located in `/utils/useWebSocket.ts`.

**Connection URL:**
- Development: `ws://localhost:8000/ws/messages?token={JWT_TOKEN}`
- Production: `wss://your-domain.com/ws/messages?token={JWT_TOKEN}`

**Message Types:**
- `message` - New chat message
- `delete` - Message deletion event
- `typing` - Typing indicator
- `connected` - Connection established
- `error` - Error message

## Usage

Navigate to `/messages` to access the chat interface.

Users must be authenticated (have a valid JWT token) to connect.

## Role Colors

- **Teacher (معلم)** - Green (#4CAF50)
- **Supervisor (مشرف)** - Blue (#2196F3)
- **President (رئيس)** - Red (#E53935)

## API Integration

REST API endpoints are defined in `/app/API/messages.ts`:
- `POST /api/v1/messages` - Send message
- `GET /api/v1/messages/recent` - Get recent messages
- `DELETE /api/v1/messages/{id}` - Delete message

WebSocket endpoint:
- `WS /ws/messages?token={JWT_TOKEN}` - Real-time connection
