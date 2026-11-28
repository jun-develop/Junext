'use server';

import { revalidatePath } from 'next/cache';
import { type ActionError, toActionError, validationError } from '@/core/api/action-error';
import { unwrap } from '@/core/api/client';
import { z } from '@/core/validation';
import { type PermissionCode, requireSession } from '@/lib/auth/session';
import { jungo } from '@/lib/jungo';
import { createUserSchema, updateUserSchema, type UserFormValues } from './schemas';

export type UserFormState =
  | { status: 'error'; error: ActionError; values: UserFormValues }
  | { status: 'success'; uuid: string }
  | null;
export type DeleteUserResult = { status: 'error'; error: ActionError } | { status: 'success' };

const uuidSchema = z.uuid();

const forbidden = (): ActionError => ({ reason: 'insufficient_permission', fieldErrors: {} });

async function hasPermission(permission: PermissionCode): Promise<boolean> {
  const session = await requireSession();
  return session.permissions.includes(permission);
}

// Passwords are never echoed back into the form.
function formValues(formData: FormData): UserFormValues {
  const values: UserFormValues = {};
  for (const key of ['first_name', 'last_name', 'email', 'phone_number', 'status'] as const) {
    const entry = formData.get(key);
    if (typeof entry === 'string') {
      values[key] = entry;
    }
  }
  return values;
}

// createUser creates a user from the create form.
//
// Flow: check permission -> validate input -> call Jungo -> revalidate list
export async function createUser(
  _previous: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const values = formValues(formData);
  if (!(await hasPermission('users:create'))) {
    return { status: 'error', error: forbidden(), values };
  }
  const parsed = createUserSchema.safeParse({ ...values, password: formData.get('password') });
  if (!parsed.success) {
    return { status: 'error', error: validationError(parsed.error), values };
  }

  try {
    const body = await unwrap(jungo.POST('/api/v1/users', { body: parsed.data }));
    revalidatePath('/users');
    return { status: 'success', uuid: body.data.uuid };
  } catch (error) {
    return { status: 'error', error: toActionError(error), values };
  }
}

// updateUser saves the edit form of one user.
//
// Flow: check permission -> validate input -> call Jungo -> revalidate list and detail
export async function updateUser(
  uuid: string,
  _previous: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const values = formValues(formData);
  if (!(await hasPermission('users:update'))) {
    return { status: 'error', error: forbidden(), values };
  }
  const parsedUuid = uuidSchema.safeParse(uuid);
  if (!parsedUuid.success) {
    return { status: 'error', error: validationError(parsedUuid.error), values };
  }
  const parsed = updateUserSchema.safeParse(values);
  if (!parsed.success) {
    return { status: 'error', error: validationError(parsed.error), values };
  }

  try {
    await unwrap(
      jungo.PATCH('/api/v1/users/{uuid}', {
        params: { path: { uuid: parsedUuid.data } },
        body: parsed.data,
      }),
    );
    revalidatePath('/users', 'layout');
    return { status: 'success', uuid: parsedUuid.data };
  } catch (error) {
    return { status: 'error', error: toActionError(error), values };
  }
}

// deleteUser deletes one user after the confirmation dialog.
//
// Flow: check permission -> validate uuid -> call Jungo -> revalidate list
export async function deleteUser(uuid: string): Promise<DeleteUserResult> {
  if (!(await hasPermission('users:delete'))) {
    return { status: 'error', error: forbidden() };
  }
  const parsedUuid = uuidSchema.safeParse(uuid);
  if (!parsedUuid.success) {
    return { status: 'error', error: validationError(parsedUuid.error) };
  }

  try {
    await unwrap(
      jungo.DELETE('/api/v1/users/{uuid}', { params: { path: { uuid: parsedUuid.data } } }),
    );
    revalidatePath('/users', 'layout');
    return { status: 'success' };
  } catch (error) {
    return { status: 'error', error: toActionError(error) };
  }
}
