import { getTranslations } from 'next-intl/server';
import { FacetedFilter, ResetFilters } from '@/components/faceted-filter';
import { ListPagination } from '@/components/list-pagination';
import { PageHeader } from '@/components/page-header';
import { TableSearch } from '@/components/table-search';
import { AuditLogsTable } from '@/features/audit-logs/components/audit-logs-table';
import { DateRangeFilter } from '@/features/audit-logs/components/date-range-filter';
import { listAuditLogs } from '@/features/audit-logs/data';
import {
  AUDIT_ACTIONS,
  auditLogQuerySchema,
  ENTITY_TYPES,
  PAGE_SIZES,
} from '@/features/audit-logs/schemas';
import { requirePermission } from '@/lib/auth/session';

const FILTER_PARAMS = ['search', 'entity_type', 'entity_id', 'action', 'from', 'to'];

export default async function AuditLogsPage({ searchParams }: PageProps<'/audit-logs'>) {
  const query = auditLogQuerySchema.parse(await searchParams);
  // Check first: fetching in parallel lets Jungo's 403 win the race and show an error page.
  await requirePermission('audit_logs:read');
  const [t, page] = await Promise.all([getTranslations('audit_logs'), listAuditLogs(query)]);
  const isFiltered = FILTER_PARAMS.some((param) => {
    const value = query[param as keyof typeof query];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder={t('search_placeholder')} />
          <FacetedFilter
            param="entity_type"
            title={t('entity_filter')}
            isMulti={false}
            selected={query.entity_type ? [query.entity_type] : []}
            options={ENTITY_TYPES.map((entityType) => ({
              value: entityType,
              label: t(`entities.${entityType}`),
            }))}
          />
          <FacetedFilter
            param="action"
            title={t('action_filter')}
            selected={query.action}
            options={AUDIT_ACTIONS.map((action) => ({
              value: action,
              label: t(`actions.${action}`),
            }))}
          />
          <DateRangeFilter from={query.from} to={query.to} />
          <ResetFilters params={FILTER_PARAMS} />
        </div>
        <AuditLogsTable logs={page.items} isFiltered={isFiltered} />
        <ListPagination pagination={page.pagination} searchParams={query} pageSizes={PAGE_SIZES} />
      </div>
    </>
  );
}
