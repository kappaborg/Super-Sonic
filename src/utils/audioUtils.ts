import { EventEmitter } from 'events';

// Event emitter for audio processing events
export const audioEventEmitter = new EventEmitter();

// Global variables for audio processing
let audioContext: AudioContext | null = null;
let ggwaveInstance: any = null;
let mediaStreamInstance: MediaStream | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
let audioProcessor: ScriptProcessorNode | null = null;
let audioAnalyser: AnalyserNode | null = null;
let isRecording = false;
let voiceprintData: Float32Array | null = null;

// Helper function: Convert arrays
function convertTypedArray(src: any, type: any) {
  const buffer = new ArrayBuffer(src.byteLength);
  new src.constructor(buffer).set(src);
  return new type(buffer);
}

/**
 * Loads and initializes the GGWave library
 */
export async function initGGWave(): Promise<void> {
  try {
    if (typeof window !== 'undefined' && !ggwaveInstance) {
      // @ts-ignore - ggwave.js is loaded into the window object
      const ggwave = window.ggwave;

      if (!ggwave) {
        throw new Error('Could not load GGWave library. Make sure GGWave.js is included.');
      }

      // Create audio context
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Initialize GGWave
      const params = {
        sampleRate: audioContext.sampleRate,
        protocol: process.env.GGWAVE_PROTOCOL || 'ultrasonic'
      };

      ggwaveInstance = ggwave.init(params);
      console.log('GGWave initialized:', params);
    }
  } catch (error) {
    console.error('Failed to initialize GGWave:', error);
    throw error;
  }
}

/**
 * Check if the browser supports microphone access
 */
export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    // Check if the mediaDevices API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('getUserMedia API is not supported in this browser');
      return false;
    }

    // Try to get permission without actually opening the mic
    const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    if (permissionStatus.state === 'granted') {
      return true;
    } else if (permissionStatus.state === 'prompt') {
      // Permission hasn't been decided yet, we'll ask when needed
      return true;
    } else {
      // Permission was denied previously
      return false;
    }
  } catch (error) {
    console.warn('Error checking microphone permission:', error);
    // If we can't check permissions, we'll assume we need to ask
    return true;
  }
}

/**
 * Starts audio recording and processes incoming audio data
 */
export async function startRecording(): Promise<void> {
  if (isRecording) return;

  try {
    // Check and create audio context first
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (err) {
        throw new Error('Failed to create AudioContext. Your browser may not support this feature.');
      }
    }

    // Resume audio context if it's suspended (needed for some browsers)
    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch (err) {
        console.warn('Failed to resume AudioContext:', err);
      }
    }

    // Initialize GGWave if needed
    if (!ggwaveInstance) {
      try {
        await initGGWave();
      } catch (err) {
        // Fallback mode if GGWave fails, we can still record audio
        console.warn('GGWave initialization failed, continuing in fallback mode:', err);
      }
    }

    const constraints = {
      audio: {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
      },
    };

    // Request microphone access with better error handling
    try {
      // Open a user gesture dialog to request permission explicitly (mobile browsers often need this)
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamInstance = stream;

      // Create audio stream source
      mediaStreamSource = audioContext.createMediaStreamSource(stream);

      // Create audio analyzer node
      audioAnalyser = audioContext.createAnalyser();
      audioAnalyser.fftSize = 2048;

      // Create script processor node
      const bufferSize = 1024;
      audioProcessor = audioContext.createScriptProcessor(
        bufferSize,
        1, // Input channels
        1  // Output channels
      );

      // Audio processing function
      audioProcessor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!ggwaveInstance) return;

        // Get microphone data
        const inputBuffer = e.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);

        // Extract voiceprint from audio data
        processVoiceprintData(inputData);

        // Decode audio data with GGWave
        try {
          const result = (window as any).ggwave?.decode?.(
            ggwaveInstance,
            convertTypedArray(new Float32Array(inputData), Int8Array)
          );

          // If results exist, process as message
          if (result && result.length > 0) {
            const text = new TextDecoder("utf-8").decode(result);
            audioEventEmitter.emit('messageReceived', text);

            // Process messages containing security tokens
            if (text.startsWith('AUTH:')) {
              audioEventEmitter.emit('authTokenReceived', text.substring(5));
            }
          }
        } catch (err) {
          // Ignore GGWave processing errors, they shouldn't stop recording
          console.warn('Error processing audio with GGWave:', err);
        }
      };

      // Connect nodes
      mediaStreamSource.connect(audioAnalyser);
      audioAnalyser.connect(audioProcessor);
      audioProcessor.connect(audioContext.destination);

      isRecording = true;
      audioEventEmitter.emit('recordingStateChanged', true);

    } catch (error: any) {
      // Handle common errors explicitly
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Microphone access was denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Your microphone is busy or unavailable. Please close other applications that might be using it.');
      } else if (error.name === 'OverconstrainedError') {
        throw new Error('Microphone constraints cannot be satisfied. Please try a different microphone.');
      } else if (error.name === 'TypeError' || error.name === 'AbortError') {
        throw new Error('Failed to access microphone. Please check your browser settings.');
      } else {
        throw new Error(`Failed to start recording: ${error.message || 'Unknown error'}`);
      }
    }

  } catch (error) {
    console.error('Failed to start audio recording:', error);
    audioEventEmitter.emit('recordingError', error);
    throw error;
  }
}

