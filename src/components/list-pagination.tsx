import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { PageSizeSelect } from '@/components/page-size-select';
import { Button } from '@/components/ui/button';
import { pageWindow } from '@/core/pagination';
import { hrefWithParams, type SearchParamsRecord } from '@/core/url';
import type { components } from '@/lib/jungo-schema';

type ListPaginationProps = {
  pagination: components['schemas']['Pagination'];
  searchParams: SearchParamsRecord;
  pageSizes: readonly number[];
};

// ListPagination renders Jungo's pagination as links that keep the current filters in the URL.
export async function ListPagination({ pagination, searchParams, pageSizes }: ListPaginationProps) {
  const t = await getTranslations('common');
  const { page, page_size, total_pages } = pagination;
  const lastPage = Math.max(total_pages, 1);
  const hrefFor = (target: number) => hrefWithParams(searchParams, { page: target });

  const arrow = (target: number | null, label: string, Icon: LucideIcon, className = '') => {
    if (target === null) {
      return (
        <Button variant="outline" size="icon" className={className} disabled aria-label={label}>
          <Icon />
        </Button>
      );
    }
    return (
      <Button variant="outline" size="icon" className={className} asChild>
        <Link href={hrefFor(target)} aria-label={label}>
          <Icon />
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-4 px-2 sm:flex-row">
      <div className="flex items-center gap-2">
        <PageSizeSelect value={page_size} options={pageSizes} label={t('rows_per_page')} />
        <p className="hidden text-sm font-medium sm:block">{t('rows_per_page')}</p>
      </div>
      <div className="flex items-center gap-4 lg:gap-8">
        <p className="hidden text-sm font-medium md:block">
          {t('page_of', { page, total: lastPage })}
        </p>
        <nav aria-label={t('pagination.label')} className="flex items-center gap-2">
          {arrow(page > 1 ? 1 : null, t('pagination.first'), ChevronsLeftIcon, 'hidden md:flex')}
          {arrow(pagination.prev_page, t('pagination.previous'), ChevronLeftIcon)}
          {pageWindow(page, lastPage).map((entry, index) =>
            entry === null ? (
              <span key={`gap-${index}`} className="text-muted-foreground px-1 text-sm">
                {'…'}
              </span>
            ) : (
              <Button
                key={entry}
                variant={entry === page ? 'default' : 'outline'}
                className="min-w-8 px-2"
                asChild
              >
                <Link
                  href={hrefFor(entry)}
                  aria-label={t('pagination.page', { page: entry })}
                  aria-current={entry === page ? 'page' : undefined}
                >
                  {entry}
                </Link>
              </Button>
            ),
          )}
          {arrow(pagination.next_page, t('pagination.next'), ChevronRightIcon)}
          {arrow(
            page < lastPage ? lastPage : null,
            t('pagination.last'),
            ChevronsRightIcon,
            'hidden md:flex',
          )}
        </nav>
      </div>
    </div>
  );
}
