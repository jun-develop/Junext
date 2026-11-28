import 'server-only';
import { createJungoClient } from '@/core/api/client';
import { env } from '@/core/env';
import type { paths } from '@/lib/jungo-schema';

export const jungo = createJungoClient<paths>({
  baseUrl: env.JUNGO_API_URL,
  timeoutMs: env.JUNGO_TIMEOUT_MS,
});
