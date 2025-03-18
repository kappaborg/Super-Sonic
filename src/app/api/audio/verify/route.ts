import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// Threshold values for voice verification
const VERIFICATION_THRESHOLD = parseFloat(process.env.AUDIO_VERIFICATION_THRESHOLD || '0.75');
const TOKEN_SECRET = process.env.JWT_SECRET || 'development_secret_key';

// Voice feature extraction function (simplified)
const extractVoiceFeatures = (audioData: Float32Array): number[] => {
  // Feature extraction process
  // In real implementation, MFCC, prosody, formant, etc. features are used
  
  const windowSize = 256;
  const features: number[] = [];
  
  // Energy level
  let energy = 0;
  for (let i = 0; i < audioData.length; i++) {
    energy += audioData[i] * audioData[i];
  }
  features.push(energy / audioData.length);
  
  // Window-based features
  for (let i = 0; i < audioData.length; i += windowSize) {
    if (i + windowSize > audioData.length) break;
    
    const window = audioData.slice(i, i + windowSize);
    
    // Average amplitude
    let sum = 0;
    for (let j = 0; j < window.length; j++) {
      sum += Math.abs(window[j]);
    }
    features.push(sum / window.length);
    
    // Zero-crossing rate
    let zeroCrossings = 0;
    for (let j = 1; j < window.length; j++) {
      if ((window[j] >= 0 && window[j - 1] < 0) || 
          (window[j] < 0 && window[j - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    features.push(zeroCrossings);
  }
  
  return features;
};

// Calculate similarity between two feature vectors
const calculateSimilarity = (features1: number[], features2: number[]): number => {
  const minLength = Math.min(features1.length, features2.length);
  
  // Calculate similarity using Euclidean distance
  let distance = 0;
  for (let i = 0; i < minLength; i++) {
    distance += Math.pow(features1[i] - features2[i], 2);
  }
  
  // Convert distance to similarity score (0-1 range)
  const similarity = 1 / (1 + Math.sqrt(distance / minLength));
  
  return similarity;
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.audioData || !Array.isArray(data.audioData)) {
      return NextResponse.json(
        { error: 'Valid audio data not provided' },
        { status: 400 }
      );
    }
    
    if (!data.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // 1. Extract features from provided audio data
    const audioData = new Float32Array(data.audioData);
    const extractedFeatures = extractVoiceFeatures(audioData);
    
    // 2. Simulated voice database record
    // In a real application, this data would be retrieved from a database
    const storedUser = {
      id: data.userId,
      voiceprintFeatures: data.referenceData 
        ? new Float32Array(data.referenceData) 
        : generateDummyVoiceprintForUser(data.userId)
    };
    
    // 3. Calculate similarity
    const storedFeatures = Array.from(storedUser.voiceprintFeatures);
    const similarity = calculateSimilarity(extractedFeatures, storedFeatures);
    
    // 4. Make verification decision based on threshold
    const verified = similarity >= VERIFICATION_THRESHOLD;
    
    if (verified) {
      // 5. If verification is successful, generate a short-term JWT token
      const token = jwt.sign(
        {
          userId: data.userId,
          voiceAuthenticated: true,
          exp: Math.floor(Date.now() / 1000) + (15 * 60) // Valid for 15 minutes
        },
        TOKEN_SECRET
      );
      
      return NextResponse.json({
        success: true,
        verified: true,
        similarity,
        token,
        message: 'Voice verification successful'
      });
    } else {
      return NextResponse.json({
        success: true,
        verified: false,
        similarity,
        message: 'Voice verification failed'
      });
    }
    
  } catch (error) {
    console.error('Voice verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during voice verification', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Temporarily generate random voice features for testing
function generateDummyVoiceprintForUser(userId: string): Float32Array {
  // This function is not used in a real application, only for testing
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const features = [];
  
  for (let i = 0; i < 50; i++) {
    // Fake random values based on seed value
    features.push((Math.sin(seed * i) + 1) / 2);
  }
  
  return new Float32Array(features);
} 