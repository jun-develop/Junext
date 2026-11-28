import { HistoryIcon, PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { getFormatter, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { RowActions } from '@/components/row-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserAccess } from '@/features/roles/components/user-access';
import { deleteUser } from '@/features/users/actions';
import { UserStatusBadge } from '@/features/users/components/user-identity';
import { getUser } from '@/features/users/data';
import { requirePermission } from '@/lib/auth/session';

export default async function UserPage({ params }: PageProps<'/users/[uuid]'>) {
  const { uuid } = await params;
  const session = await requirePermission('users:read');
  const [user, t, format] = await Promise.all([
    getUser(uuid),
    getTranslations('users'),
    getFormatter(),
  ]);
  const canUpdate = session.permissions.includes('users:update');
  const formatDate = (value: string | null) =>
    value ? format.dateTime(new Date(value), { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const canReadRoles = session.permissions.includes('roles:read');
  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  const details = [
    { label: t('fields.phone_number'), value: user.phone_number ?? '—' },
    { label: t('columns.created_at'), value: formatDate(user.created_at) },
    { label: t('updated_at'), value: formatDate(user.updated_at) },
  ];

  return (
    <>
      <PageHeader
        back={{ href: '/users', label: t('back_to_list') }}
        title={fullName}
        description={user.email}
        actions={
          <>
            {session.permissions.includes('audit_logs:read') && (
              <Button variant="outline" asChild>
                <Link href={`/audit-logs?entity_type=users&entity_id=${user.uuid}`}>
                  <HistoryIcon />
                  {t('activity')}
                </Link>
              </Button>
            )}
            {canUpdate && (
              <Button variant="outline" asChild>
                <Link href={`/users/${user.uuid}/edit`}>
                  <PencilIcon />
                  {t('edit')}
                </Link>
              </Button>
            )}
            {session.permissions.includes('users:delete') && (
              <RowActions
                onDelete={{
                  action: deleteUser.bind(null, user.uuid),
                  title: t('delete_title'),
                  description: t('delete_description', { email: user.email }),
                  successMessage: t('deleted'),
                  redirectTo: '/users',
                }}
              />
            )}
          </>
        }
      />
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className={canReadRoles ? undefined : 'lg:col-span-3'}>
          <CardContent className="gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar className="size-20">
                {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <p className="truncate text-lg font-semibold">{fullName}</p>
                <p className="text-muted-foreground truncate text-sm">{user.email}</p>
              </div>
              <UserStatusBadge status={user.status} />
            </div>
            <Separator />
            <dl className="divide-y">
              {details.map((detail) => (
                <div key={detail.label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-muted-foreground text-sm">{detail.label}</dt>
                  <dd className="text-right text-sm">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        {canReadRoles && (
          <div className="grid gap-4 lg:col-span-2">
            <UserAccess assigned={user.roles} />
          </div>
        )}
      </div>
    </>
  );
}
