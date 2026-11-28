import { describe, expect, it } from 'vitest';
import { sidebarCollapsibleSchema, sidebarVariantSchema } from './layout-preferences';

describe('layout preference cookies', () => {
  it.each([
    [undefined, 'inset'],
    ['floating', 'floating'],
    ['sidebar', 'sidebar'],
    ['<script>', 'inset'],
  ])('sidebar variant %s -> %s', (cookie, expected) => {
    expect(sidebarVariantSchema.parse(cookie)).toBe(expected);
  });

  it.each([
    [undefined, 'icon'],
    ['offcanvas', 'offcanvas'],
    ['none', 'icon'],
  ])('sidebar collapsible %s -> %s', (cookie, expected) => {
    expect(sidebarCollapsibleSchema.parse(cookie)).toBe(expected);
  });
});
