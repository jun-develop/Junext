import { z } from '@/core/validation';
import { ALL_PERMISSIONS } from './permissions';

// Limits and the code pattern mirror Jungo's createRole contract (OpenAPI).
const ROLE_CODE_PATTERN = /^[a-z_]+$/;
const name = z.string().trim().min(2).max(100);
const permissions = z.array(z.enum(ALL_PERMISSIONS)).max(ALL_PERMISSIONS.length);

export const createRoleSchema = z.object({
  name,
  code: z.string().trim().min(2).max(50).regex(ROLE_CODE_PATTERN, 'roles.code_rule'),
  permissions,
});

export const updateRoleSchema = z.object({ name, permissions });

export type RoleFormValues = { name?: string; code?: string; permissions?: string[] };

// Jungo returns every role at once, so the list filters in memory.
export const PAGE_SIZES = [10, 20, 30, 40, 50] as const;
export const ROLE_SORT_FIELDS = ['created_at', 'name', 'code', 'user_count'] as const;

export const roleListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  page_size: z.coerce
    .number()
    .pipe(z.union(PAGE_SIZES.map((size) => z.literal(size))))
    .catch(PAGE_SIZES[0]),
  search: z.string().trim().max(100).catch(''),
  sort_by: z.enum(ROLE_SORT_FIELDS).catch('created_at'),
  sort_order: z.enum(['asc', 'desc']).catch('desc'),
});

export type RoleListQuery = z.infer<typeof roleListQuerySchema>;
