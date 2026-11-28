import { requireSession } from '@/lib/auth/session';

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  await requireSession();
  return children;
}
