import React, { createContext, useContext, useMemo, useState } from 'react';
import { Icon } from './Icon';

type ToastTone = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let externalEmitter: ((message: string, tone: ToastTone) => void) | null = null;

export const pushToast = (message: string, tone: ToastTone = 'info') => {
  externalEmitter?.(message, tone);
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const add = (message: string, tone: ToastTone) => {
    const id = `${Date.now()}-${Math.random()}`;
    setMessages((prev) => [...prev, { id, message, tone }].slice(-5));
    window.setTimeout(() => {
      setMessages((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  };

  externalEmitter = add;

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => add(message, 'success'),
      error: (message) => add(message, 'error'),
      info: (message) => add(message, 'info'),
    }),
    []
  );

  const styles: Record<ToastTone, string> = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-gray-800 text-white',
  };

  const icons: Record<ToastTone, 'check' | 'x' | 'bell'> = {
    success: 'check',
    error: 'x',
    info: 'bell',
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {messages.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[260px] max-w-[360px] px-4 py-3 rounded-lg shadow-lg flex items-start gap-2 ${styles[toast.tone]}`}
          >
            <Icon name={icons[toast.tone]} className="w-4 h-4 mt-0.5" />
            <p className="text-sm">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
};
