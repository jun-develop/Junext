import 'server-only';
import { cookies, headers } from 'next/headers';
import { createJungoClient } from '@/core/api/client';
import { env } from '@/core/env';
import { cookieNames } from '@/lib/auth/cookies';
import type { paths } from '@/lib/jungo-schema';

const clientOptions = { baseUrl: env.JUNGO_API_URL, timeoutMs: env.JUNGO_TIMEOUT_MS };

// forwardedHeaders passes the browser's IP and user agent on. Without them Jungo rate-limits,
// bans and records sessions per Next server instead of per user.
export function forwardedHeaders(incoming: Headers): Record<string, string> {
  const forwarded: Record<string, string> = {};
  const userAgent = incoming.get('user-agent');
  const forwardedFor = incoming.get('x-forwarded-for');
  if (userAgent) {
    forwarded['User-Agent'] = userAgent;
  }
  if (env.TRUST_PROXY_HEADERS && forwardedFor) {
    forwarded['X-Forwarded-For'] = forwardedFor;
  }
  return forwarded;
}

// jungoWithoutSession is for code outside a render or action (the proxy); callers add headers.
export const jungoWithoutSession = createJungoClient<paths>(clientOptions);

// jungo calls Jungo on behalf of the current request: browser IP, user agent and session token.
export const jungo = createJungoClient<paths>(clientOptions);

jungo.use({
  async onRequest({ request }) {
    const [cookieStore, incoming] = await Promise.all([cookies(), headers()]);
    for (const [name, value] of Object.entries(forwardedHeaders(incoming))) {
      request.headers.set(name, value);
    }
    const accessToken = cookieStore.get(cookieNames.access)?.value;
    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return request;
  },
});

// avatarUpload is the request body for Jungo's avatar endpoints. openapi-fetch types the multipart
// body as the file name; the serializer sends the real file under the "avatar" field.
export function avatarUpload(avatar: File): {
  body: { avatar: string };
  bodySerializer: () => FormData;
} {
  return {
    body: { avatar: avatar.name },
    bodySerializer: () => {
      const multipart = new FormData();
      multipart.append('avatar', avatar);
      return multipart;
    },
  };
}
