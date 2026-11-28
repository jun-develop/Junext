import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cookieNames } from '@/lib/auth/cookies';
import { proxy } from './proxy';

function requestTo(path: string, cookies: Record<string, string> = {}): NextRequest {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  return new NextRequest(`http://admin.test${path}`, { headers: { cookie: cookieHeader } });
}

function stubRefresh(status: number) {
  const body =
    status === 200
      ? {
          status: 'success',
          data: {
            access_token: 'new-at',
            refresh_token: 'new-rt',
            token_type: 'Bearer',
            expires_in: 900,
            refresh_expires_in: 2_592_000,
          },
        }
      : { code: 'UNAUTHORIZED', reason: 'token_revoked' };
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('proxy', () => {
  it('sends a signed-out visitor to login and remembers the page', async () => {
    const response = await proxy(requestTo('/users?page=2'));

    expect(response.headers.get('location')).toBe(
      'http://admin.test/login?next=%2Fusers%3Fpage%3D2',
    );
  });

  it('lets a signed-out visitor open public pages', async () => {
    const response = await proxy(requestTo('/login'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('passes through when the access token is still valid', async () => {
    const fetchMock = stubRefresh(200);

    const response = await proxy(
      requestTo('/dashboard', { [cookieNames.access]: 'at', [cookieNames.refresh]: 'rt-valid' }),
    );

    expect(response.headers.get('location')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refreshes an expired access token and sets the new cookies', async () => {
    stubRefresh(200);

    const response = await proxy(requestTo('/dashboard', { [cookieNames.refresh]: 'rt-expired' }));

    expect(response.headers.get('location')).toBeNull();
    expect(response.cookies.get(cookieNames.access)).toMatchObject({
      value: 'new-at',
      httpOnly: true,
      maxAge: 870,
    });
    expect(response.cookies.get(cookieNames.refresh)?.value).toBe('new-rt');
    expect(response.headers.get('x-middleware-request-cookie')).toContain('new-at');
  });

  it('clears cookies and sends to login when the refresh token is rejected', async () => {
    stubRefresh(401);

    const response = await proxy(requestTo('/dashboard', { [cookieNames.refresh]: 'rt-rejected' }));

    expect(response.headers.get('location')).toBe('http://admin.test/login?next=%2Fdashboard');
    expect(response.cookies.get(cookieNames.refresh)).toMatchObject({ value: '', maxAge: 0 });
  });
});
