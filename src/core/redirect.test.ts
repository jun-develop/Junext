import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './redirect';

describe('safeRedirectPath', () => {
  it.each([
    ['/users', '/users'],
    ['/users?page=2#top', '/users?page=2#top'],
    ['/a/../b', '/b'],
  ])('keeps internal path %s', (raw, expected) => {
    expect(safeRedirectPath(raw)).toBe(expected);
  });

  it.each([
    [null],
    [undefined],
    [''],
    ['users'],
    ['https://evil.com'],
    ['//evil.com'],
    ['/\\evil.com'],
    ['/\t/evil.com'],
    ['javascript:alert(1)'],
  ])('rejects %j', (raw) => {
    expect(safeRedirectPath(raw)).toBeNull();
  });
});
