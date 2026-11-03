'use client';

import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import messagesAPI from '@/app/API/messages';

interface SenderAvatarProps {
  senderId?: number | null;
  adminSenderId?: number | null;
  name: string;
  color: string;
}

// One request per sender per page load, shared by every bubble from that sender.
const photoCache = new Map<string, Promise<string | null>>();

function loadSenderPhoto(senderId?: number | null, adminSenderId?: number | null): Promise<string | null> {
  const key = adminSenderId != null ? `admin-${adminSenderId}` : `user-${senderId}`;
  let pending = photoCache.get(key);
  if (!pending) {
    pending = messagesAPI
      .getSenderPhoto({ sender_id: senderId, admin_sender_id: adminSenderId })
      .then((blob) => URL.createObjectURL(blob))
      .catch(() => null); // 404 = no photo; the role-coloured icon is shown instead
    photoCache.set(key, pending);
  }
  return pending;
}

export const SenderAvatar: React.FC<SenderAvatarProps> = ({ senderId, adminSenderId, name, color }) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (senderId == null && adminSenderId == null) return;
    let active = true;
    void loadSenderPhoto(senderId, adminSenderId).then((url) => {
      if (active) setSrc(url);
    });
    return () => {
      active = false;
    };
  }, [senderId, adminSenderId]);

  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white shadow-md"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob: URLs are not supported by next/image
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <User size={18} />
      )}
    </div>
  );
};
