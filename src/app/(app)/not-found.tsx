import { useTranslations } from 'next-intl';
import { StatusPage } from '@/components/status-page';

export default function AppNotFound() {
  const t = useTranslations('common.not_found');
  return <StatusPage code={404} title={t('title')} description={t('description')} />;
}
