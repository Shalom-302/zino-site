import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PROTECTED_PREFIX = '/td-chef';
const LOGIN_PATH = '/td-chef/login';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /td-chef/* routes (excluding the login page itself)
  if (!pathname.startsWith(PROTECTED_PREFIX) || pathname === LOGIN_PATH) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Read the Supabase auth token from cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/);
  const accessToken = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

  if (!accessToken) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  try {
    const supabase = createClient(supabaseUrl, anonKey);
    // Parse the stored session JSON (Supabase stores it as JSON in the cookie)
    const session = JSON.parse(accessToken);
    const token = session?.access_token ?? accessToken;

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }
  } catch {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/td-chef/:path*'],
};
