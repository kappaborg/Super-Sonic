// Critical initialization script for SecureSonic
console.log('SecureSonic critical.js loaded');

// Initialize global app state
window.secureSonic = window.secureSonic || {
    initialized: true,
    features: {
        voiceAuth: true,
        darkMode: typeof window !== 'undefined' &&
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
    },
    version: '1.0.0'
};

// Pre-initialize audio context to work around Safari's autoplay limitations
function initAudio() {
    try {
        if (typeof window !== 'undefined') {
            // Create and suspend audio context to enable later user activation
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                window.secureSonic.audioContext = new AudioContext();
                if (window.secureSonic.audioContext.state === 'running') {
                    window.secureSonic.audioContext.suspend();
                }
                console.log('Audio context pre-initialized');
            }
        }
    } catch (e) {
        console.warn('Audio context initialization failed', e);
    }
}

// Late-loading feature detection
window.addEventListener('DOMContentLoaded', () => {
    initAudio();

    // Detect audio capabilities
    window.secureSonic.hasAudioSupport = !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
    );

    console.log('SecureSonic initialized with audio support:', window.secureSonic.hasAudioSupport);
}); 