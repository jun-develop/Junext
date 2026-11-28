import type { PermissionCode } from '@/lib/auth/session';

// Every Jungo permission, in display order. permissions.test.ts fails to compile when Jungo adds one
// that is missing here, so the picker never silently hides a permission.
export const ALL_PERMISSIONS = [
  'users:read',
  'users:create',
  'users:update',
  'users:delete',
  'roles:read',
  'roles:create',
  'roles:update',
  'roles:delete',
  'roles:assign',
  'audit_logs:read',
] as const satisfies readonly PermissionCode[];

export type PermissionResource = PermissionCode extends `${infer Resource}:${string}`
  ? Resource
  : never;

export function permissionResource(permission: PermissionCode): PermissionResource {
  // Safe: every PermissionCode is "<resource>:<action>", which is how PermissionResource is derived.
  return permission.slice(0, permission.indexOf(':')) as PermissionResource;
}

// groupPermissions splits permissions by resource, keeping the order of ALL_PERMISSIONS.
export function groupPermissions(
  permissions: readonly PermissionCode[],
): { resource: PermissionResource; permissions: PermissionCode[] }[] {
  const groups = new Map<PermissionResource, PermissionCode[]>();
  for (const permission of ALL_PERMISSIONS) {
    if (!permissions.includes(permission)) {
      continue;
    }
    const resource = permissionResource(permission);
    groups.set(resource, [...(groups.get(resource) ?? []), permission]);
  }
  return [...groups].map(([resource, grouped]) => ({ resource, permissions: grouped }));
}
