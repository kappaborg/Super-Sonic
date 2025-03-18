import { ApiError, ApiErrorCode } from '@/lib/errors';
import { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * İstek gövdesini doğrulayan middleware
 * 
 * @param req Next.js istek nesnesi
 * @param schema Zod doğrulama şeması
 * @returns Doğrulanmış veri
 * @throws ApiError - Geçersiz istek durumunda
 */
export async function validateRequest<T extends z.Schema>(
  req: NextRequest,
  schema: T
): Promise<{ data: z.infer<T> }> {
  let body;

  try {
    // İstek gövdesini JSON olarak parse et
    body = await req.json();
  } catch (e) {
    // JSON parse hatası
    throw new ApiError(
      ApiErrorCode.INVALID_REQUEST_BODY,
      'Geçersiz istek gövdesi: JSON formatı bekleniyor',
      400
    );
  }

  try {
    // Şema ile doğrula
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    // Zod doğrulama hataları
    if (error instanceof z.ZodError) {
      const details = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));

      throw new ApiError(
        ApiErrorCode.VALIDATION_ERROR,
        'Doğrulama hatası: Geçersiz veri formatı',
        400,
        { details }
      );
    }

    // Beklenmeyen diğer hatalar
    throw new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'Doğrulama sırasında beklenmeyen bir hata oluştu',
      400
    );
  }
}

/**
 * Sorgu parametrelerini doğrulayan yardımcı fonksiyon
 * 
 * @param req Next.js istek nesnesi
 * @param schema Zod doğrulama şeması
 * @returns Doğrulanmış sorgu parametreleri
 * @throws ApiError - Geçersiz sorgu parametreleri durumunda
 */
export function validateQueryParams<T extends z.Schema>(
  req: NextRequest,
  schema: T
): { data: z.infer<T> } {
  try {
    // URL'den sorgu parametrelerini al
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // Şema ile doğrula
    const data = schema.parse(queryParams);
    return { data };
  } catch (error) {
    // Zod doğrulama hataları
    if (error instanceof z.ZodError) {
      const details = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));

      throw new ApiError(
        ApiErrorCode.VALIDATION_ERROR,
        'Geçersiz sorgu parametreleri',
        400,
        { details }
      );
    }

    // Beklenmeyen diğer hatalar
    throw new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'Sorgu parametreleri doğrulanırken bir hata oluştu',
      400
    );
  }
} 