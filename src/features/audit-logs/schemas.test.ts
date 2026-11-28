import { describe, expect, it } from 'vitest';
import { auditLogQuerySchema } from './schemas';

const defaults = {
  page: 1,
  page_size: 20,
  search: '',
  entity_type: undefined,
  entity_id: undefined,
  action: [],
  from: undefined,
  to: undefined,
  sort_order: 'desc',
};

describe('auditLogQuerySchema', () => {
  it.each([
    [{}, defaults],
    [
      {
        page: '2',
        page_size: '50',
        search: ' an ',
        entity_type: 'roles',
        action: ['update', 'set_roles'],
        from: '2026-11-27T17:00:00.000Z',
        to: '2026-11-28T16:59:59.999999Z',
        sort_order: 'asc',
      },
      {
        ...defaults,
        page: 2,
        page_size: 50,
        search: 'an',
        entity_type: 'roles',
        action: ['update', 'set_roles'],
        from: '2026-11-27T17:00:00.000Z',
        to: '2026-11-28T16:59:59.999999Z',
        sort_order: 'asc',
      },
    ],
    [
      { page: '0', page_size: '7', entity_type: 'sessions', action: 'login', from: '2026-11-28' },
      defaults,
    ],
    [{ action: 'change_password' }, { ...defaults, action: ['change_password'] }],
  ])('parses %j', (input, expected) => {
    expect(auditLogQuerySchema.parse(input)).toEqual(expected);
  });
});
