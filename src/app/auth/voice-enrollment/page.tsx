'use client';

import apiService from '@/services/api';
import { extractVoiceprint, isRecordingActive, startRecording, stopRecording } from '@/utils/audioUtils';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function VoiceEnrollmentPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [enrollmentText, setEnrollmentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [voiceprintData, setVoiceprintData] = useState<Float32Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Example enrollment phrases
  const enrollmentTexts = [
    "I am recording my voice for secure meetings",
    "My voice is my identity",
    "With SecureSonic our meetings are secure",
    "This voice belongs only to me and is unique"
  ];

  useEffect(() => {
    // Select a random enrollment phrase
    const randomIndex = Math.floor(Math.random() * enrollmentTexts.length);
    setEnrollmentText(enrollmentTexts[randomIndex]);

    // Clean up timers when component is unmounted
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  // Start voice recording
  const handleStartRecording = async () => {
    setError(null);
    setRecordingComplete(false);
    setProgress(0);
    setIsRecording(true);
    
    try {
      await startRecording();
      
      // Timer to count recording duration
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Timer for progress bar
      progressTimerRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            handleStopRecording();
            return 100;
          }
          return newProgress;
        });
      }, 100);
      
    } catch (err: any) {
      setIsRecording(false);
      setError(err.message || 'Error accessing microphone.');
    }
  };

  // Stop voice recording
  const handleStopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    if (isRecordingActive()) {
      try {
        // Stop recording
        stopRecording();
        
        // Extract voiceprint
        const voiceprint = await extractVoiceprint();
        setVoiceprintData(voiceprint);
        
        setIsRecording(false);
        setRecordingComplete(true);
        console.log('Voiceprint successfully created:', voiceprint.length);
      } catch (err: any) {
        setError(err.message || 'Error processing voice recording.');
        setIsRecording(false);
      }
    }
  };

  // Save voice recording and proceed
  const handleSubmit = async () => {
    if (!voiceprintData) {
      setError('Please make a voice recording first.');
      return;
    }

    setLoading(true);
    try {
      // Get user information (from localStorage)
      const userString = localStorage.getItem('user');
      if (!userString) {
        throw new Error('User information not found.');
      }
      
      const user = JSON.parse(userString);
      
      // Save voice recording to server
      await apiService.enrollVoice({
        userId: user.id,
        voiceprintData: Array.from(voiceprintData)
      });
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error saving voice recording.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              SS
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Voice Enrollment
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Voice authentication for secure meetings
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Instructions</h3>
          <p className="text-gray-600 mb-4">
            Please read the following text aloud. This recording will be used to create your voice identity.
          </p>
          
          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
            <p className="text-center text-lg font-medium">{enrollmentText}</p>
          </div>
          
          {isRecording && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 text-center mb-4">
                Recording time: {recordingDuration} seconds
              </p>
            </>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div className="flex justify-center gap-4">
            {!isRecording && !recordingComplete ? (
              <button
                onClick={handleStartRecording}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Start Recording
              </button>
            ) : isRecording ? (
              <button
                onClick={handleStopRecording}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop Recording
              </button>
            ) : (
              <>
                <button
                  onClick={handleStartRecording}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Record Again
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save and Continue'}
                  {!loading && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-gray-500 text-center">
            Your voice recording will be used for authentication purposes and will be stored securely.
            <br />
            Once you complete the enrollment, you'll be able to use voice authentication when joining meetings.
          </p>
        </div>
      </div>
    </div>
  );
} 