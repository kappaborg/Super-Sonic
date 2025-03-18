import { ApiError, ApiErrorCode } from '@/lib/errors';
import { handleOptionsRequest } from '@/lib/middleware/cors';
import { withErrorHandling } from '@/lib/middleware/error-handler';
import { rateLimiter } from '@/lib/middleware/rate-limiter';
import { validateCSRFToken } from '@/lib/security';
import createSupabaseServerClient from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// CORS support for OPTIONS request
export const OPTIONS = handleOptionsRequest;

/**
 * Endpoint to disable two-factor authentication
 * 1. Checks the user's 2FA status
 * 2. Disables 2FA
 * 3. Deletes the secret key
 */
export const POST = withErrorHandling(
  async (request: NextRequest) => {
    // Apply rate limiting
    const rateLimitMiddleware = rateLimiter({ limit: 5, windowInSeconds: 60 });
    await rateLimitMiddleware(request);
    
    // Get session to check authentication
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new ApiError(ApiErrorCode.UNAUTHORIZED, 'Authentication required');
    }
    
    // Validate CSRF token
    const requestData = await request.json();
    const csrfToken = request.headers.get('x-csrf-token');
    const storedCsrfToken = requestData.csrfToken || '';
    
    if (!validateCSRFToken(csrfToken || '', storedCsrfToken)) {
      throw new ApiError(ApiErrorCode.INVALID_CSRF_TOKEN, 'Invalid CSRF token');
    }
    
    // Get the user from the database
    const { data: userData, error: userError } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (userError || !userData) {
      throw new ApiError(ApiErrorCode.NOT_FOUND, 'User security settings not found');
    }
    
    // Check if 2FA is already disabled
    if (!userData.two_factor_enabled) {
      return NextResponse.json({
        success: true,
        message: '2FA is already disabled'
      });
    }
    
    // Disable 2FA and delete secret
    const { error: updateError } = await supabase
      .from('user_security_settings')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id);
    
    if (updateError) {
      throw new ApiError(
        ApiErrorCode.DATABASE_ERROR, 
        'Failed to disable 2FA'
      );
    }
    
    // Log the security event
    await supabase.from('security_events').insert({
      user_id: session.user.id,
      event_type: 'two_factor_disabled',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    });
    
    return NextResponse.json({
      success: true,
      message: '2FA has been disabled successfully'
    });
  }
); 