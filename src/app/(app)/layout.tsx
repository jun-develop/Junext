import { cookies } from 'next/headers';
import { AppHeader } from '@/components/app-shell/app-header';
import { AppSidebar } from '@/components/app-shell/app-sidebar';
import {
  SIDEBAR_COLLAPSIBLE_COOKIE,
  SIDEBAR_VARIANT_COOKIE,
  sidebarCollapsibleSchema,
  sidebarVariantSchema,
} from '@/components/app-shell/layout-preferences';
import { ThemeSettings } from '@/components/app-shell/theme-settings';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ProfileMenu, UserMenu } from '@/features/auth/components/user-menu';
import { requireSession } from '@/lib/auth/session';

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const [session, cookieStore] = await Promise.all([requireSession(), cookies()]);
  // The sidebar component remembers its collapsed state in this cookie.
  const isSidebarOpen = cookieStore.get('sidebar_state')?.value !== 'false';
  const variant = sidebarVariantSchema.parse(cookieStore.get(SIDEBAR_VARIANT_COOKIE)?.value);
  const collapsible = sidebarCollapsibleSchema.parse(
    cookieStore.get(SIDEBAR_COLLAPSIBLE_COOKIE)?.value,
  );

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <AppSidebar
        footer={<UserMenu user={session.user} />}
        permissions={session.permissions}
        variant={variant}
        collapsible={collapsible}
      />
      {/* shadcn frames the content only for the inset style; give the floating style the same card as its sidebar. */}
      <SidebarInset className="md:peer-data-[variant=floating]:ring-sidebar-border md:peer-data-[variant=floating]:m-2 md:peer-data-[variant=floating]:ml-0 md:peer-data-[variant=floating]:rounded-lg md:peer-data-[variant=floating]:shadow-sm md:peer-data-[variant=floating]:ring-1 md:peer-data-[variant=floating]:peer-data-[state=collapsed]:ml-2">
        <AppHeader
          permissions={session.permissions}
          variant={variant}
          settings={<ThemeSettings variant={variant} collapsible={collapsible} />}
          profile={<ProfileMenu user={session.user} />}
        />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 sm:gap-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
