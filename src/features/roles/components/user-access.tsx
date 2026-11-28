import { ShieldIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { listAllRoles } from '@/features/roles/data';
import { ALL_PERMISSIONS } from '@/features/roles/permissions';
import { PermissionList, RoleTypeBadge } from './role-badges';

// UserAccess shows a user's roles and the permissions they add up to; roles change in the user form.
type AssignedRole = { uuid: string; code: string; name: string; is_system: boolean };

export async function UserAccess({ assigned }: { assigned: readonly AssignedRole[] }) {
  const [t, roles] = await Promise.all([getTranslations('roles'), listAllRoles()]);
  // A user's roles come without their permissions, so they are read from the full role list.
  const assignedUuids = new Set(assigned.map((role) => role.uuid));
  const granted = ALL_PERMISSIONS.filter((permission) =>
    roles.some((role) => assignedUuids.has(role.uuid) && role.permissions.includes(permission)),
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('assigned_count', { count: assigned.length })}</CardDescription>
        </CardHeader>
        <CardContent>
          {assigned.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShieldIcon />
                </EmptyMedia>
                <EmptyTitle>{t('no_roles')}</EmptyTitle>
                <EmptyDescription>{t('no_roles_hint')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y rounded-lg border">
              {assigned.map((role) => (
                <li key={role.uuid} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/roles/${role.uuid}`}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {role.name}
                    </Link>
                    <p className="text-muted-foreground truncate font-mono text-xs">{role.code}</p>
                  </div>
                  <RoleTypeBadge isSystem={role.is_system} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('effective_permissions')}</CardTitle>
          <CardDescription>
            {t('effective_permissions_hint', {
              count: granted.length,
              total: ALL_PERMISSIONS.length,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionList permissions={granted} />
        </CardContent>
      </Card>
    </>
  );
}
