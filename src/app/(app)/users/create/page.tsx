import { getTranslations } from 'next-intl/server';
import { listAllRoles } from '@/features/roles/data';
import { createUser } from '@/features/users/actions';
import { UserForm } from '@/features/users/components/user-form';
import { requirePermission } from '@/lib/auth/session';

export default async function CreateUserPage() {
  const [session, t] = await Promise.all([
    requirePermission('users:create'),
    getTranslations('users'),
  ]);
  const canAssign =
    session.permissions.includes('roles:assign') && session.permissions.includes('roles:read');

  return (
    <UserForm
      action={createUser}
      isEdit={false}
      header={{
        title: t('create_title'),
        description: t('create_description'),
        back: { href: '/users', label: t('back_to_list') },
      }}
      roleOptions={canAssign ? await listAllRoles() : null}
      isSelf={false}
    />
  );
}
