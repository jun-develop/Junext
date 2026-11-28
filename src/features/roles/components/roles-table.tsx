import { ShieldIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RowActions } from '@/components/row-actions';
import { SortableHeader } from '@/components/sortable-header';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { TABLE_HEADER_ROW_CLASSES } from '@/components/table-styles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteRole } from '@/features/roles/actions';
import type { Role } from '@/features/roles/data';
import type { RoleListQuery } from '@/features/roles/schemas';
import { RoleTypeBadge } from './role-badges';

type RolesTableProps = {
  roles: Role[];
  query: RoleListQuery;
  canUpdate: boolean;
  canDelete: boolean;
};

export function RolesTable({ roles, query, canUpdate, canDelete }: RolesTableProps) {
  const t = useTranslations('roles');
  const isFiltered = query.search !== '';
  const sortable = (label: string, field: RoleListQuery['sort_by']) => (
    <SortableHeader label={label} field={field} searchParams={query} />
  );

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className={TABLE_HEADER_ROW_CLASSES}>
            <TableHead className="pl-4">{sortable(t('columns.name'), 'name')}</TableHead>
            <TableHead>{sortable(t('columns.code'), 'code')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('columns.permissions')}</TableHead>
            <TableHead className="hidden md:table-cell">
              {sortable(t('columns.users'), 'user_count')}
            </TableHead>
            <TableHead>{t('columns.type')}</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">{t('columns.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6}>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ShieldIcon />
                    </EmptyMedia>
                    <EmptyTitle>
                      {isFiltered ? t('empty_filtered_title') : t('empty_title')}
                    </EmptyTitle>
                    <EmptyDescription>
                      {isFiltered ? t('empty_filtered_description') : t('empty_description')}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          )}
          {roles.map((role) => {
            const isEditable = !role.is_system;
            return (
              <TableRow key={role.uuid}>
                <TableCell className="max-w-56 truncate pl-4 font-medium">
                  <Link href={`/roles/${role.uuid}`} className="hover:underline">
                    {role.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {role.code}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {t('permission_count', { count: role.permissions.length })}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {t('user_count', { count: role.user_count })}
                </TableCell>
                <TableCell>
                  <RoleTypeBadge isSystem={role.is_system} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <RowActions
                    viewHref={`/roles/${role.uuid}`}
                    editHref={canUpdate && isEditable ? `/roles/${role.uuid}/edit` : undefined}
                    onDelete={
                      canDelete && isEditable
                        ? {
                            action: deleteRole.bind(null, role.uuid),
                            title: t('delete_title'),
                            description: t('delete_description', {
                              name: role.name,
                              count: role.user_count,
                            }),
                            successMessage: t('deleted'),
                          }
                        : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
