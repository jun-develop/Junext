import { requirePermission } from '@/lib/auth/session';

// Checking here, outside loading.tsx, answers a real 403 status before the page starts streaming;
// the page checks again before it fetches, since layouts and pages render in parallel.
export default async function UsersListLayout({ children }: LayoutProps<'/users'>) {
  await requirePermission('users:read');
  return children;
}
