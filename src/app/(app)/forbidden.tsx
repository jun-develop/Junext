import { useTranslations } from 'next-intl';
import { StatusPage } from '@/components/status-page';

export default function AppForbidden() {
  const t = useTranslations('common.forbidden');
  return <StatusPage code={403} title={t('title')} description={t('description')} />;
}
