import { CheckIcon, MinusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { ALL_PERMISSIONS, groupPermissions } from '@/features/roles/permissions';
import type { PermissionCode } from '@/lib/auth/session';
import { cn } from '@/lib/utils';

export function RoleTypeBadge({ isSystem }: { isSystem: boolean }) {
  const t = useTranslations('roles');
  return (
    <Badge variant={isSystem ? 'secondary' : 'outline'}>
      {isSystem ? t('system') : t('custom')}
    </Badge>
  );
}

// PermissionList shows every permission grouped by resource, ticking the ones the role grants, so a
// reader also sees what the role cannot do.
export function PermissionList({ permissions }: { permissions: readonly PermissionCode[] }) {
  const t = useTranslations('roles');
  return (
    <div className="grid gap-4">
      {groupPermissions(ALL_PERMISSIONS).map((group) => {
        const grantedCount = group.permissions.filter((permission) =>
          permissions.includes(permission),
        ).length;
        return (
          <section key={group.resource} className="rounded-lg border">
            <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{t(`resources.${group.resource}`)}</h3>
                <p className="text-muted-foreground truncate text-xs">
                  {t(`resource_hints.${group.resource}`)}
                </p>
              </div>
              <Badge variant={grantedCount > 0 ? 'secondary' : 'outline'}>
                {grantedCount}/{group.permissions.length}
              </Badge>
            </div>
            <ul className="grid gap-x-6 gap-y-2.5 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.permissions.map((permission) => {
                const isGranted = permissions.includes(permission);
                const Icon = isGranted ? CheckIcon : MinusIcon;
                return (
                  <li
                    key={permission}
                    className={cn(
                      'flex items-center gap-2 text-sm',
                      !isGranted && 'text-muted-foreground',
                    )}
                  >
                    <Icon
                      className={cn('size-4 shrink-0', isGranted && 'text-success')}
                      aria-label={isGranted ? t('granted') : t('not_granted')}
                    />
                    {t(`permissions.${permission}`)}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
