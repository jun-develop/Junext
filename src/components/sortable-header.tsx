import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { hrefWithParams, type SearchParamsRecord } from '@/core/url';

type SortableHeaderProps = {
  label: string;
  field: string;
  searchParams: SearchParamsRecord & { sort_by: string; sort_order: 'asc' | 'desc' };
};

// SortableHeader is a column title link: the first click sorts ascending, the next one descending.
export function SortableHeader({ label, field, searchParams }: SortableHeaderProps) {
  const isActive = searchParams.sort_by === field;
  const nextOrder = isActive && searchParams.sort_order === 'asc' ? 'desc' : 'asc';
  const icon = (() => {
    if (!isActive) {
      return <ChevronsUpDownIcon className="text-muted-foreground" />;
    }
    return searchParams.sort_order === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />;
  })();

  return (
    <Button variant="ghost" size="sm" className="-ml-2 h-8" asChild>
      <Link
        href={hrefWithParams(searchParams, { sort_by: field, sort_order: nextOrder, page: 1 })}
        aria-sort={isActive ? `${searchParams.sort_order}ending` : undefined}
      >
        {label}
        {icon}
      </Link>
    </Button>
  );
}
