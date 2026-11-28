'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { activeNavItem } from './nav-items';

export function AppHeader() {
  const t = useTranslations('nav');
  const active = activeNavItem(usePathname());

  return (
    <header className="bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="my-auto mr-2 data-vertical:h-4" />
      {active && <span className="text-sm font-medium">{t(active.label)}</span>}
      <div className="ml-auto flex items-center gap-1">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
