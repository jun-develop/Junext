import { getTranslations } from 'next-intl/server';
import { listAllRoles } from '@/features/roles/data';
import { updateUser } from '@/features/users/actions';
import { UserForm } from '@/features/users/components/user-form';
import { getUser } from '@/features/users/data';
import { requirePermission } from '@/lib/auth/session';

export default async function EditUserPage({ params }: PageProps<'/users/[uuid]/edit'>) {
  const { uuid } = await params;
  const session = await requirePermission('users:update');
  const canAssign =
    session.permissions.includes('roles:assign') && session.permissions.includes('roles:read');
  const [user, t, roles] = await Promise.all([
    getUser(uuid),
    getTranslations('users'),
    canAssign ? listAllRoles() : null,
  ]);

  return (
    <UserForm
      action={updateUser.bind(null, user.uuid)}
      isEdit
      header={{
        title: t('edit_title'),
        description: `${user.first_name} ${user.last_name} · ${user.email}`,
        back: { href: `/users/${user.uuid}`, label: t('back_to_user') },
      }}
      defaultValues={{
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number ?? '',
        status: user.status,
        avatar_url: user.avatar_url,
        role_uuids: user.roles.map((role) => role.uuid),
      }}
      roleOptions={roles}
      isSelf={session.user.uuid === user.uuid}
    />
  );
}
