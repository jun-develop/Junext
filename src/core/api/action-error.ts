import { ApiError } from '@/core/api/errors';
import type { z } from '@/core/validation';

// ActionError is what a failed server action sends to the browser: a reason to translate and
// per-field messages, never a stack or an internal message.
export type ActionError = { reason: string; fieldErrors: Record<string, string> };

export function validationError(error: z.ZodError): ActionError {
  return {
    reason: 'validation_error',
    fieldErrors: Object.fromEntries(
      error.issues.map((issue) => [issue.path.join('.'), issue.message]),
    ),
  };
}

// toActionError converts a failed Jungo call for the browser; any other error is a bug and propagates.
export function toActionError(error: unknown): ActionError {
  if (!(error instanceof ApiError)) {
    throw error;
  }
  return { reason: error.reason, fieldErrors: error.fieldErrors };
}
