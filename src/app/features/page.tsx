"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function FeaturesPage() {
    // Demo functionality
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [demoStatus, setDemoStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error' | 'permission-denied'>('idle');
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        setIsMounted(true);
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            // Clean up media recorder
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        if (!isMounted) return;

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create media recorder
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            // Collect audio chunks
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            // When recording stops
            mediaRecorder.onstop = () => {
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Process the audio
                processAudio();
            };

            // Start recording
            mediaRecorder.start();
            setDemoStatus('recording');
            setIsRecording(true);
            setRecordingTime(0);

            // Set timer for auto-stop
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 5) {
                        stopRecording();
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setDemoStatus('permission-denied');
        }
    };

    const stopRecording = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        setIsRecording(false);
        setDemoStatus('processing');
    };

    const processAudio = () => {
        // In a real app, you would send the audio to the server for analysis
        // Here we'll simulate processing with a delay
        setTimeout(() => {
            // Simulated success (in a real app, this would check actual voice match)
            const isSuccess = Math.random() > 0.3; // 70% success rate for demo
            setDemoStatus(isSuccess ? 'success' : 'error');

            // Create an audio element to play back the recording (optional)
            if (audioChunksRef.current.length > 0) {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                // You could use this blob to send to a server or play back
                // const audioUrl = URL.createObjectURL(audioBlob);
                // const audio = new Audio(audioUrl);
                // audio.play();
            }
        }, 2000);
    };

    const resetDemo = () => {
        setDemoStatus('idle');
        audioChunksRef.current = [];
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Voice Authentication Technology</h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                    SecureSonic's cutting-edge voice biometric system provides the most natural and secure way to verify your identity.
                </p>
            </div>

            {/* How It Works Section */}
            <section className="mb-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">How Voice Authentication Works</h2>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg">
                        <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Voice Capture</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            Your unique voice pattern is captured through a simple enrollment process, where you speak a specific phrase multiple times.
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg">
                        <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">AI Analysis</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            Our AI engine extracts over 100 unique features from your voice, creating a secure voiceprint that can't be replicated.
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg">
                        <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Secure Verification</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            When you authenticate, your live voice is compared to your stored voiceprint, verifying your identity with 99.6% accuracy.
                        </p>
                    </div>
                </div>
            </section>

            {/* Interactive Demo */}
            <section className="mb-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-8 text-center">Try Voice Authentication</h2>

                <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-6 shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4 text-center">Interactive Demo</h3>

                    <div className="mb-6 text-gray-700 dark:text-gray-300 text-center">
                        {demoStatus === 'idle' && (
                            <p>Click the button below and say: "My voice is my password"</p>
                        )}
                        {demoStatus === 'recording' && (
                            <p>Recording... {5 - recordingTime} seconds left</p>
                        )}
                        {demoStatus === 'processing' && (
                            <p>Processing your voice signature...</p>
                        )}
                        {demoStatus === 'success' && (
                            <p className="text-green-600 dark:text-green-400 font-semibold">
                                Voice authenticated successfully! Your voice pattern matches.
                            </p>
                        )}
                        {demoStatus === 'error' && (
                            <p className="text-red-600 dark:text-red-400 font-semibold">
                                Authentication failed. Please try again with clearer voice.
                            </p>
                        )}
                        {demoStatus === 'permission-denied' && (
                            <p className="text-red-600 dark:text-red-400 font-semibold">
                                Microphone access denied. Please enable microphone access in your browser settings.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-center">
                        {demoStatus === 'idle' && (
                            <button
                                onClick={startRecording}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                </svg>
                                Start Voice Authentication
                            </button>
                        )}

                        {demoStatus === 'recording' && (
                            <button
                                onClick={stopRecording}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                                </svg>
                                Stop Recording
                            </button>
                        )}

                        {demoStatus === 'processing' && (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing...</span>
                            </div>
                        )}

                        {(demoStatus === 'success' || demoStatus === 'error' || demoStatus === 'permission-denied') && (
                            <button
                                onClick={resetDemo}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg"
                            >
                                Try Again
                            </button>
                        )}
                    </div>

                    <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                        <p>This is a simulated demo. Your voice is not stored or sent to any server.</p>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Benefits of Voice Authentication</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Enhanced Security</h3>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>Virtually impossible to fake or replicate someone's voice pattern</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>Multi-factor authentication when combined with other security measures</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>Anti-spoofing technology detects recordings or voice synthesis</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Superior User Experience</h3>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>No passwords to remember or reset</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>Authentication in as little as 3 seconds</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>Hands-free operation perfect for mobile and IoT devices</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Security Measures */}
            <section className="mb-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Voice Security Measures</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Fraud Prevention</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Our system implements advanced fraud detection to prevent voice spoofing:
                        </p>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                <span>Liveness detection ensures the voice is coming from a live person</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                <span>Dynamic phrase prompts prevent replay attacks</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                <span>AI detection of synthesized voices or deepfakes</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Privacy & Compliance</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            We prioritize your data privacy at every level:
                        </p>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                </svg>
                                <span>End-to-end encryption for all voice data</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                </svg>
                                <span>GDPR, CCPA, SOC2, and HIPAA compliant</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                </svg>
                                <span>Voice signatures stored as encrypted mathematical models, not as recordings</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="text-center">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Ready to Implement Voice Authentication?</h2>
                <p className="text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                    Join thousands of businesses that have already enhanced their security with SecureSonic's voice authentication platform.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/pricing" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
                        View Pricing Plans
                    </Link>
                    <Link href="/contact" className="bg-white dark:bg-gray-800 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold py-3 px-6 rounded-lg">
                        Contact Sales
                    </Link>
                </div>
            </section>
        </div>
    );
} 