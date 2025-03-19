// Simplified GGWave Library for SecureSonic
// This is a mock implementation to prevent errors
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.ggwave = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Mock GGWave instance constructor
    function GGWaveInstance(params) {
        this.sampleRate = params.sampleRate || 48000;
        this.protocol = params.protocol || 'ultrasonic';
        this.isValid = true;

        console.log('GGWave instance created with sample rate:', this.sampleRate);
    }

    // Encoder function
    function encode(instance, text, protocol) {
        console.log('GGWave encoding:', text);
        // Return a mock Float32Array with oscillating values
        const length = 8000;
        const result = new Float32Array(length);

        for (let i = 0; i < length; i++) {
            result[i] = 0.5 * Math.sin(i * 0.1);
        }

        return result;
    }

    // Decoder function
    function decode(instance, audioData) {
        console.log('GGWave decoding audio data of length:', audioData.length);
        // For mock purposes, just return empty
        return new Uint8Array(0);
    }

    // Protocol IDs
    const ProtocolId = {
        GGWAVE_PROTOCOL_ULTRASONIC_NORMAL: 1,
        GGWAVE_PROTOCOL_ULTRASONIC_FAST: 2,
        GGWAVE_PROTOCOL_ULTRASONIC_FASTEST: 3,
        GGWAVE_PROTOCOL_AUDIBLE_NORMAL: 4,
        GGWAVE_PROTOCOL_AUDIBLE_FAST: 5,
        GGWAVE_PROTOCOL_AUDIBLE_FASTEST: 6
    };

    // Factory function to create instance
    function init(params) {
        console.log('Initializing GGWave with params:', params);
        return new GGWaveInstance(params);
    }

    // Public API
    return {
        init: init,
        encode: encode,
        decode: decode,
        ProtocolId: ProtocolId
    };
})); 