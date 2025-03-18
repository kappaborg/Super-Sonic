'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
  animate?: boolean;
}

/**
 * Skeleton component that serves as a placeholder during loading states
 * Maintains content dimensions to improve CLS (Cumulative Layout Shift) metrics
 */
export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'rounded',
  animate = true,
}: SkeletonProps) {
  const styles: React.CSSProperties = {
    width: width || '100%',
    height: height || '1rem',
  };

  const animateClass = animate ? 'animate-pulse' : '';
  const baseClass = `bg-gray-200 dark:bg-gray-700 ${rounded} ${animateClass}`;
  const fullClass = className ? `${baseClass} ${className}` : baseClass;

  return <div className={fullClass} style={styles}></div>;
} 