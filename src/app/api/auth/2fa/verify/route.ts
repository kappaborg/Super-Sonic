import { ApiError, ApiErrorCode } from '@/lib/errors';
import { handleOptionsRequest } from '@/lib/middleware/cors';
import { withErrorHandling } from '@/lib/middleware/error-handler';
import { rateLimiter } from '@/lib/middleware/rate-limiter';
import { validateRequest } from '@/lib/middleware/validate-request';
import { validateCSRFToken } from '@/lib/security';
import createSupabaseServerClient from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import * as speakeasy from 'speakeasy';
import { z } from 'zod';

// CORS support for OPTIONS request
export const OPTIONS = handleOptionsRequest;

// Verification code schema
const verifyCodeSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits").regex(/^\d+$/, "Verification code must contain only numbers")
});

/**
 * Endpoint for two-factor authentication code verification
 * 1. Gets the code sent by the user
 * 2. Verifies it with the user's secret key
 * 3. Enables 2FA if verification is successful
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiter: 5 requests per minute
  const rateLimitMiddleware = rateLimiter({ limit: 5, windowInSeconds: 60 });
  await rateLimitMiddleware(request);
  
  // CSRF token validation
  const csrfToken = request.headers.get('X-CSRF-Token');
  const storedToken = request.cookies.get('csrf_token')?.value;
  
  if (!csrfToken || !storedToken || !validateCSRFToken(csrfToken, storedToken)) {
    throw new ApiError(ApiErrorCode.UNAUTHORIZED, 'Invalid CSRF token', 403);
  }
  
  // Validate request
  const validatedData = await validateRequest(request, verifyCodeSchema);
  
  // Create Supabase client
  const supabase = createSupabaseServerClient();
  
  // Check user's session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new ApiError(ApiErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  }
  
  const userId = session.user.id;
  
  // Get user's 2FA status and secret key
  const { data: userData } = await supabase
    .from('user_security_settings')
    .select('two_factor_enabled, two_factor_secret')
    .eq('user_id', userId)
    .single();
  
  if (!userData) {
    throw new ApiError(ApiErrorCode.NOT_FOUND, 'User security settings not found', 404);
  }
  
  // Return error if user already has 2FA enabled
  if (userData.two_factor_enabled) {
    throw new ApiError(ApiErrorCode.CONFLICT, 'Two-factor authentication is already enabled', 409);
  }
  
  // Return error if secret key is missing
  if (!userData.two_factor_secret) {
    throw new ApiError(ApiErrorCode.BAD_REQUEST, 'Two-factor authentication setup not completed', 400);
  }
  
  // Verify the code sent by the user
  const verified = speakeasy.totp.verify({
    secret: userData.two_factor_secret,
    encoding: 'base32',
    token: validatedData.code
  });
  
  if (!verified) {
    throw new ApiError(ApiErrorCode.BAD_REQUEST, 'Invalid verification code', 400);
  }
  
  // Enable 2FA
  const { error } = await supabase
    .from('user_security_settings')
    .update({
      two_factor_enabled: true,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (error) {
    throw new ApiError(ApiErrorCode.INTERNAL_SERVER_ERROR, 'Failed to enable two-factor authentication', 500);
  }
  
  // Update user metadata
  await supabase.auth.updateUser({
    data: {
      has_2fa: true
    }
  });
  
  // Terminate all other sessions
  await supabase.auth.signOut({ scope: 'others' });
  
  return NextResponse.json({
    success: true,
    message: 'Two-factor authentication successfully enabled'
  });
}); 