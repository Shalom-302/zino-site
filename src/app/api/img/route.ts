import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_ORIGIN = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');

// 30-day cache for immutable storage objects
const CACHE_MAX_AGE = 60 * 60 * 24 * 30; // 2592000 seconds

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Only allow proxying URLs from the configured Supabase instance
  if (!SUPABASE_ORIGIN || !url.startsWith(SUPABASE_ORIGIN)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Only proxy storage objects (public files)
  if (!url.includes('/storage/v1/object/')) {
    return new NextResponse('Only storage objects can be proxied', { status: 403 });
  }

  try {
    const upstream = await fetch(url, {
      // Don't cache server-side — let browser cache be the single source of truth
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return new NextResponse('Upstream error', { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, immutable`,
      'Access-Control-Allow-Origin': '*',
    };
    if (contentLength) headers['Content-Length'] = contentLength;

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch {
    return new NextResponse('Proxy error', { status: 502 });
  }
}
