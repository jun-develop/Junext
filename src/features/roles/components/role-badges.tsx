import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { groupPermissions } from '@/features/roles/permissions';
import type { PermissionCode } from '@/lib/auth/session';

export function RoleTypeBadge({ isSystem }: { isSystem: boolean }) {
  const t = useTranslations('roles');
  return (
    <Badge variant={isSystem ? 'secondary' : 'outline'}>
      {isSystem ? t('system') : t('custom')}
    </Badge>
  );
}

// PermissionList shows granted permissions grouped by resource, read-only.
export function PermissionList({ permissions }: { permissions: readonly PermissionCode[] }) {
  const t = useTranslations('roles');
  const groups = groupPermissions(permissions);
  if (groups.length === 0) {
    return <p className="text-muted-foreground text-sm">{t('no_permissions')}</p>;
  }
  return (
    <dl className="divide-y">
      {groups.map((group) => (
        <div key={group.resource} className="grid gap-2 py-3 sm:grid-cols-3">
          <dt className="text-muted-foreground text-sm">{t(`resources.${group.resource}`)}</dt>
          <dd className="flex flex-wrap gap-1.5 sm:col-span-2">
            {group.permissions.map((permission) => (
              <Badge key={permission} variant="outline">
                {t(`permissions.${permission}`)}
              </Badge>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
