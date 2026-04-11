import React from 'react';
import { Button } from '@/components/ui/Button';

interface GameHeaderProps {
  title: string;
  subtitle?: string;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
  }>;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  title, 
  subtitle, 
  actions 
}) => {
  return (
    <div className="mb-4 flex flex-wrap justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'primary'}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};