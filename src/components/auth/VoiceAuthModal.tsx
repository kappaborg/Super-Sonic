'use client';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import React, { useEffect, useRef, useState } from 'react';

interface VoiceAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError?: (error: string) => void;
  userId: string;
}

enum AuthStatus {
  IDLE = 'idle',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

const VoiceAuthModal: React.FC<VoiceAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError = () => {},
  userId,
}) => {
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStatus(AuthStatus.IDLE);
      setError(null);
      setRecordingTime(0);
      setProgress(0);
      audioChunksRef.current = [];
    } else {
      stopRecording();
    }
    
    return () => {
      stopRecording();
    };
  }, [isOpen]);
  
  // Timer for recording
  useEffect(() => {
    if (status === AuthStatus.RECORDING) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);
  
  // Progress animation for processing
  useEffect(() => {
    if (status === AuthStatus.PROCESSING) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [status]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(audioBlob);
        }
        
        // Simulating voice authentication processing
        setStatus(AuthStatus.PROCESSING);
        
        try {
          // TODO: Replace with actual voice authentication API call
          await simulateVoiceAuth();
          setStatus(AuthStatus.SUCCESS);
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Ses doğrulama başarısız oldu');
          setStatus(AuthStatus.ERROR);
          onError(error instanceof Error ? error.message : 'Ses doğrulama başarısız oldu');
        }
      };
      
      mediaRecorder.start();
      setStatus(AuthStatus.RECORDING);
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 5000);
      
    } catch (error) {
      console.error('Mikrofon erişimi hatası:', error);
      setError('Mikrofon erişimi reddedildi. Lütfen izin verip tekrar deneyin.');
      setStatus(AuthStatus.ERROR);
      onError('Mikrofon erişimi reddedildi');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      mediaRecorderRef.current.stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  
  // Simulating voice auth processing with a promise
  const simulateVoiceAuth = () => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Simulating 80% success rate
        const isSuccess = Math.random() < 0.8;
        
        if (isSuccess) {
          resolve();
        } else {
          reject(new Error('Ses doğrulama başarısız. Lütfen yeniden deneyin.'));
        }
      }, 2000);
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Ses Doğrulama</h3>
          
          {status === AuthStatus.IDLE && (
            <div className="mb-6">
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Güvenli toplantıya katılmak için sesli kimlik doğrulaması gerekmektedir.
              </p>
              <div className="h-24 w-24 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <Button onClick={startRecording} className="w-full">
                Ses Kaydı Başlat
              </Button>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                "Toplantı için buradayım" cümlesini söyleyin
              </p>
            </div>
          )}
          
          {status === AuthStatus.RECORDING && (
            <div className="mb-6">
              <div className="h-24 w-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-50"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-lg font-semibold mb-2 text-red-600">Kayıt Yapılıyor</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                "Toplantı için buradayım" cümlesini söyleyin
              </p>
              <div className="flex items-center justify-center space-x-4">
                <p className="text-sm font-medium">{recordingTime}s</p>
                <Button onClick={stopRecording} variant="destructive">
                  Durdur
                </Button>
              </div>
            </div>
          )}
          
          {status === AuthStatus.PROCESSING && (
            <div className="mb-6">
              <div className="h-24 w-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Spinner size="lg" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Ses doğrulanıyor, lütfen bekleyin...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {status === AuthStatus.SUCCESS && (
            <div className="mb-6">
              <div className="h-24 w-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold mb-2 text-green-600">Doğrulama Başarılı</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Toplantıya erişim sağlanıyor...
              </p>
            </div>
          )}
          
          {status === AuthStatus.ERROR && (
            <div className="mb-6">
              <div className="h-24 w-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-lg font-semibold mb-2 text-red-600">Doğrulama Başarısız</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || 'Ses doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.'}
              </p>
              <Button onClick={() => setStatus(AuthStatus.IDLE)} className="w-full">
                Tekrar Dene
              </Button>
            </div>
          )}
        </div>
        
        <audio ref={audioRef} className="hidden" controls />
        
        <div className="flex justify-end mt-4">
          {(status === AuthStatus.IDLE || status === AuthStatus.ERROR) && (
            <Button variant="outline" onClick={onClose}>
              Kapat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAuthModal; 