'use client';

import { createClient } from '@supabase/supabase-js';

// Supabase client for browser/client-side usage
export const createSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

// Singleton instance for client components
let browserClient: ReturnType<typeof createSupabaseBrowserClient>;

// Function to get or create browser client instance
export const getSupabaseBrowser = () => {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createSupabaseBrowserClient();
  return browserClient;
};

// Export a default instance
export default getSupabaseBrowser(); 