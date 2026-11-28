import { HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { GoBackButton } from './go-back-button';

type StatusPageProps = { code: number; title: string; description: string };

// StatusPage is the full-page answer for 403 and 404 (shadcn-admin's error pages): the code, a
// title, what happened, and ways out.
export function StatusPage({ code, title, description }: StatusPageProps) {
  const t = useTranslations('common.status_page');
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-8xl leading-tight font-bold tracking-tight">{code}</p>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground max-w-md">{description}</p>
      <div className="mt-6 flex gap-3">
        <GoBackButton label={t('back')} />
        <Button asChild>
          <Link href="/dashboard">
            <HomeIcon />
            {t('home')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
