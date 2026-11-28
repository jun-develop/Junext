'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { hrefWithParams, searchParamsRecord } from '@/core/url';

const DEBOUNCE_MS = 300;

// TableSearch filters a list as the user types by updating ?search= and going back to page 1.
// It is also a GET form, so Enter works before JavaScript loads.
export function TableSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleChange(value: string) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const current = searchParamsRecord(searchParams);
      router.replace(
        `${pathname}${hrefWithParams(current, { search: value.trim(), page: undefined })}`,
      );
    }, DEBOUNCE_MS);
  }

  return (
    <form role="search" onSubmit={(event) => event.preventDefault()}>
      <Input
        type="search"
        name="search"
        defaultValue={searchParams.get('search') ?? ''}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 w-40 lg:w-64"
        onChange={(event) => handleChange(event.target.value)}
      />
    </form>
  );
}
