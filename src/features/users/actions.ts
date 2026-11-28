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
import { avatarSchema, createUserSchema, updateUserSchema } from './schemas';

// A save can succeed while a follow-up (roles, status, avatar) fails: the user exists, so the form
// moves on and shows the warning.
export type UserFormState =
  | { status: 'error'; error: ActionError }
  | { status: 'success'; uuid: string; warning: string | null }
  | null;

type FollowUps = {
  status?: 'active' | 'inactive';
  roleUuids?: string[];
  avatar?: File;
  removeAvatar: boolean;
};

const uuidSchema = z.uuid();

// readUserForm collects the submitted fields. Roles count only when the form rendered the role
// picker (assign_roles), so an untouched form never clears roles by accident.
function readUserForm(formData: FormData) {
  const text = (key: string) => {
    const entry = formData.get(key);
    return typeof entry === 'string' ? entry : undefined;
  };
  const avatar = formData.get('avatar');
  return {
    fields: {
      first_name: text('first_name'),
      last_name: text('last_name'),
      email: text('email'),
      password: text('password'),
      confirm_password: text('confirm_password'),
      phone_number: text('phone_number'),
      status: text('status'),
      role_uuids: formData.has('assign_roles') ? formData.getAll('role_uuids') : undefined,
    },
    avatar: avatar instanceof File && avatar.size > 0 ? avatar : undefined,
    removeAvatar: formData.get('remove_avatar') === '1',
  };
}

function parseAvatar(avatar: File | undefined): ActionError | null {
  if (!avatar) {
    return null;
  }
  const parsed = avatarSchema.safeParse(avatar);
  return parsed.success ? null : prefixPath(validationError(parsed.error), 'avatar');
}

function prefixPath(error: ActionError, field: string): ActionError {
  const message = Object.values(error.fieldErrors)[0];
  return message ? { ...error, fieldErrors: { [field]: message } } : error;
}

// applyFollowUps runs the calls Jungo keeps apart from create/update; it returns the first failure.
async function applyFollowUps(uuid: string, followUps: FollowUps): Promise<ActionError | null> {
  const path = { uuid };
  try {
    if (followUps.status) {
      await unwrap(
        jungo.PATCH('/api/v1/users/{uuid}', {
          params: { path },
          body: { status: followUps.status },
        }),
      );
    }
    if (followUps.roleUuids && (await hasPermission('roles:assign'))) {
      await unwrap(
        jungo.PUT('/api/v1/users/{uuid}/roles', {
          params: { path },
          body: { role_uuids: followUps.roleUuids },
        }),
      );
    }
    if (followUps.avatar) {
      const avatar = followUps.avatar;
      await unwrap(
        jungo.POST('/api/v1/users/{uuid}/avatar', {
          params: { path },
          // The serializer sends the real file; the typed body only names it.
          body: { avatar: avatar.name },
          bodySerializer: () => {
            const multipart = new FormData();
            multipart.append('avatar', avatar);
            return multipart;
          },
        }),
      );
    } else if (followUps.removeAvatar) {
      await unwrap(jungo.DELETE('/api/v1/users/{uuid}/avatar', { params: { path } }));
    }
    return null;
  } catch (error) {
    return toActionError(error);
  }
}

// createUser creates a user, then applies status, roles and avatar, which Jungo sets separately.
//
// Flow: check permission -> validate input -> create user -> apply follow-ups -> revalidate list
export async function createUser(
  _previous: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  if (!(await hasPermission('users:create'))) {
    return { status: 'error', error: forbiddenError() };
  }
  const { fields, avatar, removeAvatar } = readUserForm(formData);
  const parsed = createUserSchema.safeParse(fields);
  if (!parsed.success) {
    return { status: 'error', error: validationError(parsed.error) };
  }
  const avatarError = parseAvatar(avatar);
  if (avatarError) {
    return { status: 'error', error: avatarError };
  }

  const { first_name, last_name, email, password, phone_number } = parsed.data;
  let uuid: string;
  try {
    const body = await unwrap(
      jungo.POST('/api/v1/users', {
        body: { first_name, last_name, email, password, phone_number },
      }),
    );
    uuid = body.data.uuid;
  } catch (error) {
    return { status: 'error', error: toActionError(error) };
  }

  const followUpError = await applyFollowUps(uuid, {
    status: parsed.data.status === 'inactive' ? 'inactive' : undefined,
    roleUuids: parsed.data.role_uuids,
    avatar,
    removeAvatar,
  });
  revalidatePath('/users', 'layout');
  return { status: 'success', uuid, warning: followUpError?.reason ?? null };
}

// updateUser saves the edit form of one user, then its roles and avatar.
//
// Flow: check permission -> validate input -> update user -> apply follow-ups -> revalidate
export async function updateUser(
  uuid: string,
  _previous: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  if (!(await hasPermission('users:update'))) {
    return { status: 'error', error: forbiddenError() };
  }
  const parsedUuid = uuidSchema.safeParse(uuid);
  if (!parsedUuid.success) {
    return { status: 'error', error: validationError(parsedUuid.error) };
  }
  const { fields, avatar, removeAvatar } = readUserForm(formData);
  const parsed = updateUserSchema.safeParse(fields);
  if (!parsed.success) {
    return { status: 'error', error: validationError(parsed.error) };
  }
  const avatarError = parseAvatar(avatar);
  if (avatarError) {
    return { status: 'error', error: avatarError };
  }

  const { role_uuids, ...profile } = parsed.data;
  try {
    await unwrap(
      jungo.PATCH('/api/v1/users/{uuid}', {
        params: { path: { uuid: parsedUuid.data } },
        body: profile,
      }),
    );
  } catch (error) {
    return { status: 'error', error: toActionError(error) };
  }

  const followUpError = await applyFollowUps(parsedUuid.data, {
    roleUuids: role_uuids,
    avatar,
    removeAvatar,
  });
  revalidatePath('/users', 'layout');
  revalidatePath('/roles', 'layout');
  return { status: 'success', uuid: parsedUuid.data, warning: followUpError?.reason ?? null };
}

// deleteUser deletes one user after the confirmation dialog.
//
// Flow: check permission -> validate uuid -> call Jungo -> revalidate list
export async function deleteUser(uuid: string): Promise<ActionResult> {
  if (!(await hasPermission('users:delete'))) {
    return { status: 'error', error: forbiddenError() };
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
