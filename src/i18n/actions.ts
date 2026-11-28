'use server';

import { cookies } from 'next/headers';
import { z } from '@/core/validation';
import { LOCALE_COOKIE, LOCALES } from './config';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// setLocale stores the chosen UI language; setting a cookie in an action re-renders the page in it.
export async function setLocale(locale: string): Promise<void> {
  const parsed = z.enum(LOCALES).parse(locale);
  (await cookies()).set(LOCALE_COOKIE, parsed, {
    path: '/',
    sameSite: 'lax',
    maxAge: ONE_YEAR_SECONDS,
  });
}
