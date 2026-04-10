import React from 'react';
import { uiPalette, uiRadius, uiTypography } from './designSystem';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  minLength,
  ...rest
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-1 ${uiTypography.label} ${uiPalette.textSecondary}`}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        {...rest}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 ${uiRadius.md} ${uiPalette.focusRing} bg-white dark:bg-gray-800 ${uiPalette.textPrimary}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
