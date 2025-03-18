/// <reference types="@supabase/supabase-js" />
// @deno-types="https://raw.githubusercontent.com/denoland/deno/main/cli/dts/lib.deno.d.ts"
import { createClient } from '@supabase/supabase-js';
import { serve } from 'http/server.ts';

interface RequestEvent {
  request: Request;
  method: string;
}

interface ErrorResponse {
  message: string;
  code?: string;
  details?: string;
  stack?: string;
  status?: number;
  timestamp?: string;
}

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Type declaration for Deno namespace
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

serve(async (req: Request) => {
  // Handle OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get environment variables with validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Calculate timestamps
    const now = Math.floor(Date.now() / 1000);
    const oneHourAgo = now - 3600; // 1 hour - 3600 seconds
    
    // Get count of records to be deleted
    const { count: recordsToDelete } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .lt('expire_at', oneHourAgo);
      
    // Delete expired rate limit records
    const { error: deleteError } = await supabase
      .from('rate_limits')
      .delete()
      .lt('expire_at', oneHourAgo);
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Get remaining records count
    const { count: remainingRecords } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true });
    
    // Return success response with details
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully cleaned up expired rate limit records',
        timestamp: new Date().toISOString(),
        metadata: {
          deletedRecords: recordsToDelete || 0,
          remainingRecords: remainingRecords || 0,
          cleanupThreshold: new Date(oneHourAgo * 1000).toISOString(),
          environment: Deno.env.get('SUPABASE_ENV') || 'unknown'
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error: unknown) {
    // Type guard for error handling
    const errorResponse: ErrorResponse = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      status: 500
    };

    if (error instanceof Error) {
      errorResponse.stack = error.stack;
      // Type assertion for Supabase error
      const supabaseError = error as { code?: string; details?: string; status?: number };
      if (supabaseError.code) errorResponse.code = supabaseError.code;
      if (supabaseError.details) errorResponse.details = supabaseError.details;
      if (supabaseError.status) errorResponse.status = supabaseError.status;
    }
    
    // Log error details
    console.error('Error cleaning up rate limits:', errorResponse);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: errorResponse,
        metadata: {
          environment: Deno.env.get('SUPABASE_ENV') || 'unknown'
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: errorResponse.status || 500,
      }
    );
  }
}); 