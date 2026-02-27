import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not set. Running in local-only mode.\n' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to enable cloud sync.'
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder'
);

/** true when valid Supabase env vars are configured */
export const isSupabaseConfigured =
  !!supabaseUrl && !!supabaseAnonKey && !supabaseUrl.includes('placeholder');
