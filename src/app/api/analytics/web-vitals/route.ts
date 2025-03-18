import { NextRequest, NextResponse } from 'next/server';

// Web Vitals değerlendirme eşikleri
const LCP_THRESHOLD = { good: 2500, poor: 4000 }; // milisaniye
const FID_THRESHOLD = { good: 100, poor: 300 };   // milisaniye
const CLS_THRESHOLD = { good: 0.1, poor: 0.25 };  // sıçrama değeri

// Web Vitals değerlendirme fonksiyonu
const getAssessment = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  switch (name) {
    case 'LCP':
      return value <= LCP_THRESHOLD.good ? 'good' : value <= LCP_THRESHOLD.poor ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= FID_THRESHOLD.good ? 'good' : value <= FID_THRESHOLD.poor ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= CLS_THRESHOLD.good ? 'good' : value <= CLS_THRESHOLD.poor ? 'needs-improvement' : 'poor';
    default:
      return 'needs-improvement';
  }
};

// Web Vitals analitik verilerini işleyen API endpoint'i
export async function POST(request: NextRequest) {
  try {
    // İstek gövdesini oku
    const body = await request.json();
    
    // Gerekli alanların varlığını kontrol et
    if (!body.name || typeof body.value !== 'number') {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }
    
    const metric = {
      name: body.name,
      value: body.value,
      rating: body.rating || getAssessment(body.name, body.value),
      delta: body.delta,
      id: body.id,
      navigationType: body.navigationType || 'navigate',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      device: getDeviceType(request.headers.get('user-agent') || ''),
      path: request.headers.get('referer') || '/',
    };
    
    // Gerçek bir uygulama için verileri veritabanına kaydet veya analitik servise gönder
    console.log('Web Vitals metriği alındı:', metric);
    
    // Bu örnek için sadece günlüğe kaydediyoruz, gerçek uygulamada:
    // 1. veritabanına kaydet (örn. MongoDB, PostgreSQL)
    // 2. veya Prometheus gibi metrik toplama servisine gönder
    // 3. veya Google Analytics, New Relic gibi analitik servislerine gönder
    
    // 3. taraf analitik servisleri için metriği dönüştürme örneği:
    // const analyticsData = transformMetricForAnalytics(metric);
    // await sendToAnalyticsService(analyticsData);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Web Vitals analitik işleme hatası:', error);
    return NextResponse.json(
      { error: 'İstek işlenemedi', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Kullanıcı aygıt türünü belirleme (basit bir örnek)
function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  
  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
} 