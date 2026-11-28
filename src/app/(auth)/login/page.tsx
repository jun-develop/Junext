import { redirect } from 'next/navigation';
import { safeRedirectPath } from '@/core/redirect';
import { LoginForm } from '@/features/auth/components/login-form';
import { getSession } from '@/lib/auth/session';

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { next } = await searchParams;
  const nextPath = safeRedirectPath(typeof next === 'string' ? next : null);

  if (await getSession()) {
    redirect(nextPath ?? '/dashboard');
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <LoginForm next={nextPath} />
    </main>
  );
}
