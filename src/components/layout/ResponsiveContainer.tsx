'use client';

import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  aspectRatio?: string | number;
  className?: string;
}

export function ResponsiveContainer({
  children,
  aspectRatio = '16/9',
  className = '',
}: ResponsiveContainerProps) {
  // Convert number to string if needed
  const aspectRatioStr = typeof aspectRatio === 'number' 
    ? String(aspectRatio) 
    : aspectRatio;
    
  return (
    <div 
      className={`w-full ${className}`}
      style={{
        position: 'relative',
        height: 'auto',
      }}
    >
      {children}
    </div>
  );
} 