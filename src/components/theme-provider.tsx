'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

// next-themes 0.4 renders its no-flash <script> from a client component, which React 19 warns about.
// The server copy still runs before paint; on the client it becomes inert JSON, so React skips it.
const SCRIPT_PROPS = typeof window === 'undefined' ? undefined : { type: 'application/json' };

// ThemeProvider is next-themes' provider without React's "script tag while rendering" warning.
export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider scriptProps={SCRIPT_PROPS} {...props} />;
}
