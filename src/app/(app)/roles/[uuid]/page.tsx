import { HistoryIcon, PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { getFormatter, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { RowActions } from '@/components/row-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteRole } from '@/features/roles/actions';
import { PermissionList, RoleTypeBadge } from '@/features/roles/components/role-badges';
import { getRole } from '@/features/roles/data';
import { ALL_PERMISSIONS } from '@/features/roles/permissions';
import { requirePermission } from '@/lib/auth/session';

export default async function RolePage({ params }: PageProps<'/roles/[uuid]'>) {
  const { uuid } = await params;
  const session = await requirePermission('roles:read');
  const [role, t, format] = await Promise.all([
    getRole(uuid),
    getTranslations('roles'),
    getFormatter(),
  ]);
  const canUpdate = !role.is_system && session.permissions.includes('roles:update');
  const canDelete = !role.is_system && session.permissions.includes('roles:delete');
  const details = [
    { label: t('fields.code'), value: <span className="font-mono">{role.code}</span> },
    { label: t('columns.type'), value: <RoleTypeBadge isSystem={role.is_system} /> },
    { label: t('columns.users'), value: t('user_count', { count: role.user_count }) },
    {
      label: t('fields.permissions'),
      value: `${role.permissions.length}/${ALL_PERMISSIONS.length}`,
    },
    {
      label: t('created_at'),
      value: format.dateTime(new Date(role.created_at), {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    },
  ];

  return (
    <>
      <PageHeader
        back={{ href: '/roles', label: t('back_to_list') }}
        title={role.name}
        description={role.is_system ? t('system_hint') : undefined}
        actions={
          <>
            {session.permissions.includes('audit_logs:read') && (
              <Button variant="outline" asChild>
                <Link href={`/audit-logs?entity_type=roles&entity_id=${role.uuid}`}>
                  <HistoryIcon />
                  {t('activity')}
                </Link>
              </Button>
            )}
            {canUpdate && (
              <Button variant="outline" asChild>
                <Link href={`/roles/${role.uuid}/edit`}>
                  <PencilIcon />
                  {t('edit')}
                </Link>
              </Button>
            )}
            {canDelete && (
              <RowActions
                onDelete={{
                  action: deleteRole.bind(null, role.uuid),
                  title: t('delete_title'),
                  description: t('delete_description', { name: role.name, count: role.user_count }),
                  successMessage: t('deleted'),
                  redirectTo: '/roles',
                }}
              />
            )}
          </>
        }
      />
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('details')}</CardTitle>
          </CardHeader>
          <CardContent>
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('fields.permissions')}</CardTitle>
            <CardDescription>
              {t('granted_summary', {
                count: role.permissions.length,
                total: ALL_PERMISSIONS.length,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionList permissions={role.permissions} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
