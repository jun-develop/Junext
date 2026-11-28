import { cookies } from 'next/headers';
import { AppHeader } from '@/components/app-shell/app-header';
import { AppSidebar } from '@/components/app-shell/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserMenu } from '@/features/auth/components/user-menu';
import { requireSession } from '@/lib/auth/session';

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const [session, cookieStore] = await Promise.all([requireSession(), cookies()]);
  // The sidebar component remembers its collapsed state in this cookie.
  const isSidebarOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <AppSidebar footer={<UserMenu user={session.user} />} />
      <SidebarInset className="bg-muted/30">
        <AppHeader />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
