import { UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
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
import { deleteUser } from '@/features/users/actions';
import type { UserPage } from '@/features/users/data';
import type { UserListQuery } from '@/features/users/schemas';
import { UserRoleBadges, UserStatusBadge } from './user-identity';

type UsersTableProps = {
  users: UserPage['items'];
  query: UserListQuery;
  canUpdate: boolean;
  canDelete: boolean;
};

export function UsersTable({ users, query, canUpdate, canDelete }: UsersTableProps) {
  const t = useTranslations('users');
  const format = useFormatter();
  const isFiltered =
    query.search !== '' || query.status !== undefined || query.role_uuid.length > 0;
  const sortable = (label: string, field: UserListQuery['sort_by']) => (
    <SortableHeader label={label} field={field} searchParams={query} />
  );

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className={TABLE_HEADER_ROW_CLASSES}>
            <TableHead className="pl-4">{sortable(t('columns.name'), 'first_name')}</TableHead>
            <TableHead>{sortable(t('columns.email'), 'email')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('columns.phone')}</TableHead>
            <TableHead className="hidden lg:table-cell">
              {sortable(t('columns.created_at'), 'created_at')}
            </TableHead>
            <TableHead className="hidden xl:table-cell">{t('columns.roles')}</TableHead>
            <TableHead>{sortable(t('columns.status'), 'status')}</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">{t('columns.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7}>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <UsersIcon />
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
          {users.map((user) => (
            <TableRow key={user.uuid}>
              <TableCell className="max-w-48 truncate pl-4 font-medium">
                <Link href={`/users/${user.uuid}`} className="hover:underline">
                  {user.first_name} {user.last_name}
                </Link>
              </TableCell>
              <TableCell className="max-w-64 truncate">{user.email}</TableCell>
              <TableCell className="hidden md:table-cell">{user.phone_number ?? '—'}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {format.dateTime(new Date(user.created_at), { dateStyle: 'medium' })}
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <UserRoleBadges roles={user.roles} />
              </TableCell>
              <TableCell>
                <UserStatusBadge status={user.status} />
              </TableCell>
              <TableCell className="pr-4 text-right">
                <RowActions
                  viewHref={`/users/${user.uuid}`}
                  editHref={canUpdate ? `/users/${user.uuid}/edit` : undefined}
                  onDelete={
                    canDelete
                      ? {
                          action: deleteUser.bind(null, user.uuid),
                          title: t('delete_title'),
                          description: t('delete_description', { email: user.email }),
                          successMessage: t('deleted'),
                        }
                      : undefined
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
