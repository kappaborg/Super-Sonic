// Using Web Crypto API for Edge Runtime compatibility
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Generates a random nonce value. Used for CSP.
 */
export function generateNonce() {
  // Use Web Crypto API instead of Node.js crypto
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
}

/**
 * Creates Content Security Policy (CSP) header.
 * This provides protection against XSS attacks.
 */
export function getCSP(nonce: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      isProd ? '' : "'unsafe-eval'", // For tools like React devtools in development mode
      'https://www.google-analytics.com',
      'https://cdn.jsdelivr.net'
    ].filter(Boolean),
    'style-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'unsafe-inline'", // Required for Tailwind
      'https://fonts.googleapis.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://res.cloudinary.com',
      'https://securesonic.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    'connect-src': [
      "'self'",
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      'https://api.securesonic.com',
      isProd ? '' : 'ws://localhost:*' // WebSocket for hot module reload
    ].filter(Boolean),
    'media-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'frame-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'upgrade-insecure-requests': isProd ? [''] : [],
  };

  return Object.entries(cspDirectives)
    .map(([key, values]) => {
      // Skip empty directives
      if (values.length === 0) return null;
      // Combine values
      return `${key} ${values.join(' ')}`;
    })
    .filter(Boolean)
    .join('; ');
}

/**
 * Sets security headers
 */
export function setSecurityHeaders(req: NextRequest, res: NextResponse): NextResponse {
  const nonce = generateNonce();
  const csp = getCSP(nonce);

  // Set response headers
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HTTP Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // Add property for scripts using nonce
  (req as any).nonce = nonce;

  return res;
}

/**
 * Generates a CSRF (Cross-Site Request Forgery) token for form submissions
 * @returns A random string to be used as a CSRF token
 */
export function generateCSRFToken(): string {
  // Use Web Crypto API to generate a UUID
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // Format as UUID
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates a CSRF token
 */
export function validateCSRFToken(requestToken: string, sessionToken: string): boolean {
  if (!requestToken || !sessionToken) {
    return false;
  }
  
  // Constant-time comparison using a timing-safe approach for Web API
  // Not as secure as Node's timingSafeEqual but better than direct comparison
  if (requestToken.length !== sessionToken.length) {
    return false;
  }
  
  // Use a constant-time comparison approach
  let result = 0;
  for (let i = 0; i < requestToken.length; i++) {
    result |= requestToken.charCodeAt(i) ^ sessionToken.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Hashes a user password using Web Crypto API
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate random salt
  const saltArray = new Uint8Array(16);
  crypto.getRandomValues(saltArray);
  const salt = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Encode password
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password + salt);
  
  // Hash with SHA-256 (PBKDF2 not directly available in Web Crypto)
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${salt}:${hashHex}`;
}

/**
 * Verifies a user password using Web Crypto API
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [salt, storedHash] = hash.split(':');
    
    // Encode password with salt
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password + salt);
    
    // Hash with SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return storedHash === hashHex;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Validates if a password meets security requirements
 * @param password The password to validate
 * @returns An object with validation result and optional error message
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return {
      valid: false,
      message:
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
    };
  }

  return { valid: true };
};

/**
 * Checks if an IP address is suspicious (e.g., known VPN, Tor exit node)
 * @param ip The IP address to check
 * @returns Whether the IP is suspicious
 */
export const isSuspiciousIP = async (ip: string): Promise<boolean> => {
  // In a real application, this would check against a database or external API
  // For demo purposes, we'll just return false
  return false;
};

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input The input string to sanitize
 * @returns The sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Validates headers for potential security issues
 * @param headers The request headers
 * @returns An object with validation result and optional issues
 */
export const validateSecurityHeaders = (
  headers: Headers
): { valid: boolean; issues?: string[] } => {
  const issues: string[] = [];

  // Check for content-type to prevent MIME sniffing attacks
  if (!headers.get("content-type")) {
    issues.push("Missing Content-Type header");
  }

  // Check for x-csrf-token when applicable
  // This is a simplified example; real implementation would be more complex
  const csrfToken = headers.get("x-csrf-token");
  if (!csrfToken) {
    issues.push("Missing CSRF token");
  }

  return {
    valid: issues.length === 0,
    issues: issues.length > 0 ? issues : undefined,
  };
};

/**
 * Generates a secure account recovery token
 * @returns A secure token for account recovery
 */
export const generateRecoveryToken = (): string => {
  // Generate a UUID-like string using Web Crypto API
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // Format as UUID
  return [
    Array.from(array.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(''),
    Array.from(array.slice(4, 6)).map(b => b.toString(16).padStart(2, '0')).join(''),
    Array.from(array.slice(6, 8)).map(b => b.toString(16).padStart(2, '0')).join(''),
    Array.from(array.slice(8, 10)).map(b => b.toString(16).padStart(2, '0')).join(''),
    Array.from(array.slice(10, 16)).map(b => b.toString(16).padStart(2, '0')).join(''),
  ].join('-');
}; 