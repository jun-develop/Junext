import { z } from 'zod';
import type { $ZodRawIssue } from 'zod/v4/core';

/**
 * Zod configured so every issue message is a translation key plus params, encoded as JSON.
 * Import `z` from here, never from 'zod', so the config is always applied (architecture test).
 * Render with `translateIssue(message, t)`; an explicit schema message ('users.email_taken') is a bare key.
 */

export type IssueMessage = { key: string; params?: Record<string, string | number> };

const BOUNDED_ORIGINS = ['string', 'number', 'array'] as const;
const FORMATS = ['email', 'url', 'uuid', 'regex'] as const;

/** Every key `issueKey` can return; the i18n test checks each exists in every locale. */
export const VALIDATION_KEYS = [
  'validation.required',
  'validation.invalid_type',
  'validation.invalid_value',
  'validation.invalid',
  ...BOUNDED_ORIGINS.flatMap((o) => [`validation.too_small_${o}`, `validation.too_big_${o}`]),
  ...FORMATS.map((f) => `validation.invalid_format_${f}`),
  'validation.invalid_format',
] as const;

export function issueKey(iss: $ZodRawIssue): IssueMessage {
  switch (iss.code) {
    case 'invalid_type':
      return { key: iss.input === undefined ? 'validation.required' : 'validation.invalid_type' };
    case 'too_small':
    case 'too_big': {
      const origin = (BOUNDED_ORIGINS as readonly string[]).includes(iss.origin)
        ? iss.origin
        : null;
      const limit = Number(iss.code === 'too_small' ? iss.minimum : iss.maximum);
      return origin
        ? {
            key: `validation.${iss.code}_${origin}`,
            params: { limit },
          }
        : { key: 'validation.invalid' };
    }
    case 'invalid_format':
      return {
        key: (FORMATS as readonly string[]).includes(iss.format)
          ? `validation.invalid_format_${iss.format}`
          : 'validation.invalid_format',
      };
    case 'invalid_value':
      return { key: 'validation.invalid_value' };
    default:
      return { key: 'validation.invalid' };
  }
}

z.config({
  customError: (iss) => JSON.stringify(issueKey(iss)),
});

export function decodeIssue(message: string): IssueMessage {
  if (message.startsWith('{')) {
    try {
      return JSON.parse(message) as IssueMessage;
    } catch {
      // not ours: fall through and treat as a bare key
    }
  }
  return { key: message };
}

type Translator = {
  (key: string, params?: Record<string, string | number>): string;
  has: (key: string) => boolean;
};

/** Translates a zod issue message; unknown keys (e.g. server text) are shown as-is. */
export function translateIssue(message: string, t: Translator): string {
  const { key, params } = decodeIssue(message);
  return t.has(key) ? t(key, params) : message;
}

export { z };
