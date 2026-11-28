'use server';

import { revalidatePath } from 'next/cache';
import {
  type ActionError,
  type ActionResult,
  forbiddenError,
  toActionError,
  validationError,
} from '@/core/api/action-error';
import { unwrap } from '@/core/api/client';
import { z } from '@/core/validation';
import { hasPermission } from '@/lib/auth/session';
import { jungo } from '@/lib/jungo';
import { createRoleSchema, type RoleFormValues, updateRoleSchema } from './schemas';

export type RoleFormState =
  { status: 'error'; error: ActionError } | { status: 'success'; uuid: string } | null;

const uuidSchema = z.uuid();

function formValues(formData: FormData): RoleFormValues {
  const text = (key: string) => {
    const entry = formData.get(key);
    return typeof entry === 'string' ? entry : undefined;
  };
  return {
    name: text('name'),
    code: text('code'),
    permissions: formData.getAll('permissions').filter((entry) => typeof entry === 'string'),
  };
}

// createRole creates a role with its permissions; Jungo rejects permissions the user does not hold.
//
// Flow: check permission -> validate input -> call Jungo -> revalidate list
export async function createRole(
  _previous: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  if (!(await hasPermission('roles:create'))) {
    return { status: 'error', error: forbiddenError() };
  }
  const parsed = createRoleSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { status: 'error', error: validationError(parsed.error) };
  }

  try {
    const body = await unwrap(jungo.POST('/api/v1/roles', { body: parsed.data }));
    revalidatePath('/roles', 'layout');
    return { status: 'success', uuid: body.data.uuid };
  } catch (error) {
    return { status: 'error', error: toActionError(error) };
  }
}

// updateRole renames a role and replaces its permissions; Jungo has one endpoint for each.
//
// Flow: check permission -> validate input -> rename -> replace permissions -> revalidate
export async function updateRole(
  uuid: string,
  _previous: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  if (!(await hasPermission('roles:update'))) {
    return { status: 'error', error: forbiddenError() };
  }
  const parsedUuid = uuidSchema.safeParse(uuid);
  if (!parsedUuid.success) {
    return { status: 'error', error: validationError(parsedUuid.error) };
  }
  const parsed = updateRoleSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { status: 'error', error: validationError(parsed.error) };
  }

  const path = { uuid: parsedUuid.data };
  try {
    await unwrap(
      jungo.PATCH('/api/v1/roles/{uuid}', { params: { path }, body: { name: parsed.data.name } }),
    );
    await unwrap(
      jungo.PUT('/api/v1/roles/{uuid}/permissions', {
        params: { path },
        body: { permissions: parsed.data.permissions },
      }),
    );
    revalidatePath('/roles', 'layout');
    return { status: 'success', uuid: parsedUuid.data };
  } catch (error) {
    return { status: 'error', error: toActionError(error) };
  }
}

// deleteRole deletes a custom role after the confirmation dialog; system roles are refused by Jungo.
//
// Flow: check permission -> validate uuid -> call Jungo -> revalidate list
export async function deleteRole(uuid: string): Promise<ActionResult> {
  if (!(await hasPermission('roles:delete'))) {
    return { status: 'error', error: forbiddenError() };
  }
  const parsedUuid = uuidSchema.safeParse(uuid);
  if (!parsedUuid.success) {
    return { status: 'error', error: validationError(parsedUuid.error) };
  }

  try {
    await unwrap(
      jungo.DELETE('/api/v1/roles/{uuid}', { params: { path: { uuid: parsedUuid.data } } }),
    );
    revalidatePath('/roles', 'layout');
    return { status: 'success' };
  } catch (error) {
    return { status: 'error', error: toActionError(error) };
  }
}
