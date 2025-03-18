import { query } from '@/lib/db';
import { ApiError, createRateLimitError } from '@/lib/errors';
import { NextRequest } from 'next/server';

// Rate limiter configuration options
export interface RateLimiterOptions {
  // Maximum number of requests allowed in a time window
  limit: number;
  
  // Time window (in seconds)
  windowInSeconds: number;
  
  // Block duration (in seconds, optional)
  blockDurationInSeconds?: number;
  
  // Apply limit based on request path (optional)
  pathBased?: boolean;
  
  // Apply limit based on IP (optional)
  ipBased?: boolean;
  
  // Custom identifier function (optional)
  identifierFn?: (req: NextRequest) => Promise<string>;
}

/**
 * Middleware that limits API requests
 * Controls the number of requests per user or IP address
 * and throws an error for requests exceeding the specified limit.
 * 
 * @param options Rate limiter configuration options
 * @returns Middleware function
 */
export function rateLimiter(options: RateLimiterOptions) {
  return async (req: NextRequest) => {
    // Skip rate limiter in development environment
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_RATE_LIMIT_IN_DEV !== 'true') {
      return;
    }

    try {
      let identifier: string;
      
      if (options.identifierFn) {
        identifier = await options.identifierFn(req);
      } else {
        // Get user session from your auth provider
        const userId = req.headers.get('x-user-id'); // Replace with your auth logic
        
        if (userId && !options.ipBased) {
          identifier = `user_${userId}`;
        } else {
          const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
          identifier = `ip_${ip}`;
        }
      }
      
      if (options.pathBased) {
        const path = new URL(req.url).pathname;
        identifier = `${identifier}_${path}`;
      }

      const now = Math.floor(Date.now() / 1000);
      const windowStart = now - options.windowInSeconds;
      const expireAt = now + (options.blockDurationInSeconds || options.windowInSeconds);
      
      // Count requests within the time window
      const result = await query(
        `SELECT COUNT(*) as count 
         FROM rate_limits 
         WHERE identifier = $1 
         AND timestamp >= $2 
         AND timestamp <= $3`,
        [identifier, windowStart, now]
      ) as { count: number }[];
      
      if (result[0].count >= options.limit) {
        const retryAfter = options.blockDurationInSeconds || options.windowInSeconds;
        throw createRateLimitError(
          retryAfter,
          `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
        );
      }
      
      // Insert new rate limit record
      await query(
        `INSERT INTO rate_limits (identifier, timestamp, expire_at, path)
         VALUES ($1, $2, $3, $4)`,
        [identifier, now, expireAt, options.pathBased ? new URL(req.url).pathname : null]
      );
      
      return;
    } catch (error) {
      // If the error is not an ApiError, rethrow the original error
      if (!(error instanceof ApiError)) {
        console.error('Rate limiter error:', error);
      }
      
      // Throw rate limit errors, rethrow other errors
      throw error;
    }
  };
} 