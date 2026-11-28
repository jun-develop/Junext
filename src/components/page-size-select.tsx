'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { hrefWithParams } from '@/core/url';

type PageSizeSelectProps = { value: number; options: readonly number[]; label: string };

export function PageSizeSelect({ value, options, label }: PageSizeSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(next: string) {
    const current = Object.fromEntries(searchParams.entries());
    router.push(`${pathname}${hrefWithParams(current, { page_size: next, page: undefined })}`);
  }

  return (
    <Select value={String(value)} onValueChange={handleChange}>
      <SelectTrigger className="w-18" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent side="top">
        {options.map((option) => (
          <SelectItem key={option} value={String(option)}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
