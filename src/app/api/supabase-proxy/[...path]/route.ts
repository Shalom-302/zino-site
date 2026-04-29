import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');

export const dynamic = 'force-dynamic';

async function proxyHandler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (!SUPABASE_URL) {
    return NextResponse.json({ error: 'Supabase URL not configured' }, { status: 500 });
  }

  const { path } = await params;
  const pathStr = path.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${SUPABASE_URL}/${pathStr}${search}`;

  // Forward all headers except host/content-length (Node recalculates them)
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!['host', 'content-length'].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
  });

  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    // Skip hop-by-hop headers that Node/Next manages internally
    const skip = ['content-encoding', 'transfer-encoding', 'connection', 'keep-alive'];
    if (!skip.includes(key.toLowerCase())) {
      resHeaders.set(key, value);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  });
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;
export const OPTIONS = proxyHandler;
