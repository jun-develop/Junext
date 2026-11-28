import { describe, expect, it } from 'vitest';
import { decodeIssue } from '@/core/validation';
import { createUserSchema, updateUserSchema, userListQuerySchema } from './schemas';

const validUser = {
  first_name: 'An',
  last_name: 'Nguyen',
  email: 'an@example.com',
  password: 'Str0ng!pass',
  phone_number: '',
};

function firstIssueKey(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return decodeIssue(result.error?.issues[0]?.message ?? '').key;
}

describe('createUserSchema', () => {
  it('accepts a valid user and drops an empty phone number', () => {
    expect(createUserSchema.parse(validUser)).toEqual({ ...validUser, phone_number: undefined });
  });

  it.each([
    ['a weak password', { password: 'password1' }, 'users.password_rule'],
    ['a short password', { password: 'S0!a' }, 'validation.too_small_string'],
    ['a bad phone number', { phone_number: '12-34' }, 'users.phone_rule'],
    ['a one-letter name', { first_name: 'A' }, 'validation.too_small_string'],
    ['a bad email', { email: 'not-an-email' }, 'validation.invalid_format_email'],
  ])('rejects %s', (_, override, key) => {
    expect(firstIssueKey(createUserSchema.safeParse({ ...validUser, ...override }))).toBe(key);
  });
});

describe('updateUserSchema', () => {
  it('keeps an empty phone number so Jungo clears it', () => {
    const parsed = updateUserSchema.parse({
      first_name: 'An',
      last_name: 'Nguyen',
      phone_number: '',
      status: 'inactive',
    });
    expect(parsed.phone_number).toBe('');
  });

  it('rejects an unknown status', () => {
    const result = updateUserSchema.safeParse({
      first_name: 'An',
      last_name: 'Ng',
      phone_number: '',
      status: 'banned',
    });
    expect(result.success).toBe(false);
  });
});

describe('userListQuerySchema', () => {
  const defaults = {
    page: 1,
    page_size: 10,
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  };

  it.each([
    [{}, defaults],
    [
      { page: '3', page_size: '20', search: '  an  ', sort_by: 'email', sort_order: 'asc' },
      { page: 3, page_size: 20, search: 'an', sort_by: 'email', sort_order: 'asc' },
    ],
    [{ page: '-2', page_size: '1000', search: ['a', 'b'], sort_by: 'password' }, defaults],
  ])('parses %j', (input, expected) => {
    expect(userListQuerySchema.parse(input)).toEqual(expected);
  });
});
