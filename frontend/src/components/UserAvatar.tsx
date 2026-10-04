import { useState } from 'react';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

// 12 curated vibrant gradients for distinct user identities
const PALETTES = [
  { bg: 'from-orange-500 to-amber-600', border: 'border-orange-300/40', shadow: 'shadow-orange-500/25' },
  { bg: 'from-blue-600 to-cyan-600', border: 'border-blue-300/40', shadow: 'shadow-blue-500/25' },
  { bg: 'from-emerald-500 to-teal-700', border: 'border-emerald-300/40', shadow: 'shadow-emerald-500/25' },
  { bg: 'from-purple-600 to-indigo-700', border: 'border-purple-300/40', shadow: 'shadow-purple-500/25' },
  { bg: 'from-pink-500 to-rose-600', border: 'border-pink-300/40', shadow: 'shadow-pink-500/25' },
  { bg: 'from-amber-500 to-red-600', border: 'border-amber-300/40', shadow: 'shadow-amber-500/25' },
  { bg: 'from-indigo-600 to-blue-700', border: 'border-indigo-300/40', shadow: 'shadow-indigo-500/25' },
  { bg: 'from-violet-600 to-fuchsia-600', border: 'border-violet-300/40', shadow: 'shadow-violet-500/25' },
  { bg: 'from-red-500 to-pink-600', border: 'border-red-300/40', shadow: 'shadow-red-500/25' },
  { bg: 'from-teal-500 to-green-600', border: 'border-teal-300/40', shadow: 'shadow-teal-500/25' },
  { bg: 'from-sky-500 to-indigo-600', border: 'border-sky-300/40', shadow: 'shadow-sky-500/25' },
  { bg: 'from-rose-600 to-orange-600', border: 'border-rose-300/40', shadow: 'shadow-rose-500/25' }
];

/**
 * Extracts initials. In Vietnamese, the first letter of the given name (the last word)
 * is the most natural identifier (e.g., "Nguyễn Văn Viên" -> "V", "Admin" -> "A").
 */
export function getUserInitial(name?: string): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  const lastWord = parts[parts.length - 1];
  return (lastWord[0] || parts[0][0] || 'U').toUpperCase();
}

/**
 * Deterministically generates a unique palette based on the user's name/identifier
 */
export function getAvatarPalette(identifier?: string) {
  if (!identifier) return PALETTES[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

const SIZE_MAP = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-3xl'
};

export default function UserAvatar({
  name,
  avatarUrl,
  size = 'md',
  className = '',
  showBorder = true
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const palette = getAvatarPalette(name);
  const initial = getUserInitial(name);
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  if (avatarUrl && !imageError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden shadow-md ${sizeClasses} ${
          showBorder ? `border-2 ${palette.border}` : ''
        } ${className}`}
      >
        <img
          src={avatarUrl}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none bg-gradient-to-tr ${palette.bg} ${palette.shadow} shadow-md text-white font-black uppercase tracking-wider ${sizeClasses} ${
        showBorder ? `border-2 ${palette.border}` : ''
      } ${className}`}
    >
      <span className="drop-shadow-sm pointer-events-none">{initial}</span>
    </div>
  );
}
