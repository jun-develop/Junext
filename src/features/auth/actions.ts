'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { type ActionError, toActionError, validationError } from '@/core/api/action-error';
import { unwrap } from '@/core/api/client';
import { ApiError } from '@/core/api/errors';
import { safeRedirectPath } from '@/core/redirect';
import { z } from '@/core/validation';
import {
  type TokenPair,
  clearSessionCookies,
  cookieNames,
  setDeviceCookie,
  setSessionCookies,
} from '@/lib/auth/cookies';
import { jungo } from '@/lib/jungo';

// Limits mirror Jungo's login request contract.
const signInSchema = z.object({
  email: z.email().max(150),
  password: z.string().min(1, 'validation.required').max(72),
  next: z.string().nullable(),
});

export type SignInState = { error: ActionError; email: string } | null;

// signIn exchanges email and password for a Jungo session kept in HttpOnly cookies.
//
// Flow: validate input -> ensure device id -> call Jungo login -> set session cookies -> redirect
export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') ?? '');
  const parsed = signInSchema.safeParse({
    email,
    password: formData.get('password'),
    next: formData.get('next'),
  });
  if (!parsed.success) {
    return { error: validationError(parsed.error), email };
  }

  const cookieStore = await cookies();
  const deviceId = cookieStore.get(cookieNames.device)?.value ?? crypto.randomUUID();
  setDeviceCookie(cookieStore, deviceId);

  let pair: TokenPair;
  try {
    const body = await unwrap(
      jungo.POST('/api/v1/auth/login', {
        body: { email: parsed.data.email, password: parsed.data.password },
        headers: { 'X-Device-ID': deviceId },
      }),
    );
    pair = body.data;
  } catch (error) {
    return { error: toActionError(error), email };
  }

  setSessionCookies(cookieStore, pair);
  redirect(safeRedirectPath(parsed.data.next) ?? '/dashboard');
}

// signOut ends the Jungo session and clears the cookies, even when Jungo cannot be reached.
//
// Flow: revoke Jungo session -> clear session cookies -> redirect to login
export async function signOut(): Promise<void> {
  try {
    await unwrap(jungo.POST('/api/v1/auth/logout'));
  } catch (error) {
    // Signing out locally must work when the token is already invalid or Jungo is down.
    if (!(error instanceof ApiError)) {
      throw error;
    }
  }
  clearSessionCookies(await cookies());
  redirect('/login');
}
