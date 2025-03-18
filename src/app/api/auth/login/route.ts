import { handleOptionsRequest } from '@/lib/middleware/cors';
import { withErrorHandling } from '@/lib/middleware/error-handler';
import { rateLimiter } from '@/lib/middleware/rate-limiter';
import { validateRequest } from '@/lib/middleware/validation';
import { loginRequestSchema } from '@/lib/models';
import createSupabaseServerClient from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// OPTIONS request handler for CORS
export async function OPTIONS(req: NextRequest) {
  return handleOptionsRequest(req);
}

// Login route
export const POST = withErrorHandling(async (req: NextRequest) => {
  // Handle options request for CORS
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(req);
  }

  // Rate limit requests (10 req/min)
  await rateLimiter({ limit: 10, windowInSeconds: 60 })(req);

  // Validate request body
  const { data } = await validateRequest(req, loginRequestSchema);
  
  // Create Supabase client
  const supabase = createSupabaseServerClient();
  
  // Sign in with email/password
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    // Login error
    return NextResponse.json(
      { 
        success: false, 
        message: error.message
      },
      { status: error.status || 400 }
    );
  }

  // Successful login
  return NextResponse.json({
    success: true,
    user: authData.user,
    session: authData.session
  });
}); 