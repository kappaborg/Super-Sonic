// Next.js framework için tip tanımlamaları
import { Server as NetServer, Socket } from 'net';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export type NextApiRequestWithFile = NextApiRequest & {
  file: Express.Multer.File;
  files: {
    [fieldname: string]: Express.Multer.File[];
  };
};

// WebVitals için tamamlayıcı tip tanımlamaları
export type WebVitalMetric = {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  navigationType: string;
  startTime?: number;
};

export type WebVitalsReportCallback = (metric: WebVitalMetric) => void;

// Service Worker için tip tanımlamaları
export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  scope?: string;
}

// Socket.IO için genişletilmiş tipler
export type NextApiResponseWithSocket = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

// Özelleştirilmiş görsel bileşeni için tipler
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoadingComplete?: () => void;
}

// Responsive Container için tipler
export interface ResponsiveContainerProps {
  children: React.ReactNode;
  aspectRatio?: number;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  width?: string;
}

// Bundle Analyzer için tipleri
export interface BundleStats {
  assets: Array<{
    name: string;
    size: number;
    chunks: number[];
    chunkNames: string[];
    emitted: boolean;
  }>;
  chunks: Array<{
    id: number;
    names: string[];
    size: number;
    modules: number[];
  }>;
  errors: string[];
  modules: Array<{
    id: number;
    name: string;
    size: number;
    source: string;
  }>;
  warnings: string[];
}

// Önbellekleme stratejisi tipleri
export type CacheStrategy = 'network-first' | 'cache-first' | 'network-only' | 'cache-only' | 'stale-while-revalidate';

// Progressive Web App manifest için tipler
export interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
} 