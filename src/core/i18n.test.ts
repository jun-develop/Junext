import { describe, expect, it } from 'vitest';
import { resolveLocale } from './i18n';

const base = { locales: ['en', 'vi'] as const, fallback: 'en' as const };

describe('resolveLocale', () => {
  it.each([
    ['cookie wins', 'vi', 'en-US,en;q=0.9', 'vi'],
    ['unsupported cookie falls through to header', 'fr', 'vi-VN,vi;q=0.9', 'vi'],
    ['header order by q', undefined, 'en;q=0.5,vi;q=0.8', 'vi'],
    ['region tag matches base language', undefined, 'vi-VN', 'vi'],
    ['q=0 is excluded', undefined, 'vi;q=0,fr', 'en'],
    ['no header uses fallback', undefined, null, 'en'],
    ['garbage header uses fallback', undefined, ';;,,q=abc', 'en'],
  ])('%s', (_, cookie, acceptLanguage, expected) => {
    expect(
      resolveLocale({
        ...base,
        cookie,
        acceptLanguage,
      }),
    ).toBe(expected);
  });
});
