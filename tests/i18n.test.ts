import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VALIDATION_KEYS } from '@/core/validation';
import { LOCALES } from '@/i18n/config';

const SRC = resolve(import.meta.dirname, '../src');
const FEATURES = join(SRC, 'features');

/** Message catalogues: shared (src/messages) plus one per feature (src/features/<f>/messages). */
const catalogueDirs = [
  join(SRC, 'messages'),
  ...(existsSync(FEATURES) ? readdirSync(FEATURES).map((f) => join(FEATURES, f, 'messages')) : []),
].filter(existsSync);

function flatKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => flatKeys(v, prefix ? `${prefix}.${k}` : k));
}

const load = (dir: string, locale: string): unknown =>
  JSON.parse(readFileSync(join(dir, `${locale}.json`), 'utf8'));

describe('i18n catalogues', () => {
  it.each(catalogueDirs)('%s: every locale has the same keys', (dir) => {
    const [base, ...rest] = LOCALES.map((l) => flatKeys(load(dir, l)).sort());
    for (const keys of rest) expect(keys).toEqual(base);
  });

  it.each(LOCALES)('%s has a message for every validation key', (locale) => {
    const keys = new Set(flatKeys(load(join(SRC, 'messages'), locale)));
    expect(VALIDATION_KEYS.filter((k) => !keys.has(k))).toEqual([]);
  });
});
