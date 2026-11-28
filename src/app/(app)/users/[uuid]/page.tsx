import { PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserActions } from '@/features/users/components/user-actions';
import { UserIdentity, UserStatusBadge } from '@/features/users/components/user-identity';
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
  const details = [
    { label: t('fields.email'), value: user.email },
    { label: t('fields.phone_number'), value: user.phone_number ?? '—' },
    { label: t('columns.created_at'), value: formatDate(user.created_at) },
    { label: t('updated_at'), value: formatDate(user.updated_at) },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserIdentity user={user} size="lg" />
          <UserStatusBadge status={user.status} />
        </div>
        <div className="flex items-center gap-2">
          {canUpdate && (
            <Button variant="outline" asChild>
              <Link href={`/users/${user.uuid}/edit`}>
                <PencilIcon />
                {t('edit')}
              </Link>
            </Button>
          )}
          <UserActions
            user={user}
            canUpdate={false}
            canDelete={session.permissions.includes('users:delete')}
            showView={false}
            afterDeleteHref="/users"
          />
        </div>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('details')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {details.map((detail) => (
              <div key={detail.label} className="grid gap-1 py-3 sm:grid-cols-3">
                <dt className="text-muted-foreground text-sm">{detail.label}</dt>
                <dd className="text-sm sm:col-span-2">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
