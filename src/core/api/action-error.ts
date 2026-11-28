import { ApiError } from '@/core/api/errors';
import type { z } from '@/core/validation';

// ActionError is what a failed server action sends to the browser: a reason to translate and
// per-field messages, never a stack or an internal message.
export type ActionError = { reason: string; fieldErrors: Record<string, string> };

// validationError keeps the first issue of each field: zod reports them in schema order, so a blank
// field says "required" rather than a later rule about its format.
export function validationError(error: z.ZodError): ActionError {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    fieldErrors[issue.path.join('.')] ??= issue.message;
  }
  return { reason: 'validation_error', fieldErrors };
}

// toActionError converts a failed Jungo call for the browser; any other error is a bug and propagates.
export function toActionError(error: unknown): ActionError {
  if (!(error instanceof ApiError)) {
    throw error;
  }
  return { reason: error.reason, fieldErrors: error.fieldErrors };
}

// ActionResult is what an action without a form returns, such as a delete from a confirmation dialog.
export type ActionResult = { status: 'error'; error: ActionError } | { status: 'success' };

export function forbiddenError(): ActionError {
  return { reason: 'insufficient_permission', fieldErrors: {} };
}
