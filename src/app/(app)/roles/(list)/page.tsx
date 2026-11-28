import { ShieldPlusIcon } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ListPagination } from '@/components/list-pagination';
import { PageHeader } from '@/components/page-header';
import { TableSearch } from '@/components/table-search';
import { Button } from '@/components/ui/button';
import { RolesTable } from '@/features/roles/components/roles-table';
import { listRoles } from '@/features/roles/data';
import { PAGE_SIZES, roleListQuerySchema } from '@/features/roles/schemas';
import { requirePermission } from '@/lib/auth/session';

export default async function RolesPage({ searchParams }: PageProps<'/roles'>) {
  const query = roleListQuerySchema.parse(await searchParams);
  // Check first: fetching in parallel lets Jungo's 403 win the race and show an error page.
  const session = await requirePermission('roles:read');
  const [t, page] = await Promise.all([getTranslations('roles'), listRoles(query)]);
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
          roles={page.items}
          query={query}
          canUpdate={can('roles:update')}
          canDelete={can('roles:delete')}
        />
        <ListPagination pagination={page.pagination} searchParams={query} pageSizes={PAGE_SIZES} />
      </div>
    </>
  );
}
