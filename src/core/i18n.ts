/**
 * Picks the UI locale: explicit cookie choice, then the best Accept-Language match, then the default.
 * Pure so it can be shared by request config, tests and the future core package.
 */
export function resolveLocale<L extends string>(input: {
  cookie: string | undefined;
  acceptLanguage: string | null | undefined;
  locales: readonly L[];
  fallback: L;
}): L {
  const { cookie, acceptLanguage, locales, fallback } = input;
  const supported = (v: string | undefined): v is L =>
    !!v && (locales as readonly string[]).includes(v);
  if (supported(cookie)) return cookie;

  const ranked = (acceptLanguage ?? '')
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q.split('=')[1]) : 1 };
    })
    .filter((x) => x.lang && !Number.isNaN(x.q) && x.q > 0)
    .sort((a, b) => b.q - a.q);

  return ranked.map((x) => x.lang).find(supported) ?? fallback;
}
