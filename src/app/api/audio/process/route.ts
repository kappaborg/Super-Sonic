import { NextRequest, NextResponse } from 'next/server';

// Ses işleme için helper fonksiyonlar
const extractFeatures = (audioData: Float32Array): number[] => {
  // Gerçek uygulamada MFCC (Mel-frequency cepstral coefficients) veya
  // diğer ses özellikleri çıkarılabilir
  // Bu örnek için basitleştirilmiş özellikler kullanıyoruz
  
  // Ses seviyesini hesapla
  let energy = 0;
  for (let i = 0; i < audioData.length; i++) {
    energy += audioData[i] * audioData[i];
  }
  energy = energy / audioData.length;
  
  // Sıfır geçiş oranını hesapla
  let zeroCrossings = 0;
  for (let i = 1; i < audioData.length; i++) {
    if ((audioData[i] >= 0 && audioData[i - 1] < 0) || 
        (audioData[i] < 0 && audioData[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  
  // Spektral merkezoid hesapla (basitleştirilmiş)
  // Gerçek uygulamada FFT kullanılabilir
  let spectralCentroid = 0;
  for (let i = 0; i < audioData.length; i++) {
    spectralCentroid += Math.abs(audioData[i]) * i;
  }
  spectralCentroid = spectralCentroid / energy / audioData.length;
  
  return [energy, zeroCrossings, spectralCentroid];
};

const compareFeatures = (features1: number[], features2: number[]): number => {
  if (features1.length !== features2.length) {
    throw new Error('Karşılaştırılacak özellik vektörleri eşit uzunlukta olmalıdır');
  }
  
  // Öklid mesafesi hesapla
  let distance = 0;
  for (let i = 0; i < features1.length; i++) {
    distance += Math.pow(features1[i] - features2[i], 2);
  }
  
  // Mesafeyi benzerlik puanına dönüştür (0-1 aralığında)
  // Düşük mesafe = yüksek benzerlik
  const similarity = 1 / (1 + Math.sqrt(distance));
  
  return similarity;
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.audioData || !Array.isArray(data.audioData)) {
      return NextResponse.json(
        { error: 'Geçerli ses verisi sağlanmadı' },
        { status: 400 }
      );
    }
    
    // Float32Array'e dönüştür
    const audioData = new Float32Array(data.audioData);
    
    // Özellik çıkarma işlemi
    const features = extractFeatures(audioData);
    
    // Ses analizi yap
    let analysis = {
      energy: features[0],
      clarity: features[1] > 1000 ? 'Yüksek' : 'Düşük', // Basitleştirilmiş açıklık değerlendirmesi
      quality: features[0] > 0.01 ? 'İyi' : 'Kötü',     // Basitleştirilmiş kalite değerlendirmesi
    };
    
    // İsteğe bağlı olarak bir referans ses örneği ile karşılaştırma
    let similarity = null;
    if (data.referenceData && Array.isArray(data.referenceData)) {
      const referenceData = new Float32Array(data.referenceData);
      const referenceFeatures = extractFeatures(referenceData);
      similarity = compareFeatures(features, referenceFeatures);
    }
    
    return NextResponse.json({
      success: true,
      features,
      analysis,
      similarity,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Ses işleme hatası:', error);
    return NextResponse.json(
      { error: 'Ses işleme sırasında bir hata oluştu', details: (error as Error).message },
      { status: 500 }
    );
  }
} 