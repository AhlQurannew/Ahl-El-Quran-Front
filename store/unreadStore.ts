'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import announcementsAPI, { type UnreadCounts } from '@/app/API/announcements';
import { useAuthStore } from '@/store/authStore';

/** Red dots of the sidebar: new announcements and chat messages since the pages were last opened. */
interface UnreadState extends UnreadCounts {
  set: (counts: UnreadCounts) => void;
}

export const useUnreadStore = create<UnreadState>((set) => ({
  announcements: 0,
  messages: 0,
  set: (counts) => set({ announcements: counts.announcements, messages: counts.messages }),
}));

const POLL_MS = 45_000;

const pageKind = (pathname: string): 'announcements' | 'messages' | null => {
  if (/(^|\/)announcements$/.test(pathname)) return 'announcements';
  if (/(^|\/)messages$/.test(pathname)) return 'messages';
  return null;
};

/**
 * Keeps the counters fresh while the app is open. On the announcements or chat page the visit
 * itself marks that kind as seen, so its dot clears and new items read there never light it up.
 */
export function useUnreadPolling(pathname: string) {
  const token = useAuthStore((s) => s.accessToken);
  const setCounts = useUnreadStore((s) => s.set);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const kind = pageKind(pathname);
        const counts = kind ? await announcementsAPI.markSeen(kind) : await announcementsAPI.unread();
        if (!cancelled) setCounts(counts);
      } catch {
        // Counters are a convenience: a failed poll just keeps the previous dots.
      }
    };
    refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pathname, token, setCounts]);
}
