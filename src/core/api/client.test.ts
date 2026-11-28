import { afterEach, describe, expect, it, vi } from 'vitest';
import { createJungoClient, unwrap } from './client';
import { ApiError } from './errors';

type TestPaths = {
  '/ping': {
    get: {
      responses: {
        200: { content: { 'application/json': { status: string; data: { pong: boolean } } } };
        422: { content: { 'application/json': { message: string } } };
      };
    };
  };
};

const client = createJungoClient<TestPaths>({ baseUrl: 'http://jungo.test', timeoutMs: 50 });
const ping = () => unwrap(client.GET('/ping'));

function respondWith(status: number, body: string) {
  const fetchMock = vi.fn(
    async () =>
      new Response(body, {
        status,
        headers: { 'content-type': 'application/json' },
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function caught(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(ApiError);
  // Guarded by the instanceof assertion above.
  return error as ApiError;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('unwrap', () => {
  it('returns the body of a successful response', async () => {
    const fetchMock = respondWith(200, '{"status":"success","data":{"pong":true}}');

    await expect(ping()).resolves.toEqual({ status: 'success', data: { pong: true } });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('maps a validation error to field errors', async () => {
    respondWith(
      422,
      JSON.stringify({
        code: 'UNPROCESSABLE_ENTITY',
        reason: 'validation_error',
        message: 'Validation error',
        error: { email: 'email must be a valid email format' },
        api_info: { trace_id: 'trace-1' },
      }),
    );

    const error = await caught(ping());
    expect(error).toMatchObject({
      status: 422,
      code: 'UNPROCESSABLE_ENTITY',
      reason: 'validation_error',
      message: 'Validation error',
      fieldErrors: { email: 'email must be a valid email format' },
      traceId: 'trace-1',
    });
  });

  it.each([
    ['a string error detail', 422, '{"code":"UNPROCESSABLE_ENTITY","error":"Invalid JSON syntax"}'],
    ['a non-JSON proxy page', 502, '<html>Bad Gateway</html>'],
  ])('keeps field errors empty for %s', async (_, status, body) => {
    respondWith(status, body);

    const error = await caught(ping());
    expect(error.status).toBe(status);
    expect(error.fieldErrors).toEqual({});
  });

  it('sends a URL and a buffered body, never a Request (Next rebuilds those with a stream body)', async () => {
    const fetchMock = respondWith(200, '{"status":"success","data":{"pong":true}}');

    await ping();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://jungo.test/ping',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('falls back to generic values when the body is not a Jungo envelope', async () => {
    respondWith(502, '<html>Bad Gateway</html>');

    const error = await caught(ping());
    expect(error).toMatchObject({ code: 'HTTP_ERROR', reason: 'unknown' });
  });

  it('turns a slow response into a timeout error', async () => {
    vi.stubGlobal(
      'fetch',
      (_: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );

    const error = await caught(ping());
    expect(error).toMatchObject({ status: 504, reason: 'timeout' });
  });

  it('turns a network failure into an unreachable error', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('fetch failed');
    });

    const error = await caught(ping());
    expect(error).toMatchObject({ status: 503, reason: 'unreachable' });
    expect(error.cause).toBeInstanceOf(TypeError);
  });
});
