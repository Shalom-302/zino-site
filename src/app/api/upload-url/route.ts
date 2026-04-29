import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'site-assets';
const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
];

export async function POST(request: NextRequest) {
  // ── Auth check ──────────────────────────────────────────────────────────
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const userClient = createClient(supabaseUrl, anonKey);
  const { data: { user }, error: authError } = await userClient.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ── End auth check ───────────────────────────────────────────────────────

  const { path, mimeType } = await request.json();

  if (!path || !mimeType) {
    return NextResponse.json({ error: 'Missing path or mimeType' }, { status: 400 });
  }

  if (!ALLOWED_MIME.includes(mimeType)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 415 });
  }

  const safePath = path.replace(/\.\.\//g, '').replace(/^\/+/, '');

  const { data, error } = await supabaseServer.storage
    .from(BUCKET)
    .createSignedUploadUrl(safePath);

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Failed to create upload URL' }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseServer.storage
    .from(BUCKET)
    .getPublicUrl(safePath);

  // Force HTTPS on the signed URL so the browser can call Supabase directly
  // without going through the /api/supabase-proxy (which is limited to 4.5 MB on Vercel).
  const httpsSignedUrl = data.signedUrl.replace(/^http:/, 'https:');
  const httpsPublicUrl = publicUrl.replace(/^http:/, 'https:');

  return NextResponse.json({ signedUrl: httpsSignedUrl, path: safePath, publicUrl: httpsPublicUrl });
}
