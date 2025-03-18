import { ApiError, ApiErrorCode } from '@/lib/errors';
import { handleOptionsRequest } from '@/lib/middleware/cors';
import { withErrorHandling } from '@/lib/middleware/error-handler';
import { rateLimiter } from '@/lib/middleware/rate-limiter';
import { validateCSRFToken } from '@/lib/security';
import createSupabaseServerClient from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';

// CORS support for OPTIONS request
export const OPTIONS = handleOptionsRequest;

/**
 * Endpoint for two-factor authentication setup
 * 1. Creates a secret key for the user
 * 2. Returns this key as a QR code
 * 3. User scans the QR code and sends a verification code
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiter: 3 requests / minute
  const rateLimiterMiddleware = rateLimiter({ limit: 3, windowInSeconds: 60 });
  await rateLimiterMiddleware(request);
  
  // CSRF token validation
  const csrfToken = request.headers.get('X-CSRF-Token');
  const storedToken = request.cookies.get('csrf_token')?.value;
  
  if (!csrfToken || !storedToken || !validateCSRFToken(csrfToken, storedToken)) {
    throw new ApiError(ApiErrorCode.UNAUTHORIZED, 'Invalid CSRF token', 403);
  }
  
  // Create Supabase client
  const supabase = createSupabaseServerClient();
  
  // Check user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new ApiError(ApiErrorCode.UNAUTHORIZED, 'You need to be logged in', 401);
  }
  
  const userId = session.user.id;
  
  // Check user's 2FA status
  const { data: userData } = await supabase
    .from('user_security_settings')
    .select('two_factor_enabled, two_factor_secret')
    .eq('user_id', userId)
    .single();
  
  // Return error if user already has 2FA enabled
  if (userData?.two_factor_enabled) {
    throw new ApiError(ApiErrorCode.CONFLICT, 'Two-factor authentication is already enabled', 409);
  }
  
  // Generate a new secret key
  const secret = speakeasy.generateSecret({
    name: `SecureSonic:${session.user.email}`,
    length: 20
  });
  
  // Generate QR code
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');
  
  // Temporarily store the secret key for the user
  // We don't save it to the database until the verification phase
  // In a real application, this information can be stored in a cache or temporary table
  const { error } = await supabase
    .from('user_security_settings')
    .upsert({
      user_id: userId,
      two_factor_enabled: false,
      two_factor_secret: secret.base32, // Stored temporarily, will be activated after verification
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });
  
  if (error) {
    throw new ApiError(ApiErrorCode.INTERNAL_SERVER_ERROR, 'Failed to save two-factor authentication information', 500);
  }
  
  return NextResponse.json({
    success: true,
    qrCode: qrCodeUrl,
    message: 'Two-factor authentication setup initiated'
  });
}); 