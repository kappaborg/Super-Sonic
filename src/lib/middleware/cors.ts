import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS configuration options
 */
export interface CorsOptions {
  // Allowed origins
  allowedOrigins?: string[];
  
  // Allow all origins
  allowAllOrigins?: boolean;
  
  // Allowed HTTP methods
  allowedMethods?: string[];
  
  // Allowed headers
  allowedHeaders?: string[];
  
  // Accept credentials
  allowCredentials?: boolean;
  
  // Cache duration (seconds)
  maxAge?: number;
}

/**
 * Default CORS options
 */
export const defaultOptions: CorsOptions = {
  allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  allowAllOrigins: process.env.ALLOW_ALL_ORIGINS === 'true',
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-Auth-Return-Redirect',
    'Accept',
  ],
  allowCredentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Checks if an origin is allowed based on CORS options
 * 
 * @param origin Origin to check
 * @param options CORS options
 * @returns Whether the origin is allowed
 */
export function isAllowedOrigin(origin: string | null, options: CorsOptions = defaultOptions): boolean {
  // No origin header (not a CORS request)
  if (!origin) {
    return true;
  }
  
  // Allow all origins
  if (options.allowAllOrigins) {
    return true;
  }
  
  // Check if origin is in allowed list
  return options.allowedOrigins?.some(allowedOrigin => {
    // Exact match
    if (allowedOrigin === origin) {
      return true;
    }
    
    // Wildcard subdomain match
    if (allowedOrigin.startsWith('*.')) {
      const domain = allowedOrigin.slice(2);
      return origin.endsWith(domain) && origin.includes('.');
    }
    
    return false;
  }) || false;
}

/**
 * Creates CORS headers based on the request origin and options
 * 
 * @param origin Request origin
 * @param options CORS options
 * @returns CORS headers
 */
function createCorsHeaders(origin: string | null, options: CorsOptions = defaultOptions): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Set Access-Control-Allow-Origin
  if (origin && isAllowedOrigin(origin, options)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (options.allowAllOrigins) {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  
  // Set other CORS headers
  if (options.allowedMethods?.length) {
    headers['Access-Control-Allow-Methods'] = options.allowedMethods.join(', ');
  }
  
  if (options.allowedHeaders?.length) {
    headers['Access-Control-Allow-Headers'] = options.allowedHeaders.join(', ');
  }
  
  if (options.allowCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  if (options.maxAge) {
    headers['Access-Control-Max-Age'] = options.maxAge.toString();
  }
  
  // Vary header
  headers['Vary'] = 'Origin';
  
  return headers;
}

/**
 * CORS handler for OPTIONS requests
 * Handles preflight CORS requests
 * 
 * @param req Next.js request object
 * @param options CORS options
 * @returns Next.js response object
 */
export function handleOptionsRequest(req: NextRequest, options: CorsOptions = defaultOptions): NextResponse {
  const origin = req.headers.get('origin');
  const headers = createCorsHeaders(origin, options);
  
  // Return successful response to OPTIONS requests
  return new NextResponse(null, { 
    status: 204,
    headers 
  });
}

/**
 * Adds CORS headers to API responses
 * 
 * @param req Next.js request object
 * @param res Next.js response object
 * @param options CORS options
 * @returns Response with CORS headers added
 */
export function addCorsHeaders(
  req: NextRequest,
  res: NextResponse,
  options: CorsOptions = defaultOptions
): NextResponse {
  const origin = req.headers.get('origin');
  const headers = createCorsHeaders(origin, options);
  
  // Add CORS headers to response
  Object.entries(headers).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  
  return res;
} 