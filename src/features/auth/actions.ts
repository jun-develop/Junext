'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  type ActionError,
  type ActionResult,
  toActionError,
  validationError,
} from '@/core/api/action-error';
import { unwrap } from '@/core/api/client';
import { ApiError } from '@/core/api/errors';
import { matchingPasswords, PASSWORD_MISMATCH, strongPassword } from '@/core/password';
import { avatarSchema, personName, phoneNumber } from '@/core/person';
import { safeRedirectPath } from '@/core/redirect';
import { z } from '@/core/validation';
import {
  type TokenPair,
  clearSessionCookies,
  cookieNames,
  setDeviceCookie,
  setSessionCookies,
} from '@/lib/auth/cookies';
import { requireSession } from '@/lib/auth/session';
import { avatarUpload, jungo } from '@/lib/jungo';

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

const forgotPasswordSchema = z.object({ email: z.email().max(150) });

export type ForgotPasswordState =
  { status: 'error'; error: ActionError; email: string } | { status: 'sent'; email: string } | null;

// requestPasswordReset asks Jungo to email a reset link. Jungo answers the same whether or not the
// account exists, so the page never reveals which emails are registered.
//
// Flow: validate input -> call Jungo forgot-password -> report the email as sent
export async function requestPasswordReset(
  _previous: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get('email') ?? '');
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { status: 'error', error: validationError(parsed.error), email };
  }
  try {
    await unwrap(jungo.POST('/api/v1/auth/forgot-password', { body: parsed.data }));
  } catch (error) {
    return { status: 'error', error: toActionError(error), email };
  }
  return { status: 'sent', email: parsed.data.email };
}

// Limits mirror Jungo's reset-password request contract.
const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'validation.required').max(128),
    password: strongPassword,
    confirm_password: z.string(),
  })
  .refine(matchingPasswords, PASSWORD_MISMATCH);

export type ResetPasswordState = { error: ActionError } | null;

// resetPassword sets a new password with the token from the reset email, then sends the user to
// sign in with it.
//
// Flow: validate input -> call Jungo reset-password -> redirect to login
export async function resetPassword(
  _previous: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  });
  if (!parsed.success) {
    return { error: validationError(parsed.error) };
  }
  try {
    await unwrap(
      jungo.POST('/api/v1/auth/reset-password', {
        body: { token: parsed.data.token, password: parsed.data.password },
      }),
    );
  } catch (error) {
    return { error: toActionError(error) };
  }
  redirect('/login?reset=done');
}

// The profile form: Jungo's PATCH /auth/me takes the same name and phone rules as a user update.
const profileSchema = z.object({
  first_name: personName,
  last_name: personName,
  phone_number: z.literal('').or(phoneNumber),
});

// A profile save can succeed while the avatar upload fails: the form then shows the warning.
export type ProfileFormState =
  { status: 'error'; error: ActionError } | { status: 'success'; warning: string | null } | null;

// updateProfile saves the signed-in user's own name, phone number and picture.
//
// Flow: validate input -> update profile -> upload or remove avatar -> refresh the shell
export async function updateProfile(
  _previous: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  // A blank phone number is sent as "", which clears it in Jungo.
  const parsed = profileSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    phone_number: formData.get('phone_number'),
  });
  if (!parsed.success) {
    return { status: 'error', error: validationError(parsed.error) };
  }
  const picked = formData.get('avatar');
  const avatar = picked instanceof File && picked.size > 0 ? picked : null;
  const avatarCheck = avatar ? avatarSchema.safeParse(avatar) : null;
  if (avatarCheck && !avatarCheck.success) {
    const message = avatarCheck.error.issues[0]?.message ?? 'validation.invalid';
    return {
      status: 'error',
      error: { reason: 'validation_error', fieldErrors: { avatar: message } },
    };
  }

  try {
    await unwrap(jungo.PATCH('/api/v1/auth/me', { body: parsed.data }));
  } catch (error) {
    return { status: 'error', error: toActionError(error) };
  }

  let warning: string | null = null;
  try {
    if (avatar) {
      await unwrap(jungo.POST('/api/v1/auth/me/avatar', avatarUpload(avatar)));
    } else if (formData.get('remove_avatar') === '1') {
      await unwrap(jungo.DELETE('/api/v1/auth/me/avatar'));
    }
  } catch (error) {
    warning = toActionError(error).reason;
  }
  // The sidebar and header show the name and picture too.
  revalidatePath('/', 'layout');
  return { status: 'success', warning };
}

// Limits mirror Jungo's change-password request contract.
const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'validation.required').max(72),
    password: strongPassword,
    confirm_password: z.string(),
  })
  .refine(matchingPasswords, PASSWORD_MISMATCH);

// Reasons that belong to one field, so the form shows them under it instead of on top.
const PASSWORD_FIELD_REASONS: Record<string, string> = {
  invalid_current_password: 'current_password',
  new_password_same_as_current: 'password',
};

export type ChangePasswordState =
  { status: 'error'; error: ActionError } | { status: 'success' } | null;

// changePassword sets a new password after checking the current one. Jungo signs out every other
// session and keeps this one.
//
// Flow: validate input -> call Jungo change-password -> map field errors
export async function changePassword(
  _previous: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const parsed = changePasswordSchema.safeParse({
    current_password: formData.get('current_password'),
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  });
  if (!parsed.success) {
    return { status: 'error', error: validationError(parsed.error) };
  }
  try {
    await unwrap(
      jungo.POST('/api/v1/auth/change-password', {
        body: {
          current_password: parsed.data.current_password,
          new_password: parsed.data.password,
        },
      }),
    );
  } catch (error) {
    const actionError = toActionError(error);
    const field = PASSWORD_FIELD_REASONS[actionError.reason];
    if (field) {
      return {
        status: 'error',
        error: { ...actionError, fieldErrors: { [field]: `api_errors.${actionError.reason}` } },
      };
    }
    return { status: 'error', error: actionError };
  }
  revalidatePath('/account');
  return { status: 'success' };
}

const familyUuidSchema = z.uuid();

// revokeSession ends one of the signed-in user's sessions. Ending the current one is a sign-out.
//
// Flow: validate input -> load session -> call Jungo revoke -> sign out or refresh the list
export async function revokeSession(familyUuid: string): Promise<ActionResult> {
  const parsed = familyUuidSchema.safeParse(familyUuid);
  if (!parsed.success) {
    return { status: 'error', error: validationError(parsed.error) };
  }
  // Whether it is the current session comes from Jungo, never from the browser.
  const { session } = await requireSession();
  try {
    await unwrap(
      jungo.DELETE('/api/v1/auth/sessions/{family_uuid}', {
        params: { path: { family_uuid: parsed.data } },
      }),
    );
  } catch (error) {
    // An already ended session is gone either way: the refreshed list shows it.
    revalidatePath('/account');
    return { status: 'error', error: toActionError(error) };
  }
  if (session.family_uuid === parsed.data) {
    clearSessionCookies(await cookies());
    redirect('/login');
  }
  revalidatePath('/account');
  return { status: 'success' };
}

// signOutOthers ends every session of the signed-in user except this one.
//
// Flow: call Jungo logout-others -> refresh the sessions list
export async function signOutOthers(): Promise<ActionResult> {
  try {
    await unwrap(jungo.POST('/api/v1/auth/logout-others'));
  } catch (error) {
    return { status: 'error', error: toActionError(error) };
  }
  revalidatePath('/account');
  return { status: 'success' };
}
