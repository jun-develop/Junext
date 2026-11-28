import 'server-only';
import { unwrap } from '@/core/api/client';
import { jungo } from '@/lib/jungo';
import type { operations } from '@/lib/jungo-schema';
import type { AuditLogQuery } from './schemas';

export type AuditLogPage =
  operations['listAuditLogs']['responses'][200]['content']['application/json']['data'];
export type AuditLog = AuditLogPage['items'][number];

// The dashboard asks for a short page, so page_size is any size Jungo accepts, not only the URL's.
type AuditLogFilter = Partial<Omit<AuditLogQuery, 'page_size'>> & { page_size?: number };

// listAuditLogs returns one page of audit entries, newest first unless asked otherwise.
export async function listAuditLogs(query: AuditLogFilter): Promise<AuditLogPage> {
  const body = await unwrap(
    jungo.GET('/api/v1/audit-logs', {
      params: { query: { ...query, search: query.search || undefined } },
    }),
  );
  return body.data;
}
