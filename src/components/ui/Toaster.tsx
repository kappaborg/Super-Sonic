'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from './use-toast';

export function Toaster() {
    const { toasts, dismiss } = useToast();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed top-0 z-[100] flex flex-col max-h-screen w-full sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col-reverse p-4 sm:p-6 pointer-events-none sm:w-full sm:max-w-[420px]">
            {toasts.map(function ({ id, title, description, variant, duration, onClose }) {
                return (
                    <div
                        key={id}
                        data-state="open"
                        data-swipe-direction="right"
                        className="group pointer-events-auto relative z-50 flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full mt-4 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                        style={{ '--radix-toast-swipe-end-x': '100%', '--radix-toast-swipe-move-x': '0px' } as any}
                    >
                        <div className="grid gap-1">
                            {title && <div className="text-sm font-semibold">{title}</div>}
                            {description && (
                                <div className="text-sm opacity-90">
                                    {description}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                            onClick={() => {
                                if (id) dismiss(id);
                                if (onClose) onClose();
                            }}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
} 