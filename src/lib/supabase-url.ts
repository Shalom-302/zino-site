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
 * - HTTPS storage objects are routed through /api/img which adds long-lived cache headers,
 *   so the browser only downloads each file once per 30 days.
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

  if (!SUPABASE_ORIGIN || !url.startsWith(SUPABASE_ORIGIN)) return url;

  // HTTP origins → full transparent proxy (avoids mixed-content)
  if (SUPABASE_ORIGIN.startsWith('http://')) {
    return '/api/supabase-proxy' + url.slice(SUPABASE_ORIGIN.length);
  }

  // HTTPS storage objects → caching proxy (adds 30-day Cache-Control header)
  if (url.includes('/storage/v1/object/')) {
    return '/api/img?url=' + encodeURIComponent(url);
  }

  return url;
}
