import type { ReactNode } from 'react';
import { CommandMenu } from '@/components/command-menu';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { PermissionCode } from '@/lib/auth/session';

type AppHeaderProps = { permissions: PermissionCode[]; profile: ReactNode };

export function AppHeader({ permissions, profile }: AppHeaderProps) {
  return (
    <header className="bg-background/80 sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 rounded-t-xl px-4 backdrop-blur-lg sm:gap-4">
      <SidebarTrigger variant="outline" />
      <Separator orientation="vertical" className="my-auto data-vertical:h-6" />
      <CommandMenu permissions={permissions} />
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
        {profile}
      </div>
    </header>
  );
}
