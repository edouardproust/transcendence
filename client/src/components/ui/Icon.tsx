import React from 'react';

type IconName = 'user' | 'chat' | 'gamepad' | 'bell' | 'check' | 'x';

interface IconProps {
  name: IconName;
  className?: string;
}

const paths: Record<IconName, JSX.Element> = {
  user: <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />,
  chat: <path d="M4 4h16v10H8l-4 4V4z" />,
  gamepad: <path d="M7 10h10l2 6h-2l-1-2H8l-1 2H5l2-6zm2 2v2h2v-2H9zm4 0v2h2v-2h-2z" />,
  bell: <path d="M12 3a4 4 0 0 0-4 4v3L6 13v1h12v-1l-2-3V7a4 4 0 0 0-4-4zm0 18a3 3 0 0 0 2.8-2h-5.6A3 3 0 0 0 12 21z" />,
  check: <path d="M9 16.2 5.8 13 4.4 14.4 9 19l11-11-1.4-1.4z" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
};

export const Icon: React.FC<IconProps> = ({ name, className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    {paths[name]}
  </svg>
);
