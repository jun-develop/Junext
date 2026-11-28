'use client';

import { ArrowRightIcon, LaptopIcon, MoonIcon, SearchIcon, SunIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { visibleNavGroups } from '@/components/app-shell/nav-items';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import type { PermissionCode } from '@/lib/auth/session';

const THEMES = [
  { value: 'light', icon: SunIcon },
  { value: 'dark', icon: MoonIcon },
  { value: 'system', icon: LaptopIcon },
] as const;

// CommandMenu is the header search: a button and Ctrl/⌘+K open a palette of pages and theme commands.
export function CommandMenu({ permissions }: { permissions: PermissionCode[] }) {
  const t = useTranslations();
  const router = useRouter();
  const { setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Chrome autofill fires keydown without a key, so compare instead of calling key methods.
      const isK = event.key === 'k' || event.key === 'K';
      if (isK && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen((open) => !open);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  function run(command: () => void) {
    setIsOpen(false);
    command();
  }

  return (
    <>
      <Button
        variant="outline"
        className="bg-muted/25 text-muted-foreground hover:bg-accent relative h-8 w-full flex-1 justify-start rounded-md pr-12 pl-8 text-sm font-normal shadow-none sm:w-40 sm:flex-none lg:w-52 xl:w-64"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon aria-hidden className="absolute top-1/2 left-2 -translate-y-1/2" />
        {t('common.search')}
        <kbd className="bg-muted pointer-events-none absolute top-1.5 right-1.5 hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium select-none sm:flex">
          {'⌘K'}
        </kbd>
      </Button>
      <CommandDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={t('common.search')}
        description={t('common.command_placeholder')}
      >
        <Command>
          <CommandInput placeholder={t('common.command_placeholder')} />
          <CommandList>
            <CommandEmpty>{t('common.no_results')}</CommandEmpty>
            {visibleNavGroups(permissions).map((group) => (
              <CommandGroup key={group.label} heading={t(`nav.groups.${group.label}`)}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={t(`nav.${item.label}`)}
                    onSelect={() => run(() => router.push(item.href))}
                  >
                    <ArrowRightIcon className="text-muted-foreground" />
                    {t(`nav.${item.label}`)}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <CommandSeparator />
            <CommandGroup heading={t('common.theme.label')}>
              {THEMES.map((theme) => (
                <CommandItem key={theme.value} onSelect={() => run(() => setTheme(theme.value))}>
                  <theme.icon />
                  {t(`common.theme.${theme.value}`)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
