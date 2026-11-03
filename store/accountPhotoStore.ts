import { create } from 'zustand';
import axios from 'axios';
import accountSettingsAPI from '@/app/API/accountSettings';

type PhotoStatus = 'idle' | 'loading' | 'ready';

interface AccountPhotoState {
  /** Object URL of the signed-in account's avatar, or null when there is none. */
  src: string | null;
  status: PhotoStatus;
  /** Fetch the avatar once per page load; `force` refetches (e.g. after an upload). */
  load: (force?: boolean) => Promise<void>;
  upload: (file: File) => Promise<void>;
  remove: () => Promise<void>;
}

// Not persisted: object URLs only live as long as the page.
export const useAccountPhotoStore = create<AccountPhotoState>()((set, get) => {
  const replaceSrc = (next: string | null) => {
    const previous = get().src;
    if (previous) URL.revokeObjectURL(previous);
    set({ src: next, status: 'ready' });
  };

  return {
    src: null,
    status: 'idle',
    load: async (force = false) => {
      if (!force && get().status !== 'idle') return;
      set({ status: 'loading' });
      try {
        const blob = await accountSettingsAPI.getPhoto();
        // 204 (empty body) means no avatar yet.
        replaceSrc(blob.size > 0 ? URL.createObjectURL(blob) : null);
      } catch (error) {
        // A 404 from an older backend also means no avatar; anything else is logged but non-fatal.
        if (!axios.isAxiosError(error) || error.response?.status !== 404) {
          console.error('Unable to load account photo:', error);
        }
        replaceSrc(null);
      }
    },
    upload: async (file) => {
      await accountSettingsAPI.uploadPhoto(file);
      await get().load(true);
    },
    remove: async () => {
      await accountSettingsAPI.deletePhoto();
      replaceSrc(null);
    },
  };
});
