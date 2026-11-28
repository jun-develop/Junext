export type SearchParamsRecord = Record<string, string | number | undefined>;

// hrefWithParams returns a query string for the current params with changes applied; empty values
// are dropped so URLs stay short.
export function hrefWithParams(current: SearchParamsRecord, changes: SearchParamsRecord): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...current, ...changes })) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : '?';
}
