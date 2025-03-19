'use client';

import apiService from '@/services/api';
import { checkMicrophonePermission, extractVoiceprint, isRecordingActive, startRecording, stopRecording } from '@/utils/audioUtils';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function VoiceEnrollmentPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [enrollmentText, setEnrollmentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [microphoneStatus, setMicrophoneStatus] = useState<'unknown' | 'checking' | 'available' | 'unavailable' | 'denied'>('unknown');
  const [voiceprintData, setVoiceprintData] = useState<Float32Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(Array(50).fill(5));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveformRef = useRef<NodeJS.Timeout | null>(null);

  // Example enrollment phrases
  const enrollmentTexts = [
    "I am recording my voice for secure meetings",
    "My voice is my identity",
    "With SecureSonic our meetings are secure",
    "This voice belongs only to me and is unique"
  ];

  // Check microphone permission on component mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        setMicrophoneStatus('checking');
        const hasPermission = await checkMicrophonePermission();
        setMicrophoneStatus(hasPermission ? 'available' : 'unavailable');
      } catch (err) {
        setMicrophoneStatus('unknown');
        console.warn('Could not check microphone permissions:', err);
      }
    };

    checkMicPermission();

    // Select a random enrollment phrase
    const randomIndex = Math.floor(Math.random() * enrollmentTexts.length);
    setEnrollmentText(enrollmentTexts[randomIndex]);

    // Clean up timers when component is unmounted
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (waveformRef.current) clearInterval(waveformRef.current);
    };
  }, []);

  // Simulate waveform animation when recording
  const animateWaveform = () => {
    waveformRef.current = setInterval(() => {
      setWaveformData(prev => {
        return prev.map(() => Math.floor(Math.random() * 30) + 5);
      });
    }, 150);
  };

  // Start voice recording
  const handleStartRecording = async () => {
    setError(null);
    setRecordingComplete(false);
    setProgress(0);

    try {
      // First set status to checking to show loading UI
      setMicrophoneStatus('checking');

      // This will trigger browser permission dialog if not already granted
      await startRecording();

      // If successful, update recording state
      setIsRecording(true);
      setMicrophoneStatus('available');

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

      // Start waveform animation
      animateWaveform();

    } catch (err: any) {
      // Check if this is a permission error
      if (err.message && (
        err.message.includes('denied') ||
        err.message.includes('permission') ||
        err.name === 'NotAllowedError'
      )) {
        setMicrophoneStatus('denied');
        setError('Microphone access was denied. Please allow microphone access in your browser settings and reload this page.');
      } else {
        setMicrophoneStatus('unavailable');
        setError(err.message || 'Error accessing microphone.');
      }

      setIsRecording(false);
    }
  };

  // Stop voice recording
  const handleStopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (waveformRef.current) clearInterval(waveformRef.current);

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

  // Helper function to open browser settings
  const openBrowserSettings = () => {
    setError('Please check your browser settings to allow microphone access, then reload this page.');

    // For Chrome/Edge
    if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
      window.open('chrome://settings/content/microphone', '_blank');
    }
    // For Firefox
    else if (navigator.userAgent.includes('Firefox')) {
      window.open('about:preferences#privacy', '_blank');
    }
    // For Safari
    else if (navigator.userAgent.includes('Safari')) {
      alert('Please open Safari Preferences > Websites > Microphone and allow access for this site.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Voice Enrollment
          </h2>
          <p className="mt-2 text-center text-sm text-blue-300">
            Your voice is the key to secure meetings
          </p>
        </div>

        <div className="bg-gray-800 bg-opacity-70 p-6 rounded-2xl shadow-xl backdrop-blur-sm border border-blue-500/20">

          {/* Microphone status indicator */}
          {microphoneStatus !== 'available' && microphoneStatus !== 'unknown' && (
            <div className={`rounded-xl p-4 mb-4 ${microphoneStatus === 'checking'
                ? 'bg-blue-900/40 border border-blue-400/30'
                : 'bg-yellow-900/40 border border-yellow-400/30'
              }`}>
              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${microphoneStatus === 'checking'
                    ? 'bg-blue-500/30'
                    : 'bg-yellow-500/30'
                  }`}>
                  {microphoneStatus === 'checking' ? (
                    <svg className="animate-spin h-6 w-6 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`font-medium ${microphoneStatus === 'checking' ? 'text-blue-300' : 'text-yellow-300'}`}>
                    {microphoneStatus === 'checking'
                      ? 'Checking microphone access...'
                      : microphoneStatus === 'denied'
                        ? 'Microphone access was denied'
                        : 'Microphone is not available'}
                  </p>
                  {microphoneStatus === 'denied' && (
                    <button
                      onClick={openBrowserSettings}
                      className="text-sm text-yellow-300 underline mt-1 hover:text-yellow-200"
                    >
                      How to enable microphone access
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <h3 className="text-lg font-medium text-white mb-2">Instructions</h3>
          <p className="text-gray-300 mb-4">
            Please read the following text aloud. This recording will be used to create your voice identity.
          </p>

          <div className="bg-gray-900 p-5 rounded-xl border border-blue-400/30 mb-6 shadow-inner">
            <p className="text-center text-lg font-medium text-white">{enrollmentText}</p>
          </div>

          {isRecording && (
            <>
              <div className="flex space-x-1 mb-3 h-12 items-end">
                {waveformData.map((height, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-500 rounded-t transition-all duration-150 ease-in-out"
                    style={{ height: `${height}px` }}
                  ></div>
                ))}
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-300 text-center mb-4">
                Recording time: {recordingDuration} seconds
              </p>
            </>
          )}

          {recordingComplete && !isRecording && (
            <div className="bg-blue-900/40 rounded-xl p-4 mb-4 border border-blue-400/30">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-500/30 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-300 font-medium">Voice recording completed! You can save or record again.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/40 rounded-xl p-4 mb-4 border border-red-400/30">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-red-500/30 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4 mt-6">
            {!isRecording && !recordingComplete ? (
              <button
                onClick={handleStartRecording}
                disabled={microphoneStatus === 'checking' || microphoneStatus === 'denied'}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {microphoneStatus === 'checking' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Preparing Microphone...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    Start Recording
                  </>
                )}
              </button>
            ) : isRecording ? (
              <button
                onClick={handleStopRecording}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 ease-in-out shadow-lg shadow-red-500/30"
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
                  className="inline-flex items-center px-5 py-2 border border-blue-400/50 rounded-full shadow-sm text-sm font-medium text-blue-300 bg-transparent hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Record Again
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center px-5 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save and Continue
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-blue-300 text-center">
            Your voice recording will be processed securely using advanced AI technology.
            <br />
            Once you complete the enrollment, you'll be able to use voice authentication when joining meetings.
          </p>
        </div>
      </div>
    </div>
  );
} 