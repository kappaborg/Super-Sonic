import { ApiErrorCode, isApiError } from '@/lib/errors';
import { NextRequest, NextResponse } from 'next/server';
import { addCorsHeaders } from './cors';

// Error handler tipi
type ApiHandler = (req: NextRequest, ...args: any[]) => Promise<NextResponse>;

/**
 * API fonksiyonlarını error handling ile sarmalayan higher-order fonksiyon
 * Tüm yakalanan hataları uygun HTTP yanıtlarına dönüştürür
 */
export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      // Orijinal handler'ı çalıştır
      const response = await handler(req, ...args);
      
      // CORS header'larını ekle
      return addCorsHeaders(req, response);
    } catch (error) {
      console.error('API Error:', error);
      
      let statusCode = 500;
      let errorMessage = 'Internal server error';
      let errorCode = ApiErrorCode.INTERNAL_SERVER_ERROR;
      let details = undefined;

      // API Error'ları özel olarak işle
      if (isApiError(error)) {
        statusCode = error.statusCode;
        errorMessage = error.message;
        errorCode = error.code;
        details = error.details;
      } else if (error instanceof Error) {
        // Standart hataları kullan ama detayları gizle
        errorMessage = error.message || 'Beklenmeyen bir hata oluştu';
      }

      // Geliştirme ortamında daha detaylı hatalar göster
      const isDev = process.env.NODE_ENV === 'development';
      
      // Hata yanıtını oluştur
      const errorResponse = NextResponse.json(
        {
          success: false,
          error: {
            code: errorCode,
            message: errorMessage,
            ...(isDev && { stack: error instanceof Error ? error.stack : undefined }),
            ...(details && { details }),
          },
        },
        { status: statusCode }
      );

      // CORS header'larını ekle
      return addCorsHeaders(req, errorResponse);
    }
  };
}

/**
 * Kullanıcı dostu hata mesajları oluşturan yardımcı fonksiyon
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('connect')) {
      return 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
    }
    
    if (error.message.includes('timeout')) {
      return 'Sunucu yanıt vermiyor. Lütfen daha sonra tekrar deneyin.';
    }
    
    // Genel hata mesajı
    return 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
  }
  
  return 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
}

/**
 * API yanıtı formatını standardize eden fonksiyon
 * 
 * @param data Yanıt verisi
 * @param success Başarı durumu
 * @param message Mesaj (isteğe bağlı)
 * @returns Formatlanmış API yanıtı
 */
export function formatApiResponse<T = any>(
  data: T, 
  success: boolean = true, 
  message?: string
) {
  return {
    success,
    ...(message ? { message } : {}),
    data
  };
} 