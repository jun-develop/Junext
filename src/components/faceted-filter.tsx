'use client';

import { CheckIcon, PlusCircleIcon, XIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { hrefWithParams, searchParamsRecord } from '@/core/url';
import { cn } from '@/lib/utils';

type FacetedFilterProps = {
  // URL parameter the filter writes, such as "role_uuid".
  param: string;
  title: string;
  options: { value: string; label: string }[];
  selected: readonly string[];
  // A single-value filter replaces the choice instead of adding to it.
  isMulti?: boolean;
};

// Badges show each choice until this many are picked, then a count.
const MAX_LISTED_CHOICES = 2;

// FacetedFilter is a toolbar filter (shadcn-admin style): a dashed button that opens a searchable
// checklist and writes the choice to the URL, going back to page 1.
export function FacetedFilter({
  param,
  title,
  options,
  selected,
  isMulti = true,
}: FacetedFilterProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function apply(next: readonly string[]) {
    const current = searchParamsRecord(searchParams);
    router.push(`${pathname}${hrefWithParams(current, { [param]: next, page: undefined })}`);
  }

  function handleSelect(value: string) {
    if (selected.includes(value)) {
      apply(selected.filter((entry) => entry !== value));
      return;
    }
    apply(isMulti ? [...selected, value] : [value]);
  }

  const chosen = options.filter((option) => selected.includes(option.value));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircleIcon />
          {title}
          {chosen.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 data-vertical:h-4" />
              {chosen.length > MAX_LISTED_CHOICES ? (
                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                  {t('selected_count', { count: chosen.length })}
                </Badge>
              ) : (
                chosen.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {option.label}
                  </Badge>
                ))
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>{t('no_results')}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <span
                      className={cn(
                        'border-primary flex size-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className="text-primary-foreground size-3.5" />
                    </span>
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {chosen.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => apply([])} className="justify-center text-center">
                    {t('clear_filter')}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ResetFilters clears every filter of a list (search included) and returns to page 1.
export function ResetFilters({ params }: { params: readonly string[] }) {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasFilters = params.some((param) => searchParams.has(param));
  if (!hasFilters) {
    return null;
  }

  function handleClick() {
    const cleared = Object.fromEntries(params.map((param) => [param, undefined]));
    router.push(
      `${pathname}${hrefWithParams(searchParamsRecord(searchParams), { ...cleared, page: undefined })}`,
    );
  }

  return (
    <Button variant="ghost" size="sm" className="h-8" onClick={handleClick}>
      {t('reset_filters')}
      <XIcon />
    </Button>
  );
}
