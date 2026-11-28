const INTERNAL_ORIGIN = 'http://internal.invalid';

// safeRedirectPath returns the path to open after sign-in, or null when it could leave the site.
export function safeRedirectPath(raw: string | null | undefined): string | null {
  if (!raw?.startsWith('/')) {
    return null;
  }
  // The URL parser normalises tricks like "//host", "/\host" or embedded tabs into another origin.
  const url = new URL(raw, INTERNAL_ORIGIN);
  if (url.origin !== INTERNAL_ORIGIN) {
    return null;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
