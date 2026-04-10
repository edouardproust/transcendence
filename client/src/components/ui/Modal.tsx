import React from 'react';
import { uiPalette, uiRadius, uiShadow, uiTypography } from './designSystem';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${uiPalette.surface} ${uiRadius.md} ${uiShadow.modal} max-w-md w-full mx-4 p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl ${uiTypography.heading} ${uiPalette.textPrimary}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>
        <div className={uiPalette.textSecondary}>
          {children}
        </div>
      </div>
    </div>
  );
};
