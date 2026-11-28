'use client';

import { LanguagesIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { setLocale } from '@/i18n/actions';
import { LOCALES } from '@/i18n/config';

export function LocaleSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    startTransition(() => setLocale(next));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending} aria-label={t('language')}>
          <LanguagesIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={locale} onValueChange={handleChange}>
          {LOCALES.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {t(`locale_names.${option}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
