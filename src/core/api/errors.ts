import { z } from '@/core/validation';

type ApiErrorInit = {
  status: number;
  code: string;
  reason: string;
  message: string;
  fieldErrors?: Record<string, string>;
  traceId?: string;
  cause?: unknown;
};

// ApiError is every failed Jungo call: an error response, a timeout or an unreachable server.
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly reason: string;
  readonly fieldErrors: Record<string, string>;
  readonly traceId: string | undefined;

  constructor(init: ApiErrorInit) {
    super(init.message, { cause: init.cause });
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.reason = init.reason;
    this.fieldErrors = init.fieldErrors ?? {};
    this.traceId = init.traceId;
  }
}

// Jungo's error envelope. `error` is a field map for validation errors, a string for others.
const errorBody = z.object({
  code: z.string().optional(),
  reason: z.string().optional(),
  message: z.string().optional(),
  error: z.union([z.record(z.string(), z.string()), z.string()]).optional(),
  api_info: z.object({ trace_id: z.string().optional() }).optional(),
});

// toApiError builds an ApiError from a Jungo error response, tolerating non-JSON bodies from proxies.
export function toApiError(status: number, body: unknown): ApiError {
  const parsed = errorBody.safeParse(body);
  const envelope = parsed.success ? parsed.data : {};
  const fieldErrors = typeof envelope.error === 'object' ? envelope.error : {};
  return new ApiError({
    status,
    code: envelope.code ?? 'HTTP_ERROR',
    reason: envelope.reason ?? 'unknown',
    message: envelope.message ?? `Jungo responded with ${status}`,
    fieldErrors,
    traceId: envelope.api_info?.trace_id,
  });
}
