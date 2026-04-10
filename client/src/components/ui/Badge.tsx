import React from 'react';
import { uiRadius } from './designSystem';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({ children, tone = 'neutral' }) => {
  const tones: Record<BadgeTone, string> = {
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 ${uiRadius.md} text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
};
