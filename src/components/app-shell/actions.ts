'use server';

import { cookies } from 'next/headers';
import { z } from '@/core/validation';
import {
  SIDEBAR_COLLAPSIBLE_COOKIE,
  SIDEBAR_COLLAPSIBLES,
  SIDEBAR_VARIANT_COOKIE,
  SIDEBAR_VARIANTS,
} from './layout-preferences';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const cookieOptions = { path: '/', sameSite: 'lax', maxAge: ONE_YEAR_SECONDS } as const;

const preferenceSchema = z.discriminatedUnion('name', [
  z.object({ name: z.literal(SIDEBAR_VARIANT_COOKIE), value: z.enum(SIDEBAR_VARIANTS) }),
  z.object({ name: z.literal(SIDEBAR_COLLAPSIBLE_COOKIE), value: z.enum(SIDEBAR_COLLAPSIBLES) }),
]);

// setLayoutPreference stores one sidebar preference; the layout re-renders with it.
export async function setLayoutPreference(name: string, value: string): Promise<void> {
  const preference = preferenceSchema.parse({ name, value });
  (await cookies()).set(preference.name, preference.value, cookieOptions);
}

// resetLayoutPreferences returns the sidebar to its default style and behaviour.
export async function resetLayoutPreferences(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SIDEBAR_VARIANT_COOKIE);
  cookieStore.delete(SIDEBAR_COLLAPSIBLE_COOKIE);
}