/**
 * Stops audio recording
 */
export async function stopRecording(): Promise<void> {
  if (!isRecording) return;

  // Stop audio processing
  if (audioProcessor && audioContext) {
    // Disconnect in reverse order of connection
    if (mediaStreamSource && audioAnalyser) {
      mediaStreamSource.disconnect();
    }
    if (audioAnalyser) {
      audioAnalyser.disconnect();
    }
    audioProcessor.disconnect();
    audioProcessor = null;
  }

  // Stop media stream
  if (mediaStreamInstance) {
    mediaStreamInstance.getTracks().forEach(track => track.stop());
    mediaStreamInstance = null;
  }

  mediaStreamSource = null;
  isRecording = false;

  audioEventEmitter.emit('recordingStateChanged', false);
}

/**
 * Sends a message over audio waves
 */
export function sendAudioMessage(message: string, token?: string): void {
  if (!ggwaveInstance || !audioContext) {
    console.error('Attempted to send message before GGWave initialization');
    return;
  }

  try {
    // Add security token
    const finalMessage = token ? `TOKEN:${token}:${message}` : message;

    // Encode message
    const encoded = (window as any).ggwave.encode(
      ggwaveInstance,
      finalMessage,
      (window as any).ggwave.ProtocolId.GGWAVE_PROTOCOL_AUDIBLE_FAST
    );

    // Create audio data
    const waveform = new Float32Array(encoded);

    // Create audio buffer
    const buffer = audioContext.createBuffer(1, waveform.length, audioContext.sampleRate);
    buffer.getChannelData(0).set(waveform);

    // Create audio source and play
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();

    // Trigger message sent event
    audioEventEmitter.emit('messageSent', message);
  } catch (error) {
    console.error('Error sending message:', error);
    audioEventEmitter.emit('messageSendingError', error);
  }
}

/**
 * Processes audio data to extract voice signature
 */
function processVoiceprintData(audioData: Float32Array): void {
  // This is just a simple example, a real application would use a more complex algorithm
  if (!voiceprintData) {
    voiceprintData = new Float32Array(1024);
  }

  // Store the latest audio data (simplified)
  if (audioData.length >= 1024) {
    voiceprintData.set(audioData.slice(0, 1024));
  } else {
    voiceprintData.set(audioData);
  }

  // Notify about voiceprint data updates
  audioEventEmitter.emit('voiceprintUpdated', voiceprintData);
}

/**
 * Extracts voice signature from audio data
 * This is the public API to get the current voiceprint
 */
export async function extractVoiceprint(): Promise<Float32Array> {
  if (!voiceprintData) {
    throw new Error('No voice data available. Please record audio first.');
  }

  // In a real application, you would apply more sophisticated voice feature extraction here
  // For demo purposes, we're just returning the raw audio data

  // Create a copy to prevent external modification
  const result = new Float32Array(voiceprintData.length);
  result.set(voiceprintData);

  return result;
}

/**
 * Returns the current voice signature
 */
export function getVoiceprint(): Float32Array | null {
  return voiceprintData;
}

/**
 * Returns the recording status
 */
export function isRecordingActive(): boolean {
  return isRecording;
}

/**
 * Returns the audio analyzer node
 */
export function getAudioAnalyser(): AnalyserNode | null {
  return audioAnalyser;
}

/**
 * Cleans up all audio resources
 */
export function cleanupAudioResources(): void {
  stopRecording();

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  ggwaveInstance = null;
  voiceprintData = null;
}

// Clean up resources when the page is closed
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupAudioResources);
} 