import { describe, expect, expectTypeOf, it } from 'vitest';
import type { PermissionCode } from '@/lib/auth/session';
import { ALL_PERMISSIONS, groupPermissions } from './permissions';

describe('permissions', () => {
  it('lists every Jungo permission', () => {
    expectTypeOf<
      Exclude<PermissionCode, (typeof ALL_PERMISSIONS)[number]>
    >().toEqualTypeOf<never>();
    expect(new Set(ALL_PERMISSIONS).size).toBe(ALL_PERMISSIONS.length);
  });

  it('groups by resource in display order', () => {
    expect(
      groupPermissions(['roles:assign', 'audit_logs:read', 'users:delete', 'roles:read']),
    ).toEqual([
      { resource: 'users', permissions: ['users:delete'] },
      { resource: 'roles', permissions: ['roles:read', 'roles:assign'] },
      { resource: 'audit_logs', permissions: ['audit_logs:read'] },
    ]);
  });
});
