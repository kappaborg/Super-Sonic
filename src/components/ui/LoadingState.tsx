import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

interface LoadingStateProps {
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingState({ 
  text = 'Loading...', 
  fullScreen = false,
  className 
}: LoadingStateProps) {
  const containerClasses = cn(
    'flex flex-col items-center justify-center',
    fullScreen && 'min-h-screen',
    className
  );

  return (
    <div className={containerClasses}>
      <Spinner size="lg" className="text-primary" />
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  );
} 