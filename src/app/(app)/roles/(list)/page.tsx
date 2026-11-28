import { ShieldPlusIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { TableSearch } from '@/components/table-search';
import { Button } from '@/components/ui/button';
import { RolesTable } from '@/features/roles/components/roles-table';
import { listRoles } from '@/features/roles/data';
import { roleListQuerySchema } from '@/features/roles/schemas';
import { requirePermission } from '@/lib/auth/session';

export default async function RolesPage({ searchParams }: PageProps<'/roles'>) {
  const { search } = roleListQuerySchema.parse(await searchParams);
  const [session, t, roles] = await Promise.all([
    requirePermission('roles:read'),
    getTranslations('roles'),
    listRoles(),
  ]);
  const needle = search.toLowerCase();
  const visible = roles.filter(
    (role) => role.name.toLowerCase().includes(needle) || role.code.toLowerCase().includes(needle),
  );
  const can = (permission: 'roles:create' | 'roles:update' | 'roles:delete') =>
    session.permissions.includes(permission);

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          can('roles:create') && (
            <Button asChild>
              <Link href="/roles/create">
                {t('create')}
                <ShieldPlusIcon />
              </Link>
            </Button>
          )
        }
      />
      <div className="flex flex-1 flex-col gap-4">
        <TableSearch placeholder={t('search_placeholder')} />
        <RolesTable
          roles={visible}
          isFiltered={search !== ''}
          canUpdate={can('roles:update')}
          canDelete={can('roles:delete')}
        />
      </div>
    </>
  );
}
