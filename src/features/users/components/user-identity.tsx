import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/features/users/data';

export function UserStatusBadge({ status }: { status: User['status'] }) {
  const t = useTranslations('users.status');
  const tone =
    status === 'active'
      ? 'border-success/40 bg-success/10 text-success'
      : 'border-border bg-muted text-muted-foreground';
  return (
    <Badge variant="outline" className={tone}>
      {t(status)}
    </Badge>
  );
}

// Badges list each role until this many, then "+n".
const MAX_LISTED_ROLES = 2;

export function UserRoleBadges({ roles }: { roles: User['roles'] }) {
  if (roles.length === 0) {
    return <span className="text-muted-foreground">{'—'}</span>;
  }
  const hidden = roles.length - MAX_LISTED_ROLES;
  return (
    <div className="flex flex-wrap gap-1">
      {roles.slice(0, MAX_LISTED_ROLES).map((role) => (
        <Badge key={role.uuid} variant={role.is_system ? 'secondary' : 'outline'}>
          {role.name}
        </Badge>
      ))}
      {hidden > 0 && (
        <Badge variant="outline" title={roles.map((role) => role.name).join(', ')}>
          {`+${hidden}`}
        </Badge>
      )}
    </div>
  );
}
