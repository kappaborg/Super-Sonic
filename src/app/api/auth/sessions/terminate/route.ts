import { ApiError, ApiErrorCode } from '@/lib/errors';
import { handleOptionsRequest } from '@/lib/middleware/cors';
import { withErrorHandling } from '@/lib/middleware/error-handler';
import { rateLimiter } from '@/lib/middleware/rate-limiter';
import { validateRequest } from '@/lib/middleware/validate-request';
import { validateCSRFToken } from '@/lib/security';
import createSupabaseServerClient from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// CORS support for OPTIONS request
export const OPTIONS = handleOptionsRequest;

// Session termination schema
const terminateSessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format')
});

/**
 * Endpoint to terminate a specific session
 * 1. Checks the user's session
 * 2. Verifies that the specified session belongs to the user
 * 3. Terminates the session
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiter: 10 requests / minute
  const rateLimiterMiddleware = rateLimiter({ limit: 10, windowInSeconds: 60 });
  await rateLimiterMiddleware(request);
  
  // CSRF token validation
  const csrfToken = request.headers.get('X-CSRF-Token');
  const storedToken = request.cookies.get('csrf_token')?.value;
  
  if (!csrfToken || !storedToken || !validateCSRFToken(csrfToken, storedToken)) {
    throw new ApiError(ApiErrorCode.UNAUTHORIZED, 'Invalid CSRF token', 403);
  }
  
  // Validate request
  const validatedData = await validateRequest(request, terminateSessionSchema);
  
  // Create Supabase client
  const supabase = createSupabaseServerClient();
  
  // Check user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new ApiError(ApiErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  }
  
  const userId = session.user.id;
  
  // Prevent terminating the current session
  if (validatedData.sessionId === session.access_token) {
    throw new ApiError(ApiErrorCode.BAD_REQUEST, 'Cannot terminate the current session', 400);
  }
  
  // Verify the session belongs to the user
  const { data: sessionData } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', validatedData.sessionId)
    .single();
  
  if (!sessionData) {
    throw new ApiError(ApiErrorCode.NOT_FOUND, 'Session not found or does not belong to you', 404);
  }
  
  // Terminate the session - We can't directly do this in Supabase
  // In a real application, access to the Supabase auth.sessions table may be required
  // Here we're just updating our own user_sessions table as an example
  
  // First let's remove it from the database
  const { error: deleteError } = await supabase
    .from('user_sessions')
    .delete()
    .eq('session_id', validatedData.sessionId);
  
  if (deleteError) {
    throw new ApiError(ApiErrorCode.INTERNAL_SERVER_ERROR, 'Failed to terminate session', 500);
  }
  
  // In a real application, the auth.signOut API could be used here
  // to invalidate a specific session token
  
  return NextResponse.json({
    success: true,
    message: 'Session successfully terminated'
  });
}); 