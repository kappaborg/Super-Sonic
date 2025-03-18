import { ApiError, ApiErrorCode } from '@/lib/errors';
import { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * API isteklerini belirtilen şemaya göre doğrulayan fonksiyon
 * 
 * @param request Next.js istek nesnesi
 * @param schema Zod doğrulama şeması
 * @param source İsteğin kaynağı - 'body' (varsayılan), 'query', 'params' veya 'headers'
 * @returns Doğrulanmış veri
 * @throws ApiError - Doğrulama başarısız olursa
 */
export async function validateRequest<T extends z.ZodType>(
  request: NextRequest,
  schema: T,
  source: 'body' | 'query' | 'params' | 'headers' = 'body'
): Promise<z.infer<T>> {
  try {
    let dataToValidate: any;
    
    // İstek kaynağına göre veriyi al
    switch (source) {
      case 'body':
        // HTTP metodu GET, HEAD veya OPTIONS ise hata fırlat
        if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
          throw new Error(`${request.method} isteklerinde body olamaz`);
        }
        
        // İçerik türünü kontrol et
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          // JSON içerik için
          dataToValidate = await request.json();
        } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
          // Form verisi için
          const formData = await request.formData();
          dataToValidate = {};
          
          for (const [key, value] of formData.entries()) {
            // File tipi kontrolü
            if (value instanceof File) {
              dataToValidate[key] = value;
            } else {
              // String değerleri gerekirse parse et (JSON string, boolean, number, vb.)
              try {
                dataToValidate[key] = tryParseValue(value as string);
              } catch (e) {
                dataToValidate[key] = value;
              }
            }
          }
        } else {
          // Diğer içerik türleri için hata fırlat
          throw new Error(`Desteklenmeyen içerik türü: ${contentType}`);
        }
        break;
        
      case 'query':
        // URL parametrelerini al
        dataToValidate = Object.fromEntries(new URL(request.url).searchParams.entries());
        break;
        
      case 'params':
        // Route parametrelerini kullanmak istiyorsak, bunları dışarıdan almamız gerekiyor
        // Next.js'de doğrudan route parametrelerine erişim için
        // bu fonksiyon route handler içinde değil, middleware olarak kullanılmalıdır
        throw new Error('Route parametrelerinin doğrulanması henüz desteklenmiyor');
        
      case 'headers':
        // HTTP başlıklarını al
        dataToValidate = Object.fromEntries(request.headers.entries());
        break;
        
      default:
        throw new Error(`Geçersiz kaynak türü: ${source}`);
    }
    
    // Zod şeması ile veriyi doğrula
    const validatedData = schema.parse(dataToValidate);
    return validatedData;
  } catch (error) {
    // Zod doğrulama hatalarını ApiError formatına dönüştür
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      throw new ApiError(
        ApiErrorCode.VALIDATION_ERROR,
        'İstek doğrulama hatası',
        400,
        { details }
      );
    }
    
    // Diğer hataları ApiError olarak fırlat
    if (error instanceof Error) {
      throw new ApiError(
        ApiErrorCode.BAD_REQUEST,
        error.message || 'İstek doğrulanamadı',
        400
      );
    }
    
    // Bilinmeyen hatalar
    throw new ApiError(
      ApiErrorCode.INTERNAL_SERVER_ERROR,
      'İstek doğrulanırken bir hata oluştu',
      500
    );
  }
}

/**
 * String değeri uygun JavaScript tipine dönüştürmeye çalışan yardımcı fonksiyon
 * JSON, boolean, number veya string olarak parse eder
 * 
 * @param value Parse edilecek string değer
 * @returns Parse edilmiş değer
 */
function tryParseValue(value: string): any {
  // Boş string kontrolü
  if (!value || value.trim() === '') return '';
  
  // Boolean kontrolü
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  // Number kontrolü
  if (!isNaN(Number(value)) && !isNaN(parseFloat(value))) return Number(value);
  
  // JSON kontrolü
  try {
    if ((value.startsWith('{') && value.endsWith('}')) || 
        (value.startsWith('[') && value.endsWith(']'))) {
      const parsed = JSON.parse(value);
      return parsed;
    }
  } catch (e) {
    // JSON parse hatası, string olarak devam et
  }
  
  // Hiçbiri değilse string olarak kal
  return value;
}