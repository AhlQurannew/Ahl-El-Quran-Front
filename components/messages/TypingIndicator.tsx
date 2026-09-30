'use client';

import React from 'react';

interface TypingUser {
  sender_id: number;
  sender_name: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.sender_name).join('، ');
  const text = typingUsers.length === 1 ? `${names} يكتب...` : `${names} يكتبون...`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
};
