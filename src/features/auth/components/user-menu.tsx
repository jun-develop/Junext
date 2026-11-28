'use client';

import { ChevronsUpDownIcon, LogOutIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { signOut } from '@/features/auth/actions';
import type { Session } from '@/lib/auth/session';

type UserMenuProps = {
  user: Pick<Session['user'], 'first_name' | 'last_name' | 'email' | 'avatar_url'>;
};

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations('auth');
  const [isPending, startTransition] = useTransition();
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  const identity = <UserIdentity user={user} fullName={fullName} />;

  function handleSignOut(event: Event) {
    event.preventDefault();
    startTransition(() => signOut());
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {identity}
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side="top"
            align="end"
          >
            <DropdownMenuLabel className="flex items-center gap-2 font-normal">
              {identity}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isPending} onSelect={handleSignOut}>
              <LogOutIcon />
              {isPending ? t('signing_out') : t('sign_out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function UserIdentity({ user, fullName }: UserMenuProps & { fullName: string }) {
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  return (
    <>
      <Avatar className="size-8 rounded-lg">
        {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{fullName}</span>
        <span className="text-muted-foreground truncate text-xs">{user.email}</span>
      </div>
    </>
  );
}
