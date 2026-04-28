import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('[supabase-server] NEXT_PUBLIC_SUPABASE_URL is not set. DB operations will fail.');
}
if (!serviceRoleKey) {
  console.error('[supabase-server] SUPABASE_SERVICE_ROLE_KEY is not set — set this in Dokploy environment variables. Server-side DB operations will fail.');
}

// Server-side client with service role — bypasses RLS
// Only use in server actions, API routes, and server components
export const supabaseServer = createClient(supabaseUrl!, serviceRoleKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
