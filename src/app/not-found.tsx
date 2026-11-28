import { useTranslations } from 'next-intl';
import { StatusPage } from '@/components/status-page';

export default function NotFound() {
  const t = useTranslations('common.not_found');
  return (
    <main className="flex min-h-svh flex-1 p-6">
      <StatusPage code={404} title={t('title')} description={t('description')} />
    </main>
  );
}
