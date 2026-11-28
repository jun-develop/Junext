'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';
import { Input } from '@/components/ui/input';
import { localDay, localDayEnd, localDayStart } from '@/core/date-range';
import { hrefWithParams, searchParamsRecord } from '@/core/url';

const subscribeNever = () => () => {};

type DateRangeFilterProps = { from: string | undefined; to: string | undefined };

// DateRangeFilter picks calendar days and writes ?from= and ?to= as instants in the viewer's time
// zone, so "28 November" means that whole local day.
export function DateRangeFilter({ from, to }: DateRangeFilterProps) {
  const t = useTranslations('audit_logs');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Days depend on the viewer's time zone, which the server does not know: show them once in the browser.
  const isBrowser = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const dayOf = (instant: string | undefined) => (instant && isBrowser ? localDay(instant) : '');

  function apply(changes: { from?: string; to?: string }) {
    const current = searchParamsRecord(searchParams);
    router.push(`${pathname}${hrefWithParams(current, { ...changes, page: undefined })}`);
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="date"
        aria-label={t('from')}
        className="h-8 w-auto"
        value={dayOf(from)}
        max={dayOf(to) || undefined}
        onChange={(event) =>
          apply({ from: event.target.value ? localDayStart(event.target.value) : undefined })
        }
      />
      <span className="text-muted-foreground text-sm">{'–'}</span>
      <Input
        type="date"
        aria-label={t('to')}
        className="h-8 w-auto"
        value={dayOf(to)}
        min={dayOf(from) || undefined}
        onChange={(event) =>
          apply({ to: event.target.value ? localDayEnd(event.target.value) : undefined })
        }
      />
    </div>
  );
}
