import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// API hata kodları
export enum ApiErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

// API hata mesajları
export const ApiErrorMessages = {
  [ApiErrorCode.BAD_REQUEST]: 'Geçersiz istek',
  [ApiErrorCode.NOT_FOUND]: 'Kaynak bulunamadı',
  [ApiErrorCode.UNAUTHORIZED]: 'Kimlik doğrulama gerekli',
  [ApiErrorCode.FORBIDDEN]: 'Bu işlem için yetkiniz yok',
  [ApiErrorCode.INTERNAL_SERVER_ERROR]: 'Sunucu hatası',
  [ApiErrorCode.VALIDATION_ERROR]: 'Doğrulama hatası',
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 'İstek limiti aşıldı',
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 'Servis şu anda kullanılamıyor'
};

// HTTP durum kodları
export const HttpStatusCodes = {
  [ApiErrorCode.BAD_REQUEST]: 400,
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ApiErrorCode.VALIDATION_ERROR]: 422,
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 503
};

// API hata sınıfı
export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  details?: any;

  constructor(code: ApiErrorCode, message?: string, details?: any) {
    super(message || ApiErrorMessages[code]);
    this.code = code;
    this.status = HttpStatusCodes[code];
    this.details = details;
    this.name = 'ApiError';
  }

  // Hata nesnesini JSON response'a dönüştürür
  toResponse() {
    return NextResponse.json(
      {
        error: {
          code: this.code,
          message: this.message,
          details: this.details
        }
      },
      { status: this.status }
    );
  }

  // ZodError'ı API hatasına dönüştürür
  static fromZodError(error: ZodError) {
    const details = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }));

    return new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'Geçersiz veri formatı',
      details
    );
  }
}

// API route handler için hata yakalayıcı higher-order fonksiyon
export function withErrorHandling(handler: Function) {
  return async function(...args: any[]) {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API hatası:', error);
      
      if (error instanceof ApiError) {
        return error.toResponse();
      }
      
      if (error instanceof ZodError) {
        return ApiError.fromZodError(error).toResponse();
      }
      
      // Diğer hatalar için genel sunucu hatası döndür
      return new ApiError(ApiErrorCode.INTERNAL_SERVER_ERROR).toResponse();
    }
  };
} 