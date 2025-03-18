'use client';

import * as React from 'react';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

interface ToastActionElement {
  altText: string;
  element: React.ReactNode;
}

type ToastActionProps = {
  altText: string;
  onClick: () => void;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ altText, onClick, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className="inline-flex h-8 items-center justify-center rounded-md bg-white px-3 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        {...props}
      >
        {children}
      </button>
    );
  }
);
ToastAction.displayName = 'ToastAction';

type ToastContextType = {
  toasts: ToastProps[];
  addToast: (toast: ToastProps) => void;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<ToastProps>) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    toast: (props: ToastProps) => {
      context.addToast({
        id: crypto.randomUUID(),
        variant: 'default',
        duration: 5000,
        ...props,
      });
    },
    dismiss: (id: string) => context.removeToast(id),
    update: (id: string, props: Partial<ToastProps>) => context.updateToast(id, props),
    toasts: context.toasts,
  };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: ToastProps) => {
    setToasts((prev) => [...prev, { ...toast, id: toast.id || crypto.randomUUID() }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const updateToast = React.useCallback((id: string, toast: Partial<ToastProps>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export { ToastContext };
