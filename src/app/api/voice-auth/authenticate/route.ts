import { ApiError, ApiErrorCode, withErrorHandling } from '@/lib/api-errors';
import { handleOptionsRequest, rateLimiter, validateRequest } from '@/lib/api-middleware';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Ses doğrulama istek şeması
const voiceAuthRequestSchema = z.object({
  voiceFeatures: z.array(z.number()),
  userId: z.string().uuid().optional(),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  // CORS OPTIONS isteğini kontrol et
  const corsResponse = handleOptionsRequest(req);
  if (corsResponse) return corsResponse;

  // Rate limiting uygula - güvenlik için daha sıkı limit
  const rateLimitResponse = await rateLimiter(req, { limit: 10, windowMs: 60000 });
  if (rateLimitResponse) return rateLimitResponse;

  // İstek gövdesini doğrula
  const { voiceFeatures, userId } = await validateRequest(req, voiceAuthRequestSchema);

  // Supabase oturumundan kullanıcıyı al
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  // Kullanıcı kimliğini doğrula
  if (!currentUserId && !userId) {
    throw new ApiError(ApiErrorCode.UNAUTHORIZED, 'Bu işlem için kimlik doğrulama gerekli');
  }

  // Kullanıcı voiceprint verilerini al
  const { data: voiceprints, error } = await supabase
    .from('voiceprints')
    .select('voice_features')
    .eq('user_id', userId || currentUserId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !voiceprints.length) {
    throw new ApiError(
      ApiErrorCode.NOT_FOUND, 
      'Ses parmak izi bulunamadı. Lütfen önce ses kaydınızı yapın.'
    );
  }

  // Ses özelliklerini karşılaştırma (basit bir örnek)
  const storedFeatures = voiceprints[0].voice_features;
  
  // Gerçek uygulamalarda, bu karşılaştırma için daha gelişmiş algoritmalar kullanılır
  // Şimdilik basit bir benzerlik skoru hesaplayalım
  const similarityScore = calculateSimilarity(voiceFeatures, storedFeatures);
  const threshold = 0.75; // %75 benzerlik eşiği
  const authenticated = similarityScore >= threshold;

  // Başarılı yanıt
  return NextResponse.json({
    authenticated,
    confidence: similarityScore,
    message: authenticated 
      ? 'Ses kimliği doğrulandı'
      : 'Ses kimliği doğrulanamadı'
  });
});

// İki ses özelliği arasındaki benzerliği hesaplar (basit kosinüs benzerlik)
function calculateSimilarity(features1: number[], features2: number[]): number {
  if (features1.length !== features2.length) {
    // Özellik vektörleri aynı boyutta olmalı
    return 0;
  }

  // Kosinüs benzerliği hesapla
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < features1.length; i++) {
    dotProduct += features1[i] * features2[i];
    magnitude1 += features1[i] * features1[i];
    magnitude2 += features2[i] * features2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
} 