import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/features/users/data';

type UserProps = { user: Pick<User, 'first_name' | 'last_name' | 'email' | 'avatar_url'> };

export function UserIdentity({ user, size = 'sm' }: UserProps & { size?: 'sm' | 'lg' }) {
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  const isLarge = size === 'lg';
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className={isLarge ? 'size-14' : 'size-9'}>
        {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 leading-tight">
        <span className={isLarge ? 'truncate text-lg font-semibold' : 'truncate font-medium'}>
          {user.first_name} {user.last_name}
        </span>
        <span className="text-muted-foreground truncate text-sm">{user.email}</span>
      </div>
    </div>
  );
}

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
