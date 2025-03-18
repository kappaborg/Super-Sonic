'use client';

import { Toast, ToastType } from '@/components/ui/Toast';
import { createContext, useCallback, useContext, useState } from 'react';

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastState {
  type: ToastType;
  message: string;
  show: boolean;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    type: 'info',
    message: '',
    show: false,
  });

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message, show: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 