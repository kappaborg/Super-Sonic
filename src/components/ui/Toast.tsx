import { cn } from '@/lib/utils';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const styles = {
  success: 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100',
  error: 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100',
  info: 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
};

export function Toast({ type, message, show, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(show);
  const Icon = icons[type];

  useEffect(() => {
    setIsVisible(show);
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <Transition
      show={isVisible}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed bottom-0 right-0 z-50 m-8">
        <div className={cn(
          'rounded-lg p-4 shadow-lg',
          'flex items-start space-x-4',
          styles[type]
        )}>
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
} 