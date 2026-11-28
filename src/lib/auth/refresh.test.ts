import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshSession } from './refresh';

const pair = {
  access_token: 'new-at',
  refresh_token: 'new-rt',
  token_type: 'Bearer',
  expires_in: 900,
  refresh_expires_in: 2_592_000,
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function stubJungo(respond: () => Response | Promise<Response>) {
  const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () =>
    respond(),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const input = (refreshToken: string) => ({
  refreshToken,
  deviceId: 'device-1',
  incoming: new Headers({ 'user-agent': 'test-agent' }),
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('refreshSession', () => {
  it('shares one Jungo call between concurrent requests', async () => {
    const fetchMock = stubJungo(() => jsonResponse(200, { status: 'success', data: pair }));

    const results = await Promise.all(
      Array.from({ length: 10 }, () => refreshSession(input('rt-concurrent'))),
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(results.every((result) => result?.access_token === 'new-at')).toBe(true);
  });

  it('sends the device id and user agent', async () => {
    const fetchMock = stubJungo(() => jsonResponse(200, { status: 'success', data: pair }));

    await refreshSession(input('rt-headers'));

    const headers = new Headers(fetchMock.mock.calls[0]?.[1].headers);
    expect(headers.get('X-Device-ID')).toBe('device-1');
    expect(headers.get('User-Agent')).toBe('test-agent');
  });

  it('reuses a recent result for a late duplicate, then forgets it', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const fetchMock = stubJungo(() => jsonResponse(200, { status: 'success', data: pair }));

    await refreshSession(input('rt-late'));
    vi.setSystemTime(Date.now() + 10_000);
    await refreshSession(input('rt-late'));
    expect(fetchMock).toHaveBeenCalledOnce();

    vi.setSystemTime(Date.now() + 10_000);
    await refreshSession(input('rt-late'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns null when Jungo rejects the token', async () => {
    stubJungo(() => jsonResponse(401, { code: 'UNAUTHORIZED', reason: 'token_revoked' }));

    await expect(refreshSession(input('rt-revoked'))).resolves.toBeNull();
  });

  it('throws on outages and does not cache them', async () => {
    const fetchMock = stubJungo(() => {
      throw new TypeError('fetch failed');
    });

    await expect(refreshSession(input('rt-down'))).rejects.toMatchObject({ reason: 'unreachable' });
    await expect(refreshSession(input('rt-down'))).rejects.toMatchObject({ reason: 'unreachable' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
