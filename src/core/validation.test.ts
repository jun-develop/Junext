import { describe, expect, it } from 'vitest';
import { decodeIssue, translateIssue, z } from './validation';

const messageOf = (schema: z.ZodType, input: unknown) =>
  schema.safeParse(input).error?.issues[0]?.message ?? '';

describe('zod issues become translation keys', () => {
  // prettier-ignore
  it.each([
    ['missing value', z.object({ a: z.string() }), {}, { key: 'validation.required' }],
    ['wrong type', z.string(), 1, { key: 'validation.invalid_type' }],
    ['blank string', z.string().min(2), '', { key: 'validation.required' }],
    ['short string', z.string().min(2), 'a', { key: 'validation.too_small_string', params: { limit: 2 } }],
    ['long string', z.string().max(3), 'abcd', { key: 'validation.too_big_string', params: { limit: 3 } }],
    ['small number', z.number().min(5), 1, { key: 'validation.too_small_number', params: { limit: 5 } }],
    ['empty array', z.array(z.string()).min(1), [], { key: 'validation.too_small_array', params: { limit: 1 } }],
    ['email', z.email(), 'x', { key: 'validation.invalid_format_email' }],
    ['uuid', z.uuid(), 'x', { key: 'validation.invalid_format_uuid' }],
    ['regex', z.string().regex(/^a$/), 'b', { key: 'validation.invalid_format_regex' }],
    ['enum', z.enum(['a', 'b']), 'c', { key: 'validation.invalid_value' }],
  ])('%s', (_, schema, input, expected) => {
    expect(decodeIssue(messageOf(schema, input))).toEqual(expected);
  });

  it('keeps an explicit schema message as a bare key', () => {
    expect(decodeIssue(messageOf(z.string().min(2, 'users.name_short'), 'a'))).toEqual({
      key: 'users.name_short',
    });
  });
});

describe('translateIssue', () => {
  const dict: Record<string, string> = { 'validation.too_small_string': 'min {limit}' };
  const t = Object.assign(
    (key: string, p?: Record<string, string | number>) =>
      (dict[key] ?? key).replace('{limit}', String(p?.limit)),
    {
      has: (key: string) => key in dict,
    },
  );

  it('translates known keys with params', () => {
    expect(translateIssue(messageOf(z.string().min(2), 'a'), t)).toBe('min 2');
  });

  it('shows unknown text as-is (e.g. a server message)', () => {
    expect(translateIssue('Email already taken', t)).toBe('Email already taken');
  });
});
