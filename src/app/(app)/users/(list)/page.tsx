import { UserPlusIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ListPagination } from '@/components/list-pagination';
import { PageHeader } from '@/components/page-header';
import { TableSearch } from '@/components/table-search';
import { Button } from '@/components/ui/button';
import { UsersTable } from '@/features/users/components/users-table';
import { listUsers } from '@/features/users/data';
import { PAGE_SIZES, userListQuerySchema } from '@/features/users/schemas';
import { requirePermission } from '@/lib/auth/session';

export default async function UsersPage({ searchParams }: PageProps<'/users'>) {
  const query = userListQuerySchema.parse(await searchParams);
  const [session, t, page] = await Promise.all([
    requirePermission('users:read'),
    getTranslations('users'),
    listUsers(query),
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
        <TableSearch placeholder={t('search_placeholder')} />
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
