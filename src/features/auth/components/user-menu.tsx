'use client';

import { ChevronsUpDownIcon, LogOutIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ComponentProps, useTransition } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

// UserMenu is the account menu at the bottom of the sidebar.
export function UserMenu({ user }: UserMenuProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar user={user} />
              <UserName user={user} />
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <AccountMenuContent
            user={user}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side="top"
            align="end"
          />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// ProfileMenu is the same account menu behind the avatar in the header.
export function ProfileMenu({ user }: UserMenuProps) {
  const t = useTranslations('auth');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 rounded-full p-0" aria-label={t('account')}>
          <UserAvatar user={user} className="size-8 rounded-full" />
        </Button>
      </DropdownMenuTrigger>
      <AccountMenuContent user={user} className="w-56" align="end" />
    </DropdownMenu>
  );
}

function AccountMenuContent({
  user,
  ...props
}: UserMenuProps & ComponentProps<typeof DropdownMenuContent>) {
  const t = useTranslations('auth');
  const [isPending, startTransition] = useTransition();

  function handleSignOut(event: Event) {
    event.preventDefault();
    startTransition(() => signOut());
  }

  return (
    <DropdownMenuContent {...props}>
      <DropdownMenuLabel className="flex items-center gap-2 font-normal">
        <UserAvatar user={user} />
        <UserName user={user} />
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled={isPending} onSelect={handleSignOut}>
        <LogOutIcon />
        {isPending ? t('signing_out') : t('sign_out')}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

function UserAvatar({
  user,
  className = 'size-8 rounded-lg',
}: UserMenuProps & { className?: string }) {
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  return (
    <Avatar className={className}>
      {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
      <AvatarFallback className={className}>{initials}</AvatarFallback>
    </Avatar>
  );
}

function UserName({ user }: UserMenuProps) {
  return (
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-medium">{`${user.first_name} ${user.last_name}`.trim()}</span>
      <span className="text-muted-foreground truncate text-xs">{user.email}</span>
    </div>
  );
}
