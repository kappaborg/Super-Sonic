'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RateLimitWarningProps {
  retryAfter?: number; // Saniye cinsinden bekleme süresi
  message?: string; // Özel mesaj
  onRetry?: () => void; // Yeniden deneme fonksiyonu
  className?: string; // Ek stil sınıfları
}

/**
 * Rate limit uyarısı görüntüleyen bileşen.
 * API istekleri rate limit sınırına ulaştığında kullanılabilir.
 */
export function RateLimitWarning({
  retryAfter = 60,
  message = 'İstek limitine ulaştınız. Lütfen bir süre bekleyin.',
  onRetry,
  className,
}: RateLimitWarningProps) {
  const [countdown, setCountdown] = useState<number>(retryAfter);
  const [isWaiting, setIsWaiting] = useState<boolean>(true);

  // Geri sayım sayacı
  useEffect(() => {
    if (!isWaiting) return;
    
    // İlk değeri ayarla
    setCountdown(retryAfter);
    
    // Her saniye geri sayımı güncelle
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsWaiting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [retryAfter, isWaiting]);

  // Yeniden deneme işlemi
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    // Eğer geri çağırma fonksiyonu verilmemişse sayacı yeniden başlat
    else {
      setIsWaiting(true);
    }
  };

  // Kalan süreyi formatlama
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} saniye`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (remainingSeconds === 0) {
      return `${minutes} dakika`;
    }
    
    return `${minutes} dakika ${remainingSeconds} saniye`;
  };

  return (
    <Alert 
      variant="warning" 
      className={className}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>İstek Limiti Aşıldı</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">{message}</p>
        
        {isWaiting ? (
          <div className="flex items-center mt-2 text-sm">
            <Spinner className="h-4 w-4 mr-2" /> 
            <span>
              Kalan süre: {formatTime(countdown)}
            </span>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry} 
            className="mt-2"
          >
            Şimdi Tekrar Dene
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
} 