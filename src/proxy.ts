import { type NextRequest, NextResponse } from 'next/server';
import { clearSessionCookies, cookieNames, setSessionCookies } from '@/lib/auth/cookies';
import { refreshSession } from '@/lib/auth/refresh';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];

// proxy refreshes an expired access token before rendering and sends signed-out visitors to login.
// It is a convenience: pages and server actions still check the session themselves.
//
// Flow: read cookies -> pass public or redirect signed-out -> refresh missing access token -> forward new cookies
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const refreshToken = request.cookies.get(cookieNames.refresh)?.value;

  if (!refreshToken) {
    return isPublic ? NextResponse.next() : redirectToLogin(request, `${pathname}${search}`);
  }
  if (request.cookies.has(cookieNames.access)) {
    return NextResponse.next();
  }

  const pair = await refreshSession({
    refreshToken,
    deviceId: request.cookies.get(cookieNames.device)?.value,
    incoming: request.headers,
  });
  if (!pair) {
    const response = isPublic
      ? NextResponse.next()
      : redirectToLogin(request, `${pathname}${search}`);
    clearSessionCookies(response.cookies);
    return response;
  }

  // Rewrite the request cookies too, so this very render already sends the new access token.
  request.cookies.set(cookieNames.access, pair.access_token);
  request.cookies.set(cookieNames.refresh, pair.refresh_token);
  const response = NextResponse.next({ request: { headers: request.headers } });
  setSessionCookies(response.cookies, pair);
  return response;
}

function redirectToLogin(request: NextRequest, next: string): NextResponse {
  const url = new URL('/login', request.url);
  if (next !== '/') {
    url.searchParams.set('next', next);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
