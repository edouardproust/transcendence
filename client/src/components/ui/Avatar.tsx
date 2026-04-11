import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md' }) => {
  const defaultAvatar = '/uploads/avatars/default.svg';
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <img
      src={src && src.trim() ? src : defaultAvatar}
      alt={alt}
      className={`${sizes[size]} rounded-full border border-gray-300 dark:border-gray-600 object-cover`}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = defaultAvatar;
      }}
    />
  );
};
