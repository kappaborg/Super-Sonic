import { withErrorHandling } from '@/lib/api-errors';
import { handleOptionsRequest, rateLimiter, validateRequest } from '@/lib/api-middleware';
import { registerRequestSchema } from '@/lib/models';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withErrorHandling(async (req: NextRequest) => {
  // Check CORS OPTIONS request
  const corsResponse = handleOptionsRequest(req);
  if (corsResponse) return corsResponse;

  // Apply rate limiting
  const rateLimitResponse = await rateLimiter(req, { limit: 5, windowMs: 60000 });
  if (rateLimitResponse) return rateLimitResponse;

  // Validate request body
  const { email, password, name, acceptTerms } = await validateRequest(req, registerRequestSchema);

  // Create user with Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'user',
        voice_enrolled: false
      }
    }
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Successful response
  return NextResponse.json({
    user: authData.user,
    session: authData.session,
    message: 'Registration successful. Please verify your email address.'
  });
}); 