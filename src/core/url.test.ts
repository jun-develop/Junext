import { describe, expect, it } from 'vitest';
import { hrefWithParams } from './url';

describe('hrefWithParams', () => {
  it.each([
    [{}, { page: 2 }, '?page=2'],
    [{ search: 'an', page: 3 }, { page: 1 }, '?search=an&page=1'],
    [{ search: 'an', page: 3 }, { search: '', page: undefined }, '?'],
    [{ search: 'a b&c' }, {}, '?search=a+b%26c'],
  ])('%j + %j -> %s', (current, changes, expected) => {
    expect(hrefWithParams(current, changes)).toBe(expected);
  });
});
