'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onError?: () => void;
  onLoad?: () => void;
  style?: React.CSSProperties;
}

/**
 * Optimize edilmiş resim bileşeni.
 * Next.js Image bileşenini kullanarak otomatik resim optimizasyonu, lazy loading,
 * responsive görüntüler ve WebP/AVIF formatlarını destekler.
 * 
 * LCP (Largest Contentful Paint) metriğini iyileştirmek için:
 * - Hero veya kritik resimler için priority={true} kullanın
 * - Önceden oluşturulmuş blurDataURL veya placeholder='blur' kullanın
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 85,
  priority = false,
  className = '',
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  placeholder,
  blurDataURL,
  onError,
  onLoad,
  style,
  ...props
}: OptimizedImageProps) {
  // Placeholder için blur URL
  const defaultBlurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjUgNDNjOS45NDEgMCAxOC04LjA1OSAxOC0xOFMzNC45NDEgNyAyNSA3IDcgMTUuMDU5IDcgMjVzOC4wNTkgMTggMTggMTh6IiBmaWxsPSIjRUNFQ0VDIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=';

  // Hata durumunda gösterilecek fallback görseli
  const [imgSrc, setImgSrc] = React.useState(src);
  const [imgError, setImgError] = React.useState(false);

  // Resim yüklenemediğinde hata işleme
  const handleError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc('/images/placeholder.png'); // Placeholder resim
      onError?.();
    }
  };

  // Resim yüklendiğinde çağrılacak fonksiyon
  const handleLoad = () => {
    onLoad?.();
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : (width || 100)}
        height={fill ? undefined : (height || 100)}
        quality={quality}
        priority={priority}
        sizes={sizes}
        loading={priority ? 'eager' : loading}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          objectFit: 'cover',
          ...style
        }}
        fill={fill}
        {...props}
      />
      
      {/* Resim yükleniyor göstergesi */}
      {!imgError && placeholder !== 'blur' && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
} 