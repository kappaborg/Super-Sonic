import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { ApiError, ApiErrorCode } from './api-errors';

// Rate Limiter için basit in-memory veri deposu
// Not: Production'da Redis gibi harici bir önbellek kullanmak daha iyidir
const rateLimits = new Map<string, { count: number, resetTime: number }>();

// ZodSchema ile istek gövdesini doğrulayan middleware
export async function validateRequest<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(ApiErrorCode.BAD_REQUEST, error.message);
    }
    throw new ApiError(ApiErrorCode.BAD_REQUEST);
  }
}

// İstek sayısını sınırlayan middleware
export async function rateLimiter(
  req: NextRequest,
  { limit = 100, windowMs = 60000 } = {}
) {
  // IP bazlı sınırlama
  const ip = req.headers.get('x-real-ip') || req.ip || 'unknown';
  const now = Date.now();
  const windowKey = `${ip}:${Math.floor(now / windowMs)}`;
  
  const currentLimit = rateLimits.get(windowKey) || { count: 0, resetTime: now + windowMs };
  
  // Limit aşıldı mı kontrol et
  if (currentLimit.count >= limit) {
    const secondsToReset = Math.ceil((currentLimit.resetTime - now) / 1000);
    
    return NextResponse.json(
      {
        error: {
          code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
          message: `İstek limiti aşıldı. Lütfen ${secondsToReset} saniye sonra tekrar deneyin.`
        }
      },
      {
        status: 429,
        headers: {
          'Retry-After': secondsToReset.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(currentLimit.resetTime / 1000).toString()
        }
      }
    );
  }
  
  // Limiti güncelle
  rateLimits.set(windowKey, {
    count: currentLimit.count + 1,
    resetTime: currentLimit.resetTime
  });
  
  // Limiti aşmadıysa devam et
  return null;
}

// CORS için header'ları ayarlayan yardımcı fonksiyon
export function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// OPTIONS isteklerini yanıtlayan middleware
export function handleOptionsRequest(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return setCorsHeaders(new NextResponse(null, { status: 204 }));
  }
  return null;
} 