import { describe, expect, it } from 'vitest';
import { createRoleSchema, roleListQuerySchema } from './schemas';

describe('createRoleSchema', () => {
  it('accepts a role with known permissions', () => {
    expect(
      createRoleSchema.parse({ name: ' Editor ', code: 'editor', permissions: ['users:read'] }),
    ).toEqual({ name: 'Editor', code: 'editor', permissions: ['users:read'] });
  });

  it.each([
    ['an unknown permission', { permissions: ['users:fly'] }],
    ['a one-letter code', { code: 'e' }],
    ['a code with digits', { code: 'editor2' }],
    ['a code with capitals', { code: 'Editor' }],
    ['a missing name', { name: '' }],
  ])('rejects %s', (_, override) => {
    const input = { name: 'Editor', code: 'editor', permissions: [], ...override };
    expect(createRoleSchema.safeParse(input).success).toBe(false);
  });
});

describe('roleListQuerySchema', () => {
  it.each([
    [{}, ''],
    [{ search: '  edit ' }, 'edit'],
    [{ search: ['a', 'b'] }, ''],
  ])('parses %j', (input, expected) => {
    expect(roleListQuerySchema.parse(input).search).toBe(expected);
  });
});
