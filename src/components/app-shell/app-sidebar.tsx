'use client';

import { BoxesIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import type { PermissionCode } from '@/lib/auth/session';
import type { SidebarCollapsible, SidebarVariant } from './layout-preferences';
import { activeNavItem, visibleNavGroups } from './nav-items';

type AppSidebarProps = {
  footer: ReactNode;
  permissions: PermissionCode[];
  variant: SidebarVariant;
  collapsible: SidebarCollapsible;
};

export function AppSidebar({ footer, permissions, variant, collapsible }: AppSidebarProps) {
  const t = useTranslations();
  const { setOpenMobile } = useSidebar();
  const active = activeNavItem(usePathname());

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <BoxesIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{t('common.app_name')}</span>
                  <span className="truncate text-xs">{t('common.app_subtitle')}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {visibleNavGroups(permissions).map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{t(`nav.groups.${group.label}`)}</SidebarGroupLabel>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item === active}
                    tooltip={t(`nav.${item.label}`)}
                  >
                    <Link href={item.href} onClick={() => setOpenMobile(false)}>
                      <item.icon />
                      <span>{t(`nav.${item.label}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>{footer}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
