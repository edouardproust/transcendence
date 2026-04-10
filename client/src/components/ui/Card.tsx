import React from 'react';
import { uiPalette, uiRadius, uiShadow, uiTypography } from './designSystem';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`${uiPalette.surface} ${uiRadius.xl} ${uiShadow.card} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
    <h3 className={`text-lg ${uiTypography.heading} ${uiPalette.textPrimary}`}>{title}</h3>
    {subtitle ? <p className={`${uiTypography.body} ${uiPalette.textSecondary}`}>{subtitle}</p> : null}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);
