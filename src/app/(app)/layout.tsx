import { cookies } from 'next/headers';
import { AppHeader } from '@/components/app-shell/app-header';
import { AppSidebar } from '@/components/app-shell/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ProfileMenu, UserMenu } from '@/features/auth/components/user-menu';
import { requireSession } from '@/lib/auth/session';

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const [session, cookieStore] = await Promise.all([requireSession(), cookies()]);
  // The sidebar component remembers its collapsed state in this cookie.
  const isSidebarOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <AppSidebar footer={<UserMenu user={session.user} />} permissions={session.permissions} />
      <SidebarInset>
        <AppHeader
          permissions={session.permissions}
          profile={<ProfileMenu user={session.user} />}
        />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 sm:gap-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
