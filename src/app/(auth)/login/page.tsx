import { redirect } from 'next/navigation';
import { safeRedirectPath } from '@/core/redirect';
import { LoginForm } from '@/features/auth/components/login-form';
import { getSession } from '@/lib/auth/session';

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { next, reset } = await searchParams;
  const nextPath = safeRedirectPath(typeof next === 'string' ? next : null);

  if (await getSession()) {
    redirect(nextPath ?? '/dashboard');
  }

  return <LoginForm next={nextPath} isPasswordReset={reset === 'done'} />;
}
