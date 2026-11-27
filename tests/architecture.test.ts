import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'src');

const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((f) => /\.(ts|tsx)$/.test(f))
  .map((f) => ({ path: f.replaceAll('\\', '/'), code: readFileSync(join(SRC, f), 'utf8') }));

/** Import targets of a file, normalised to "src/..." for "@/" and relative imports. */
function importsOf(file: { path: string; code: string }): string[] {
  const specs = [
    ...file.code.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g),
  ].map((m) => m[1] ?? '');
  return specs.map((s) => {
    if (s.startsWith('@/')) return `src/${s.slice(2)}`;
    if (s.startsWith('.'))
      return relative(ROOT, resolve(SRC, dirname(file.path), s)).replaceAll('\\', '/');
    return s;
  });
}

const featureOf = (p: string) => /^src\/features\/([^/]+)/.exec(p)?.[1];

function violations(rule: (from: string, to: string) => boolean) {
  return files.flatMap((f) =>
    importsOf(f)
      .filter((to) => rule(`src/${f.path}`, to))
      .map((to) => `src/${f.path} -> ${to}`),
  );
}

describe('architecture boundaries', () => {
  it('core imports only core and packages, so it can become a package', () => {
    expect(
      violations(
        (from, to) =>
          from.startsWith('src/core/') && to.startsWith('src/') && !to.startsWith('src/core/'),
      ),
    ).toEqual([]);
  });

  it('lib, components and hooks never import features or app', () => {
    expect(
      violations(
        (from, to) =>
          /^src\/(lib|components|hooks)\//.test(from) && /^src\/(features|app)\//.test(to),
      ),
    ).toEqual([]);
  });

  it('features never import another feature', () => {
    expect(
      violations((from, to) => {
        const a = featureOf(from);
        const b = featureOf(to);
        return !!a && !!b && a !== b;
      }),
    ).toEqual([]);
  });

  it('only core/validation imports zod directly', () => {
    expect(
      violations(
        (from, to) => (to === 'zod' || to.startsWith('zod/')) && from !== 'src/core/validation.ts',
      ),
    ).toEqual([]);
  });

  it('reads process.env only in env files and instrumentation', () => {
    const allowed = /(^|\/)env\.ts$|^instrumentation\.ts$/;
    expect(
      files
        .filter((f) => f.code.includes('process.env') && !allowed.test(f.path))
        .map((f) => f.path),
    ).toEqual([]);
  });
});
