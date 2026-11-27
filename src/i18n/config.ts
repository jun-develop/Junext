export const LOCALES = ['en', 'vi'] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = 'NEXT_LOCALE';
