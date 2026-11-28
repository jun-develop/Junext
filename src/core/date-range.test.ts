import { describe, expect, it } from 'vitest';
import { localDay, localDayEnd, localDayStart } from './date-range';

describe('date range helpers', () => {
  it.each(['2026-01-01', '2026-11-28', '2026-12-31'])('round-trips %s', (day) => {
    expect(localDay(localDayStart(day))).toBe(day);
    expect(localDay(localDayEnd(day))).toBe(day);
  });

  it('ends a day at its last microsecond', () => {
    expect(localDayEnd('2026-11-28')).toMatch(/\.999999Z$/);
  });
});
