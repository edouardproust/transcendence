import React from 'react';
import { Button } from '@/components/ui/Button';

type PromotionChoice = 'q' | 'r' | 'b' | 'n';

interface PromotionModalProps {
  isOpen: boolean;
  onSelect: (promotion: PromotionChoice) => void;
  onCancel: () => void;
}

const promotionOptions: Array<{ value: PromotionChoice; label: string }> = [
  { value: 'q', label: 'Reina' },
  { value: 'r', label: 'Torre' },
  { value: 'b', label: 'Alfil' },
  { value: 'n', label: 'Caballo' },
];

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onSelect,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
          Elige pieza de promocion
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {promotionOptions.map((option) => (
            <Button
              key={option.value}
              variant="secondary"
              onClick={() => onSelect(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <Button className="mt-3 w-full" variant="danger" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};
