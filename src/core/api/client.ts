import createClient, { type Client } from 'openapi-fetch';
import { ApiError, toApiError } from '@/core/api/errors';

type JungoClientOptions = { baseUrl: string; timeoutMs: number };
type JungoResponse<T> = { data?: T; error?: unknown; response: Response };

// createJungoClient returns a client typed by the generated Jungo paths, with a timeout on every call.
export function createJungoClient<Paths extends object>(
  options: JungoClientOptions,
): Client<Paths> {
  return createClient<Paths>({
    baseUrl: options.baseUrl,
    fetch: (request) => send(request, options.timeoutMs),
  });
}

// unwrap returns the body of a successful Jungo response and throws ApiError otherwise.
export async function unwrap<T>(pending: Promise<JungoResponse<T>>): Promise<T> {
  const { data, error, response } = await pending;
  if (!response.ok) {
    throw toApiError(response.status, error);
  }
  if (data === undefined) {
    throw new Error(`Jungo returned an empty body for ${response.url}`);
  }
  return data;
}

async function send(request: Request, timeoutMs: number): Promise<Response> {
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(timeoutMs)]);
  // A URL and a buffered body, not the Request: Next's patched fetch rebuilds a Request with a
  // stream body, and undici then fails every 401 to a POST with "expected non-null body source".
  const body = request.body ? await request.arrayBuffer() : undefined;
  try {
    return await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body,
      signal,
      cache: 'no-store',
    });
  } catch (error) {
    throw toTransportError(request, error);
  }
}

// toTransportError turns a timeout or network failure into an ApiError; a caller's own abort passes through.
function toTransportError(request: Request, error: unknown): unknown {
  const target = `${request.method} ${new URL(request.url).pathname}`;
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return new ApiError({
      status: 504,
      code: 'GATEWAY_TIMEOUT',
      reason: 'timeout',
      message: `${target} timed out`,
      cause: error,
    });
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return error;
  }

  return new ApiError({
    status: 503,
    code: 'SERVICE_UNAVAILABLE',
    reason: 'unreachable',
    message: `${target} failed: Jungo is unreachable`,
    cause: error,
  });
}
