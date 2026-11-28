'use client';

import { RotateCwIcon, TriangleAlertIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

// ErrorState is the fallback of the error boundaries: what failed is hidden in production, and the
// digest matches the server log line.
export function ErrorState({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations('common.error_page');
  const digest = error instanceof Error && 'digest' in error ? String(error.digest) : null;

  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{t('title')}</EmptyTitle>
        <EmptyDescription>{t('description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={retry}>
          <RotateCwIcon />
          {t('retry')}
        </Button>
        {digest && (
          <p className="text-muted-foreground font-mono text-xs">{t('reference', { digest })}</p>
        )}
      </EmptyContent>
    </Empty>
  );
}
