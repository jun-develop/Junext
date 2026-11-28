import { HistoryIcon } from 'lucide-react';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
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
import type { AuditLog } from '@/features/audit-logs/data';
import { cn } from '@/lib/utils';

type AuditLogsTableProps = { logs: AuditLog[]; isFiltered?: boolean };

const ACTION_VARIANTS = {
  create: 'secondary',
  update: 'outline',
  set_roles: 'outline',
  change_password: 'outline',
  delete: 'destructive',
} as const;

function shortId(id: string): string {
  return id.slice(0, 8);
}

function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '—';
  }
  return String(value);
}

export function AuditLogsTable({ logs, isFiltered = false }: AuditLogsTableProps) {
  const t = useTranslations('audit_logs');
  const format = useFormatter();

  // A create shows the new value, a delete the old one, an update or role change both.
  const describeChange = (action: AuditLog['action'], change: unknown) => {
    const before = formatChangeValue(readSide(change, 'before'));
    const after = formatChangeValue(readSide(change, 'after'));
    if (action === 'delete') {
      return before;
    }
    if (action === 'update' || action === 'set_roles') {
      return t('change', { before, after });
    }
    return after;
  };

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className={TABLE_HEADER_ROW_CLASSES}>
            <TableHead>{t('columns.time')}</TableHead>
            <TableHead>{t('columns.actor')}</TableHead>
            <TableHead>{t('columns.action')}</TableHead>
            <TableHead>{t('columns.entity')}</TableHead>
            <TableHead>{t('columns.changes')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HistoryIcon />
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
          {logs.map((log) => {
            const actorName = log.actor
              ? `${log.actor.first_name} ${log.actor.last_name}`
              : t('system_actor');
            const changes = Object.entries(log.changes);
            return (
              <TableRow key={log.id} className="align-top">
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {format.dateTime(new Date(log.created_at), {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </TableCell>
                <TableCell>
                  <div className="grid leading-tight">
                    <span>{actorName}</span>
                    {log.actor && (
                      <span className="text-muted-foreground text-xs">{log.actor.email}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={ACTION_VARIANTS[log.action]}>{t(`actions.${log.action}`)}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="text-muted-foreground">{t(`entities.${log.entity_type}`)}</span>{' '}
                  <Link
                    href={`/${log.entity_type}/${log.entity_id}`}
                    className={cn(
                      'underline-offset-4 hover:underline',
                      !log.entity_label && 'font-mono text-xs',
                    )}
                  >
                    {log.entity_label ?? shortId(log.entity_id)}
                  </Link>
                </TableCell>
                <TableCell className="max-w-md whitespace-normal">
                  {changes.length === 0 && <span className="text-muted-foreground">{'—'}</span>}
                  <dl className="grid gap-1 text-xs">
                    {changes.map(([field, change]) => (
                      <div key={field} className="flex flex-wrap gap-x-1.5">
                        <dt className="font-medium">{field}</dt>
                        <dd className="text-muted-foreground">
                          {describeChange(log.action, change)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// readSide reads "before" or "after" from one change; Jungo types changes as free-form JSON.
function readSide(change: unknown, side: 'before' | 'after'): unknown {
  if (typeof change !== 'object' || change === null) {
    return change;
  }
  // Safe: change is a non-null object here, and a missing key reads as undefined.
  return (change as Record<string, unknown>)[side];
}
