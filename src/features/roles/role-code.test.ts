import { describe, expect, it } from 'vitest';
import { toRoleCode } from './role-code';

describe('toRoleCode', () => {
  it.each([
    ['Content Editor', 'content_editor'],
    ['Biên tập viên', 'bien_tap_vien'],
    ['Đội hỗ trợ', 'doi_ho_tro'],
    ['  Sales -- Team 2 ', 'sales_team'],
    ['123', ''],
    ['a'.repeat(60), 'a'.repeat(50)],
  ])('%s -> %s', (name, code) => {
    expect(toRoleCode(name)).toBe(code);
  });
});
