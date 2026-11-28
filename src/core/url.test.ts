import { describe, expect, it } from 'vitest';
import { hrefWithParams, searchParamsRecord } from './url';

describe('hrefWithParams', () => {
  it.each([
    [{}, { page: 2 }, '?page=2'],
    [{ search: 'an', page: 3 }, { page: 1 }, '?search=an&page=1'],
    [{ search: 'an', page: 3 }, { search: '', page: undefined }, '?'],
    [{ search: 'a b&c' }, {}, '?search=a+b%26c'],
    [{ role_uuid: ['a', 'b'] }, { page: 1 }, '?role_uuid=a&role_uuid=b&page=1'],
    [{ role_uuid: ['a'] }, { role_uuid: [] }, '?'],
  ])('%j + %j -> %s', (current, changes, expected) => {
    expect(hrefWithParams(current, changes)).toBe(expected);
  });
});

describe('searchParamsRecord', () => {
  it('keeps single values as strings and repeated keys as lists', () => {
    expect(searchParamsRecord(new URLSearchParams('page=2&role_uuid=a&role_uuid=b'))).toEqual({
      page: '2',
      role_uuid: ['a', 'b'],
    });
  });
});
