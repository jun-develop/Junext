export type SearchParamsRecord = Record<string, string | number | readonly string[] | undefined>;

// hrefWithParams returns a query string for the current params with changes applied; empty values
// are dropped so URLs stay short, and a list repeats its key (?role_uuid=a&role_uuid=b).
export function hrefWithParams(current: SearchParamsRecord, changes: SearchParamsRecord): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...current, ...changes })) {
    const values = Array.isArray(value) ? value : [value];
    for (const entry of values) {
      if (entry !== undefined && entry !== '') {
        params.append(key, String(entry));
      }
    }
  }
  const query = params.toString();
  return query ? `?${query}` : '?';
}

// searchParamsRecord reads URLSearchParams into a record, keeping repeated keys as lists.
export function searchParamsRecord(searchParams: URLSearchParams): SearchParamsRecord {
  const record: Record<string, string | string[]> = {};
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    record[key] = values.length > 1 ? values : (searchParams.get(key) ?? '');
  }
  return record;
}
