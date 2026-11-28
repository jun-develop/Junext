import { BoxesIcon } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { safeRedirectPath } from '@/core/redirect';
import { LoginForm } from '@/features/auth/components/login-form';
import { getSession } from '@/lib/auth/session';

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { next } = await searchParams;
  const nextPath = safeRedirectPath(typeof next === 'string' ? next : null);

  if (await getSession()) {
    redirect(nextPath ?? '/dashboard');
  }

  const t = await getTranslations('common');
  const brand = (
    <div className="flex items-center gap-2 font-semibold">
      <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
        <BoxesIcon className="size-4" />
      </div>
      {t('app_name')}
    </div>
  );

  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          {brand}
          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <main className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm next={nextPath} />
          </div>
        </main>
      </div>
      <aside className="bg-muted relative hidden flex-col justify-end overflow-hidden border-l p-10 lg:flex">
        {/* A dot grid from the theme's border colour; Tailwind has no utility for patterns. */}
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] [background-size:20px_20px]" />
        <div className="relative space-y-2">
          <p className="text-2xl font-semibold tracking-tight">{t('app_subtitle')}</p>
          <p className="text-muted-foreground max-w-md">{t('app_tagline')}</p>
        </div>
      </aside>
    </div>
  );
}
