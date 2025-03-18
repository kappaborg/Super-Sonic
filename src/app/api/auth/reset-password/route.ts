import { ApiError, ApiErrorCode } from '@/lib/errors';
import { handleOptionsRequest } from '@/lib/middleware/cors';
import { withErrorHandling } from '@/lib/middleware/error-handler';
import { rateLimiter } from '@/lib/middleware/rate-limiter';
import { validateRequest } from '@/lib/middleware/validate-request';
import createSupabaseServerClient from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define password reset request schema
const resetPasswordRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  token: z.string().optional(), // Password reset token (may or may not be present)
  password: z.string().optional().refine(
    (val) => !val || val.length >= 8,
    { message: 'Password must be at least 8 characters' }
  ),
  passwordConfirm: z.string().optional()
}).refine((data) => {
  // Two steps: (1) Only email or (2) token + password + passwordConfirm
  if (data.token) {
    return data.password && data.passwordConfirm && data.password === data.passwordConfirm;
  }
  return true;
}, {
  message: "Password and password confirmation must match",
  path: ["passwordConfirm"]
});

// CORS support for OPTIONS request
export const OPTIONS = handleOptionsRequest;

// POST request - send password reset link or change password
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiter: 3 requests / minute
  const rateLimiterMiddleware = rateLimiter({ limit: 3, windowInSeconds: 60 });
  await rateLimiterMiddleware(request);
  
  // Validate request
  const validatedData = await validateRequest(request, resetPasswordRequestSchema);
  
  // Create Supabase client
  const supabase = createSupabaseServerClient();
  
  // If only email is present, send password reset link
  if (!validatedData.token) {
    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/confirm`,
    });
    
    if (error) {
      throw new ApiError(ApiErrorCode.AUTH_ERROR, 'Failed to send password reset link', 400);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password reset link has been sent to your email address' 
    });
  }
  
  // If token, password and password confirmation are present, change password
  if (validatedData.token && validatedData.password) {
    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    });
    
    if (error) {
      throw new ApiError(ApiErrorCode.AUTH_ERROR, 'Failed to update password', 400);
    }
    
    // End all sessions (except current)
    await supabase.auth.signOut({ scope: 'others' });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Your password has been successfully updated' 
    });
  }
  
  throw new ApiError(ApiErrorCode.VALIDATION_ERROR, 'Invalid request', 400);
});

// PUT request - update password (requires current session)
export const PUT = withErrorHandling(async (request: NextRequest) => {
  // Rate limiter: 3 requests / minute
  const rateLimiterMiddleware = rateLimiter({ limit: 3, windowInSeconds: 60 });
  await rateLimiterMiddleware(request);
  
  // Validate request
  const data = await request.json();
  const { currentPassword, newPassword, newPasswordConfirm } = data;
  
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    throw new ApiError(ApiErrorCode.VALIDATION_ERROR, 'All fields are required', 400);
  }
  
  if (newPassword.length < 8) {
    throw new ApiError(ApiErrorCode.VALIDATION_ERROR, 'Password must be at least 8 characters', 400);
  }
  
  if (newPassword !== newPasswordConfirm) {
    throw new ApiError(ApiErrorCode.VALIDATION_ERROR, 'Passwords do not match', 400);
  }
  
  // Create Supabase client
  const supabase = createSupabaseServerClient();
  
  // Check user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new ApiError(ApiErrorCode.AUTH_ERROR, 'You need to be logged in', 401);
  }
  
  // Verify by signing in with current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: session.user.email!,
    password: currentPassword,
  });
  
  if (signInError) {
    throw new ApiError(ApiErrorCode.AUTH_ERROR, 'Current password is incorrect', 400);
  }
  
  // Change password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    throw new ApiError(ApiErrorCode.AUTH_ERROR, 'Failed to update password', 400);
  }
  
  // End all other sessions
  await supabase.auth.signOut({ scope: 'others' });
  
  return NextResponse.json({ 
    success: true, 
    message: 'Your password has been successfully updated' 
  });
}); 