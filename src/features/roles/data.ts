import 'server-only';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { unwrap } from '@/core/api/client';
import { ApiError } from '@/core/api/errors';
import { jungo } from '@/lib/jungo';
import type { operations } from '@/lib/jungo-schema';

export type Role = operations['getRole']['responses'][200]['content']['application/json']['data'];
export type UserRole =
  operations['listUserRoles']['responses'][200]['content']['application/json']['data'][number];

// listRoles returns every role; Jungo does not paginate roles.
export const listRoles = cache(async (): Promise<Role[]> => {
  const body = await unwrap(jungo.GET('/api/v1/roles'));
  return body.data;
});

// getRole returns one role or renders the 404 page; a malformed uuid is also a 404.
export const getRole = cache(async (uuid: string): Promise<Role> => {
  try {
    const body = await unwrap(jungo.GET('/api/v1/roles/{uuid}', { params: { path: { uuid } } }));
    return body.data;
  } catch (error) {
    if (error instanceof ApiError && [400, 404, 422].includes(error.status)) {
      notFound();
    }
    throw error;
  }
});

// listUserRoles returns the roles assigned to one user.
export async function listUserRoles(userUuid: string): Promise<UserRole[]> {
  const body = await unwrap(
    jungo.GET('/api/v1/users/{uuid}/roles', { params: { path: { uuid: userUuid } } }),
  );
  return body.data;
}
