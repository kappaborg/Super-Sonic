import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL veya Anonim Anahtar bulunamadı. Lütfen .env dosyasını kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server tarafı Supabase istemcisi oluşturur.
 * Kullanıcı oturumlarına erişim için server componentlerde kullanılır.
 */
export const createServerSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        persistSession: false,
      }
    }
  );
}; 