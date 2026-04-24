import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only initialize if we have valid-looking keys
const isConfigured = supabaseUrl && supabaseAnonKey && 
                    supabaseUrl !== 'your_supabase_url' && 
                    supabaseAnonKey !== 'your_supabase_anon_key';

if (!isConfigured) {
  console.warn('DevDown: Supabase credentials missing. App will run in Guest Mode (Local Storage only).');
}

// Create a dummy client if not configured to prevent crashes
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { 
      auth: { 
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => {},
        signInWithPassword: async () => ({ data: {}, error: new Error('Auth not configured') }),
        signUp: async () => ({ data: {}, error: new Error('Auth not configured') }),
      } 
    } as any;
