import { cn } from '@/lib/utils';
import React from 'react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary';
}

/**
 * Yükleme durumlarını göstermek için kullanılan Spinner bileşeni
 */
export function Spinner({
  size = 'md',
  variant = 'default',
  className,
  ...props
}: SpinnerProps) {
  // Size sınıfları
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
  };

  // Renk varyantları
  const variantClasses = {
    default: 'border-gray-300 border-t-gray-800 dark:border-gray-700 dark:border-t-gray-200',
    primary: 'border-blue-200 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-400',
    secondary: 'border-purple-200 border-t-purple-600 dark:border-purple-900 dark:border-t-purple-400',
  };

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
      role="status"
      aria-label="Yükleniyor"
    >
      <span className="sr-only">Yükleniyor...</span>
    </div>
  );
} 