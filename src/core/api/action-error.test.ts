import { describe, expect, it } from 'vitest';
import { decodeIssue, z } from '@/core/validation';
import { validationError } from './action-error';

describe('validationError', () => {
  it('keeps the first issue of each field', () => {
    const schema = z.object({ password: z.string().min(8).regex(/[A-Z]/, 'users.password_rule') });
    const result = schema.safeParse({ password: '' });

    const { fieldErrors } = validationError(result.error ?? new z.ZodError([]));
    expect(decodeIssue(fieldErrors.password ?? '').key).toBe('validation.required');
  });
});
