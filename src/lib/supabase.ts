import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    !supabaseUrl.includes('your-project-id')
  );
};

// Fallback dummy client if credentials are not configured yet to prevent app crashes
const dummyUrl = 'https://placeholder.supabase.co';
const dummyKey = 'placeholder-key';

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : dummyUrl,
  isSupabaseConfigured() ? supabaseAnonKey : dummyKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
