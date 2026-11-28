import 'server-only';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { unwrap } from '@/core/api/client';
import { ApiError } from '@/core/api/errors';
import { jungo } from '@/lib/jungo';
import type { operations } from '@/lib/jungo-schema';
import type { RoleListQuery } from './schemas';

export type Role = operations['getRole']['responses'][200]['content']['application/json']['data'];
export type RolePage =
  operations['listRoles']['responses'][200]['content']['application/json']['data'];

// Jungo's page_size limit; listAllRoles reads this many roles per request.
const ALL_ROLES_PAGE_SIZE = 100;

// listRoles returns one page of roles for the list query in the URL.
export async function listRoles(query: RoleListQuery): Promise<RolePage> {
  const body = await unwrap(
    jungo.GET('/api/v1/roles', {
      params: { query: { ...query, search: query.search || undefined } },
    }),
  );
  return body.data;
}

// listAllRoles returns every role, for pickers and filters, following the pages Jungo hands back.
export const listAllRoles = cache(async (): Promise<Role[]> => {
  const roles: Role[] = [];
  for (let page = 1; ; page += 1) {
    const body = await unwrap(
      jungo.GET('/api/v1/roles', {
        params: {
          query: { page, page_size: ALL_ROLES_PAGE_SIZE, sort_by: 'name', sort_order: 'asc' },
        },
      }),
    );
    roles.push(...body.data.items);
    if (!body.data.pagination.has_next) {
      return roles;
    }
  }
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
