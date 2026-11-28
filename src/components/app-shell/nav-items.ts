import {
  HistoryIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';
import type { Messages } from 'next-intl';
import type { PermissionCode } from '@/lib/auth/session';

type NavLabel = Exclude<keyof Messages['nav'], 'groups'>;

export type NavItem = {
  href: string;
  label: NavLabel;
  icon: LucideIcon;
  permission?: PermissionCode;
};
export type NavGroup = { label: keyof Messages['nav']['groups']; items: NavItem[] };

// Each feature adds its entry to a group (the generator inserts it before the marker).
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'general',
    items: [
      { href: '/dashboard', label: 'dashboard', icon: LayoutDashboardIcon },
      { href: '/users', label: 'users', icon: UsersIcon, permission: 'users:read' },
      { href: '/roles', label: 'roles', icon: ShieldCheckIcon, permission: 'roles:read' },
      {
        href: '/audit-logs',
        label: 'audit_logs',
        icon: HistoryIcon,
        permission: 'audit_logs:read',
      },
      /* junext:nav */
    ],
  },
];

// visibleNavGroups hides links the user cannot open; pages still check the permission on the server.
export function visibleNavGroups(permissions: PermissionCode[]): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || permissions.includes(item.permission)),
  })).filter((group) => group.items.length > 0);
}

// activeNavItem returns the entry whose section contains the path, so /users/1/edit matches /users.
export function activeNavItem(pathname: string): NavItem | undefined {
  return NAV_GROUPS.flatMap((group) => group.items).find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
