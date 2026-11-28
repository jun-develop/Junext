import 'server-only';
import { unwrap } from '@/core/api/client';
import { jungo } from '@/lib/jungo';
import type { operations } from '@/lib/jungo-schema';

export type ActiveSession =
  operations['listSessions']['responses'][200]['content']['application/json']['data'][number];

// listSessions returns the signed-in user's active sessions, the current one first.
export async function listSessions(): Promise<ActiveSession[]> {
  const body = await unwrap(jungo.GET('/api/v1/auth/sessions'));
  return body.data.toSorted((a, b) => Number(b.current) - Number(a.current));
}
