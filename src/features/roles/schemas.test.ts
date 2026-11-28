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
      { page: '2', page_size: '20', search: '  edit ', sort_by: 'user_count', sort_order: 'desc' },
      { page: 2, page_size: 20, search: 'edit', sort_by: 'user_count', sort_order: 'desc' },
    ],
    [{ page: '-1', page_size: '7', search: ['a', 'b'], sort_by: 'permissions' }, defaults],
  ])('parses %j', (input, expected) => {
    expect(roleListQuerySchema.parse(input)).toEqual(expected);
  });
});
