import 'server-only';
import { env } from '@/core/env';
import type { operations } from '@/lib/jungo-schema';

export type TokenPair =
  operations['refreshToken']['responses'][200]['content']['application/json']['data'];

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
};

// Matches both `cookies()` from next/headers and `NextResponse.cookies`.
type CookieWriter = { set(name: string, value: string, options: CookieOptions): unknown };

// The __Host- prefix makes browsers reject the cookie unless it is Secure, host-only and Path=/.
const prefix = env.COOKIE_SECURE ? '__Host-' : '';

export const cookieNames = {
  access: `${prefix}jx_at`,
  refresh: `${prefix}jx_rt`,
  device: `${prefix}jx_did`,
};

// The access cookie expires before Jungo would reject the token, so the proxy refreshes ahead of time.
const ACCESS_EXPIRY_MARGIN_SECONDS = 30;
const DEVICE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

function cookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

export function setSessionCookies(store: CookieWriter, pair: TokenPair): void {
  const accessMaxAge = Math.max(pair.expires_in - ACCESS_EXPIRY_MARGIN_SECONDS, 0);
  store.set(cookieNames.access, pair.access_token, cookieOptions(accessMaxAge));
  store.set(cookieNames.refresh, pair.refresh_token, cookieOptions(pair.refresh_expires_in));
}

// clearSessionCookies expires both tokens with the original attributes: delete() omits Secure,
// so browsers would ignore it for __Host- cookies.
export function clearSessionCookies(store: CookieWriter): void {
  store.set(cookieNames.access, '', cookieOptions(0));
  store.set(cookieNames.refresh, '', cookieOptions(0));
}

export function setDeviceCookie(store: CookieWriter, deviceId: string): void {
  store.set(cookieNames.device, deviceId, cookieOptions(DEVICE_MAX_AGE_SECONDS));
}
