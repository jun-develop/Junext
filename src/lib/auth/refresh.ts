import 'server-only';
import { createHash } from 'node:crypto';
import { unwrap } from '@/core/api/client';
import { ApiError } from '@/core/api/errors';
import type { TokenPair } from '@/lib/auth/cookies';
import { forwardedHeaders, jungoWithoutSession } from '@/lib/jungo';

// A settled refresh is reused for a while: a late duplicate must not resend the used token,
// which Jungo treats as reuse and answers by revoking the whole session.
const RESULT_TTL_MS = 15_000;
const REJECTED_STATUSES = [400, 401, 403, 422];

type RefreshEntry = { pending: Promise<TokenPair | null>; expiresAt: number };
type RefreshInput = { refreshToken: string; deviceId: string | undefined; incoming: Headers };

// shortcut: per-process dedupe; with several Next instances add a shared lock if users see spurious logouts.
const refreshes = new Map<string, RefreshEntry>();

// refreshSession exchanges a refresh token for a new pair, or null when Jungo rejects it.
// Concurrent and late duplicate calls with the same token share one Jungo call.
//
// Flow: drop expired entries -> reuse a pending or recent refresh -> call Jungo -> keep the result for RESULT_TTL_MS
export function refreshSession(input: RefreshInput): Promise<TokenPair | null> {
  const now = Date.now();
  for (const [key, entry] of refreshes) {
    if (entry.expiresAt <= now) {
      refreshes.delete(key);
    }
  }

  const key = createHash('sha256').update(input.refreshToken).digest('hex');
  const existing = refreshes.get(key);
  if (existing) {
    return existing.pending;
  }

  const entry: RefreshEntry = { pending: requestRefresh(input), expiresAt: Infinity };
  refreshes.set(key, entry);
  entry.pending.then(
    () => {
      entry.expiresAt = Date.now() + RESULT_TTL_MS;
    },
    () => {
      // A failed call (Jungo down) is not cached, so the next request tries again.
      refreshes.delete(key);
    },
  );
  return entry.pending;
}

async function requestRefresh(input: RefreshInput): Promise<TokenPair | null> {
  const headers = forwardedHeaders(input.incoming);
  if (input.deviceId) {
    headers['X-Device-ID'] = input.deviceId;
  }
  try {
    const body = await unwrap(
      jungoWithoutSession.POST('/api/v1/auth/refresh', {
        body: { refresh_token: input.refreshToken },
        headers,
      }),
    );
    return body.data;
  } catch (error) {
    if (error instanceof ApiError && REJECTED_STATUSES.includes(error.status)) {
      return null;
    }
    throw error;
  }
}
