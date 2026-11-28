import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import { updateUser } from '@/features/users/actions';
import { UserForm } from '@/features/users/components/user-form';
import { getUser } from '@/features/users/data';
import { requirePermission } from '@/lib/auth/session';

export default async function EditUserPage({ params }: PageProps<'/users/[uuid]/edit'>) {
  const { uuid } = await params;
  await requirePermission('users:update');
  const [user, t] = await Promise.all([getUser(uuid), getTranslations('users')]);

  return (
    <>
      <PageHeader
        title={t('edit_title')}
        description={`${user.first_name} ${user.last_name} · ${user.email}`}
      />
      <UserForm
        action={updateUser.bind(null, user.uuid)}
        defaultValues={{
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number ?? '',
          status: user.status,
        }}
        isEdit
        cancelHref={`/users/${user.uuid}`}
      />
    </>
  );
}
