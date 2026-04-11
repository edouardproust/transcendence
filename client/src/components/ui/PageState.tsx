import React from 'react';
import { Button } from './Button';
import { Spinner } from './Spinner';

interface PageLoaderProps {
  message: string;
  showSpinner?: boolean;
  heightClassName?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message,
  showSpinner = false,
  heightClassName = 'h-screen',
}) => {
  return (
    <div className={`flex items-center justify-center ${heightClassName}`}>
      <div className="flex items-center gap-2 text-xl">
        {showSpinner ? <Spinner /> : null}
        <span>{message}</span>
      </div>
    </div>
  );
};

interface PageErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  retryVariant?: 'primary' | 'secondary' | 'danger';
  heightClassName?: string;
}

export const PageErrorState: React.FC<PageErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryLabel = 'Reintentar',
  retryVariant = 'danger',
  heightClassName = 'h-screen',
}) => {
  return (
    <div className={`flex items-center justify-center ${heightClassName}`}>
      <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <div className="text-xl font-semibold text-red-700">{title}</div>
        <p className="mt-2 text-sm text-red-600">{message}</p>
        {onRetry ? (
          <Button className="mt-4" variant={retryVariant} onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

interface PaginationControlsProps {
  summary: string;
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  summary,
  page,
  totalPages,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700">
      <div className="text-sm text-gray-600 dark:text-gray-400">{summary}</div>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page === 1} onClick={onPrevious}>
          Anterior
        </Button>
        <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
          Página {page} de {totalPages}
        </span>
        <Button variant="secondary" disabled={page === totalPages} onClick={onNext}>
          Siguiente
        </Button>
      </div>
    </div>
  );
};
