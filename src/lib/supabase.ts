import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Only proxy through same-domain when Supabase is HTTP (self-hosted without TLS).
// When Supabase is already on HTTPS (e.g. api-supabase.zfitspa.com), use it directly.
const supabaseUrl =
  typeof window !== 'undefined' && rawUrl.startsWith('http://')
    ? `${window.location.origin}/api/supabase-proxy`
    : rawUrl;

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Fixed storage key so it stays consistent regardless of the proxy URL used
    storageKey: 'sb-zfitspa-auth-token',
  },
});
