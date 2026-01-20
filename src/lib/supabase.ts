import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ccjdctnmgrweserduxhi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjamRjdG5tZ3J3ZXNlcmR1eGhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MTc2NjcsImV4cCI6MjA1MjE5MzY2N30.8VLEu4lDAenCKLVEWwCF1G9PuLNnIbDKUiQJlIIL5yg';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. Using fallback credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env for production.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getAuthToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};

export const WRAPPERS_URL = `${supabaseUrl || 'https://ccjdctnmgrweserduxhi.supabase.co'}/functions/v1/wrappers`;
