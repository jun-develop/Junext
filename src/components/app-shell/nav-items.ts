import { LayoutDashboardIcon, type LucideIcon } from 'lucide-react';
import type { Messages } from 'next-intl';

export type NavItem = {
  href: string;
  label: Exclude<keyof Messages['nav'], 'label'>;
  icon: LucideIcon;
};

// Each feature adds its entry here (the generator inserts it before the marker).
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'dashboard', icon: LayoutDashboardIcon },
  /* junext:nav */
];

// activeNavItem returns the entry whose section contains the path, so /users/1/edit matches /users.
export function activeNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
