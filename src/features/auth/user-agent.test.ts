import { describe, expect, it } from 'vitest';
import { describeUserAgent } from './user-agent';

describe('describeUserAgent', () => {
  it.each([
    [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      { browser: 'Chrome', system: 'macOS', isMobile: false },
    ],
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
      { browser: 'Edge', system: 'Windows', isMobile: false },
    ],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
      { browser: 'Safari', system: 'iOS', isMobile: true },
    ],
    [
      'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
      { browser: 'Firefox', system: 'Linux', isMobile: false },
    ],
    ['curl/8.7.1', { browser: null, system: null, isMobile: false }],
    [null, { browser: null, system: null, isMobile: false }],
  ])('%s', (userAgent, expected) => {
    expect(describeUserAgent(userAgent)).toEqual(expected);
  });
});
