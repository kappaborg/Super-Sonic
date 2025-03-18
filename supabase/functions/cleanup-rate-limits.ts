// Supabase Edge Function for cleaning up expired rate limit records
// Should be deployed in the "Edge Functions" section of the Supabase Dashboard
// Recommended to run once per hour via cron trigger

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// CORS headers for cross-origin requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
        
        // Create Supabase client with service role
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
        const { data, error } = await supabase
            .from('rate_limits')
            .delete()
            .lt('expire_at', oneHourAgo);
        
        if (error) {
            throw error;
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
    } catch (error) {
        // Log error details
        console.error('Error cleaning up rate limits:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        // Return error response
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
                metadata: {
                    errorCode: error.code,
                    errorDetails: error.details,
                    environment: Deno.env.get('SUPABASE_ENV') || 'unknown'
                }
            }),
            {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
                status: error.status || 500,
            }
        );
    }
}); 