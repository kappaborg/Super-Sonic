import { type ClassValue, clsx } from 'clsx';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS support using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Helper function to get filename from URL
 */
export function getFilenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1);
  } catch (error) {
    return url.substring(url.lastIndexOf('/') + 1);
  }
}

/**
 * Convert file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Display date in relative format (e.g., "3 days ago")
 */
export function formatRelativeTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

/**
 * Display date in custom format
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncate text and add ellipsis
 */
export function truncate(str: string, length: number): string {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerm(text: string, searchTerm: string): React.ReactNode[] {
  if (!searchTerm.trim() || !text) {
    return [React.createElement('span', { key: "0" }, text)];
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => 
    regex.test(part) 
      ? React.createElement('mark', { key: i, className: "bg-yellow-200 dark:bg-yellow-800" }, part) 
      : React.createElement('span', { key: i }, part)
  );
}

/**
 * Debounce function - limits frequently repeated operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function - ensures function runs only once in a specified interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Returns a Promise that waits for the specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check browser capabilities
 */
export const browserCapabilities = {
  supportsWebRTC: () => {
    return !!window.RTCPeerConnection;
  },
  supportsMediaRecorder: () => {
    return !!window.MediaRecorder;
  },
  supportsServiceWorker: () => {
    return 'serviceWorker' in navigator;
  },
  supportsWebAudio: () => {
    return !!window.AudioContext || !!(window as any).webkitAudioContext;
  },
  supportsNotifications: () => {
    return 'Notification' in window;
  },
  supportsTouchEvents: () => {
    return 'ontouchstart' in window;
  }
};

/**
 * Function that provides delay for render-blocking code
 * To improve Web Vitals metrics
 */
export function deferCode(callback: () => void, timeout = 0): void {
  // Check if requestIdleCallback is supported by the browser
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => setTimeout(callback, timeout));
  } else {
    // Fallback: use setTimeout
    setTimeout(callback, timeout);
  }
}

/**
 * Simple API for performance measurement
 */
export const performance = {
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
    }
  },
  measure: (name: string, startMark: string, endMark: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.measure(name, startMark, endMark);
      } catch (e) {
        console.error('Performance measurement error:', e);
      }
    }
  },
  getEntriesByName: (name: string, type?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      return window.performance.getEntriesByName(name, type);
    }
    return [];
  }
};

/**
 * Add delay for testing or animations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a unique ID
 */
export function uniqueId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safe JSON parse with a fallback value
 */
export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return fallback;
  }
} 