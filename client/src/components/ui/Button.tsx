import React from 'react';
import { uiPalette, uiRadius } from './designSystem';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const baseStyles = `px-4 py-2 ${uiRadius.md} font-medium transition disabled:opacity-50 disabled:cursor-not-allowed`;
  
  const variants = {
    primary: uiPalette.primaryAction,
    secondary: uiPalette.secondaryAction,
    danger: uiPalette.dangerAction,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
