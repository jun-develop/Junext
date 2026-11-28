import 'server-only';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { unwrap } from '@/core/api/client';
import { ApiError } from '@/core/api/errors';
import { cookieNames } from '@/lib/auth/cookies';
import { jungo } from '@/lib/jungo';
import type { components, operations } from '@/lib/jungo-schema';

export type Session = operations['getMe']['responses'][200]['content']['application/json']['data'];
export type PermissionCode = components['schemas']['PermissionCode'];

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

// requirePermission returns the session when the user holds the permission; otherwise the page
// answers 404, so it does not reveal what exists. Jungo checks the permission again on every call.
export async function requirePermission(permission: PermissionCode): Promise<Session> {
  const session = await requireSession();
  if (!session.permissions.includes(permission)) {
    notFound();
  }
  return session;
}

// hasPermission tells a server action whether the signed-in user holds the permission.
export async function hasPermission(permission: PermissionCode): Promise<boolean> {
  const session = await requireSession();
  return session.permissions.includes(permission);
}
