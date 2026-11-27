import { describe, expect, it } from 'vitest';
import { parseEnv } from './env';

const URL_ONLY = { JUNGO_API_URL: 'http://localhost:8080' };

describe('parseEnv', () => {
  it('applies defaults', () => {
    expect(parseEnv(URL_ONLY)).toMatchObject({
      JUNGO_TIMEOUT_MS: 10_000,
      TRUST_PROXY_HEADERS: false,
      DEFAULT_LOCALE: 'en',
    });
  });

  it('parses "false" as false, not as a truthy string', () => {
    expect(parseEnv({ ...URL_ONLY, COOKIE_SECURE: 'false' }).COOKIE_SECURE).toBe(false);
  });

  it('fails with the variable name when JUNGO_API_URL is missing', () => {
    expect(() => parseEnv({})).toThrow(/JUNGO_API_URL/);
  });

  it('rejects a non-numeric timeout', () => {
    expect(() => parseEnv({ ...URL_ONLY, JUNGO_TIMEOUT_MS: 'abc' })).toThrow(/JUNGO_TIMEOUT_MS/);
  });
});
