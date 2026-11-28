import { getTranslations } from 'next-intl/server';
import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { requireSession } from '@/lib/auth/session';

export default async function DashboardPage() {
  const [session, t] = await Promise.all([requireSession(), getTranslations('dashboard')]);
  return (
    <main className="flex flex-1 flex-col items-start gap-4 p-8">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('greeting', { name: session.user.first_name })}</p>
      <SignOutButton />
    </main>
  );
}
