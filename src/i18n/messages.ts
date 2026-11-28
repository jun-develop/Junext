import type { Messages } from 'next-intl';
import type { Locale } from './config';

// Each feature adds one import per locale before the marker (the generator inserts it).
const catalogues = {
  en: () =>
    Promise.all([
      import('@/messages/en.json'),
      import('@/features/auth/messages/en.json'),
      import('@/features/users/messages/en.json'),
      import('@/features/roles/messages/en.json'),
    ]),
  vi: () =>
    Promise.all([
      import('@/messages/vi.json'),
      import('@/features/auth/messages/vi.json'),
      import('@/features/users/messages/vi.json'),
      import('@/features/roles/messages/vi.json'),
    ]),
} satisfies Record<Locale, () => Promise<{ default: object }[]>>;

export async function loadMessages(locale: Locale): Promise<Messages> {
  const parts = await catalogues[locale]();
  return Object.assign({}, ...parts.map((p) => p.default));
}
