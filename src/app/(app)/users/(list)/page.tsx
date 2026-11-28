import { UserPlusIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ListPagination } from '@/components/list-pagination';
import { PageHeader } from '@/components/page-header';
import { FacetedFilter, ResetFilters } from '@/components/faceted-filter';
import { TableSearch } from '@/components/table-search';
import { Button } from '@/components/ui/button';
import { listAllRoles } from '@/features/roles/data';
import { UsersTable } from '@/features/users/components/users-table';
import { listUsers } from '@/features/users/data';
import { PAGE_SIZES, userListQuerySchema } from '@/features/users/schemas';
import { requirePermission } from '@/lib/auth/session';

export default async function UsersPage({ searchParams }: PageProps<'/users'>) {
  const query = userListQuerySchema.parse(await searchParams);
  const session = await requirePermission('users:read');
  const [t, page, roles] = await Promise.all([
    getTranslations('users'),
    listUsers(query),
    session.permissions.includes('roles:read') ? listAllRoles() : null,
  ]);
  const can = (permission: 'users:create' | 'users:update' | 'users:delete') =>
    session.permissions.includes(permission);

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          can('users:create') && (
            <Button asChild>
              <Link href="/users/create">
                {t('create')}
                <UserPlusIcon />
              </Link>
            </Button>
          )
        }
      />
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder={t('search_placeholder')} />
          <FacetedFilter
            param="status"
            title={t('fields.status')}
            isMulti={false}
            selected={query.status ? [query.status] : []}
            options={[
              { value: 'active', label: t('status.active') },
              { value: 'inactive', label: t('status.inactive') },
            ]}
          />
          {roles && (
            <FacetedFilter
              param="role_uuid"
              title={t('fields.roles')}
              selected={query.role_uuid}
              options={roles.map((role) => ({ value: role.uuid, label: role.name }))}
            />
          )}
          <ResetFilters params={['search', 'status', 'role_uuid']} />
        </div>
        <UsersTable
          users={page.items}
          query={query}
          canUpdate={can('users:update')}
          canDelete={can('users:delete')}
        />
        <ListPagination pagination={page.pagination} searchParams={query} pageSizes={PAGE_SIZES} />
      </div>
    </>
  );
}
