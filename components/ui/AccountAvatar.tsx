'use client';

import React, { useEffect } from 'react';
import { useAccountPhotoStore } from '@/store/accountPhotoStore';
import { cn } from '@/utils/cn';

interface AccountAvatarProps {
  /** Used for the initial when there is no photo, and as alt text. */
  name: string;
  className?: string;
}

/** The signed-in account's profile picture, falling back to the name's initial. */
export const AccountAvatar: React.FC<AccountAvatarProps> = ({ name, className }) => {
  const src = useAccountPhotoStore((state) => state.src);
  const load = useAccountPhotoStore((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-amber-400 to-orange-500 font-bold text-white',
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob: URLs are not supported by next/image
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{name.trim().charAt(0).toUpperCase() || '?'}</span>
      )}
    </div>
  );
};
