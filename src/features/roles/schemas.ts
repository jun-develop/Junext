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
export const roleListQuerySchema = z.object({ search: z.string().trim().max(100).catch('') });
