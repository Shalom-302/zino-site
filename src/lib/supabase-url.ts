const SUPABASE_ORIGIN = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');

// Legacy origins whose URLs may be stored in the database — rewrite them to the current origin.
const LEGACY_ORIGINS = [
  'http://zfitspa-pre0225supabase-00fc42-187-124-218-132.traefik.me',
  'https://zfitspa-pre0225supabase-00fc42-187-124-218-132.traefik.me',
];

/**
 * Normalises a Supabase storage URL:
 * - Legacy traefik.me URLs are rewritten to the current SUPABASE_ORIGIN.
 * - HTTP origins (local dev without TLS) are proxied through same-domain to avoid mixed-content.
 * - HTTPS origins (e.g. api-supabase.zfitspa.com) are returned unchanged.
 */
export function proxyUrl(url: string | null | undefined): string {
  if (!url) return '';

  // Rewrite legacy traefik.me URLs to the current origin
  for (const legacy of LEGACY_ORIGINS) {
    if (url.startsWith(legacy)) {
      url = SUPABASE_ORIGIN + url.slice(legacy.length);
      break;
    }
  }

  // Only proxy HTTP origins — HTTPS origins are served directly (no mixed-content issue).
  if (SUPABASE_ORIGIN.startsWith('http://') && url.startsWith(SUPABASE_ORIGIN)) {
    return '/api/supabase-proxy' + url.slice(SUPABASE_ORIGIN.length);
  }

  return url;
}
