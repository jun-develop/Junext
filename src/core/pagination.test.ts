import { describe, expect, it } from 'vitest';
import { pageWindow } from './pagination';

describe('pageWindow', () => {
  it.each([
    [1, 1, [1]],
    [1, 3, [1, 2, 3]],
    [1, 10, [1, 2, null, 10]],
    [5, 10, [1, null, 4, 5, 6, null, 10]],
    [10, 10, [1, null, 9, 10]],
    [3, 10, [1, 2, 3, 4, null, 10]],
  ])('page %i of %i -> %j', (page, total, expected) => {
    expect(pageWindow(page, total)).toEqual(expected);
  });
});
