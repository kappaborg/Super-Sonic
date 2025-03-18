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
 * Endpoint to terminate all sessions except the current one
 * 1. Checks the user's session
 * 2. Terminates all sessions except the current one
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiter: 5 requests / minute
  const rateLimiterMiddleware = rateLimiter({ limit: 5, windowInSeconds: 60 });
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
    throw new ApiError(ApiErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  }
  
  const userId = session.user.id;
  
  // Remove all sessions except the current one from user_sessions table
  // Note: We just use the auth.signOut() method since it's simpler and more reliable
  
  // Terminate all other sessions with Supabase auth
  const { error: signOutError } = await supabase.auth.signOut({ 
    scope: 'others' 
  });
  
  if (signOutError) {
    throw new ApiError(
      ApiErrorCode.INTERNAL_SERVER_ERROR,
      'An error occurred while terminating other sessions',
      500
    );
  }
  
  return NextResponse.json({
    success: true,
    message: 'All other sessions have been successfully terminated'
  });
}); 