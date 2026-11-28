import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { createUser } from '@/features/users/actions';
import { UserForm } from '@/features/users/components/user-form';
import { requirePermission } from '@/lib/auth/session';

export default async function CreateUserPage() {
  const [, t] = await Promise.all([requirePermission('users:create'), getTranslations('users')]);
  return (
    <>
      <PageHeader title={t('create_title')} description={t('create_description')} />
      <UserForm action={createUser} isEdit={false} cancelHref="/users" />
    </>
  );
}
