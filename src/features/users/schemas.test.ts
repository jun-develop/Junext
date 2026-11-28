import { describe, expect, it } from 'vitest';
import { decodeIssue } from '@/core/validation';
import {
  avatarSchema,
  createUserSchema,
  PASSWORD_RULES,
  updateUserSchema,
  userListQuerySchema,
} from './schemas';

const validUser = {
  first_name: 'An',
  last_name: 'Nguyen',
  email: 'an@example.com',
  password: 'Str0ng!pass',
  confirm_password: 'Str0ng!pass',
  phone_number: '',
  status: 'active',
};

function firstIssueKey(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return decodeIssue(result.error?.issues[0]?.message ?? '').key;
}

describe('createUserSchema', () => {
  it('accepts a valid user and drops an empty phone number', () => {
    expect(createUserSchema.parse(validUser)).toEqual({ ...validUser, phone_number: undefined });
  });

  it('rejects a confirmation that does not match', () => {
    const result = createUserSchema.safeParse({ ...validUser, confirm_password: 'Other1!pass' });
    expect(result.error?.issues[0]?.path).toEqual(['confirm_password']);
    expect(firstIssueKey(result)).toBe('users.password_mismatch');
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

describe('PASSWORD_RULES', () => {
  it.each(['Str0ng!pass', 'password1', 'PASSWORD!1', 'Short1!', 'NoSymbol12', 'ÀBc1!xyzz'])(
    'agrees with the create schema for %s',
    (password) => {
      const passesRules = PASSWORD_RULES.every((rule) => rule.pattern.test(password));
      const passesSchema = createUserSchema.safeParse({
        ...validUser,
        password,
        confirm_password: password,
      }).success;
      expect(passesRules).toBe(passesSchema);
    },
  );
});

describe('avatarSchema', () => {
  it.each([
    ['a small PNG', new File(['x'], 'a.png', { type: 'image/png' }), true],
    ['a GIF', new File(['x'], 'a.gif', { type: 'image/gif' }), false],
    [
      'a 6 MB JPEG',
      new File([new Uint8Array(6 * 1024 * 1024)], 'a.jpg', { type: 'image/jpeg' }),
      false,
    ],
  ])('%s -> %s', (_, file, isValid) => {
    expect(avatarSchema.safeParse(file).success).toBe(isValid);
  });
});
