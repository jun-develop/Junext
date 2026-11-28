import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { unwrap } from '@/core/api/client';
import { ApiError } from '@/core/api/errors';
import { cookieNames } from '@/lib/auth/cookies';
import { jungo } from '@/lib/jungo';
import type { operations } from '@/lib/jungo-schema';

export type Session = operations['getMe']['responses'][200]['content']['application/json']['data'];

// /auth/me needs no permission, so 403 means the account itself is blocked: treat it as signed out.
const SIGNED_OUT_STATUSES = [401, 403];

async function loadSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  if (!cookieStore.has(cookieNames.access)) {
    return null;
  }
  try {
    const body = await unwrap(jungo.GET('/api/v1/auth/me'));
    return body.data;
  } catch (error) {
    if (error instanceof ApiError && SIGNED_OUT_STATUSES.includes(error.status)) {
      return null;
    }
    throw error;
  }
}

// getSession returns the signed-in user, asking Jungo once per request however many callers ask.
export const getSession = cache(loadSession);

// requireSession returns the signed-in user or sends the visitor to the login page.
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}
