import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (envUrl && envAnonKey) {
  supabaseClient = createClient(envUrl, envAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Initializes Supabase client from server config if VITE_ variables are absent
 */
export async function initSupabase(): Promise<SupabaseClient | null> {
  if (supabaseClient) return supabaseClient;

  try {
    const res = await fetch('/api/auth/config');
    const json = await res.json();
    if (json?.data?.supabaseUrl && json?.data?.supabaseAnonKey) {
      supabaseClient = createClient(json.data.supabaseUrl, json.data.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseClient;
    }
  } catch (err) {
    console.warn('Could not dynamically load Supabase public auth config:', err);
  }

  return null;
}

export const getSupabase = (): SupabaseClient | null => {
  return supabaseClient;
};

export const supabase: SupabaseClient | null = supabaseClient;
