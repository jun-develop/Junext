import 'server-only';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { unwrap } from '@/core/api/client';
import { ApiError } from '@/core/api/errors';
import { jungo } from '@/lib/jungo';
import type { operations } from '@/lib/jungo-schema';
import type { UserListQuery } from './schemas';

export type User = operations['getUser']['responses'][200]['content']['application/json']['data'];
export type UserPage =
  operations['listUsers']['responses'][200]['content']['application/json']['data'];

// listUsers returns one page of users for the list query in the URL.
export async function listUsers(query: UserListQuery): Promise<UserPage> {
  const body = await unwrap(
    jungo.GET('/api/v1/users', {
      params: { query: { ...query, search: query.search || undefined } },
    }),
  );
  return body.data;
}

// getUser returns one user or renders the 404 page; a malformed uuid is also a 404.
export const getUser = cache(async (uuid: string): Promise<User> => {
  try {
    const body = await unwrap(jungo.GET('/api/v1/users/{uuid}', { params: { path: { uuid } } }));
    return body.data;
  } catch (error) {
    if (error instanceof ApiError && [400, 404, 422].includes(error.status)) {
      notFound();
    }
    throw error;
  }
});
