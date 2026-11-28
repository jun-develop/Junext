import { getTranslations } from 'next-intl/server';
import { createRole } from '@/features/roles/actions';
import { RoleForm } from '@/features/roles/components/role-form';
import { requirePermission } from '@/lib/auth/session';

export default async function CreateRolePage() {
  const [session, t] = await Promise.all([
    requirePermission('roles:create'),
    getTranslations('roles'),
  ]);
  return (
    <RoleForm
      action={createRole}
      isEdit={false}
      header={{
        title: t('create_title'),
        description: t('create_description'),
        back: { href: '/roles', label: t('back_to_list') },
      }}
      grantable={session.permissions}
    />
  );
}
