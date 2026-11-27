import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { env } from '@/core/env';
import { resolveLocale } from '@/core/i18n';
import { LOCALE_COOKIE, LOCALES, type Locale } from './config';
import { loadMessages } from './messages';

export default getRequestConfig(async () => {
  const fallback = (LOCALES as readonly string[]).includes(env.DEFAULT_LOCALE)
    ? (env.DEFAULT_LOCALE as Locale)
    : 'en';
  const locale = resolveLocale({
    cookie: (await cookies()).get(LOCALE_COOKIE)?.value,
    acceptLanguage: (await headers()).get('accept-language'),
    locales: LOCALES,
    fallback,
  });
  return {
    locale,
    timeZone: env.DEFAULT_TIME_ZONE,
    messages: await loadMessages(locale),
  };
});
