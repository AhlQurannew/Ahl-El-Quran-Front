import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

const avatarColors = [
  'from-emerald-400 to-teal-600',
  'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',
  'from-amber-400 to-orange-600',
  'from-rose-400 to-red-600',
];

function getColorForName(name?: string): string {
  if (!name) return avatarColors[0];
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  status,
  className,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-gray-400',
    busy: 'bg-amber-500',
  };

  const getInitials = (name?: string) => {
    if (!name) return null;
    const parts = name.trim().split(' ');
    return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  };

  const initials = getInitials(name);
  const gradient = getColorForName(name);

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'relative inline-flex items-center justify-center rounded-full overflow-hidden ring-2 ring-white',
          'font-bold text-white shadow-md',
          !src && `bg-gradient-to-br ${gradient}`,
          sizes[size]
        )}
      >
        {src ? (
          <Image src={src} alt={alt || name || 'Avatar'} fill className="object-cover" />
        ) : initials ? (
          <span className="leading-none">{initials}</span>
        ) : (
          <User size={size === 'sm' ? 14 : size === 'xl' ? 26 : 18} />
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 left-0 rounded-full border-2 border-white',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};
