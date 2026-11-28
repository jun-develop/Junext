import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { updateRole } from '@/features/roles/actions';
import { RoleForm } from '@/features/roles/components/role-form';
import { getRole } from '@/features/roles/data';
import { requirePermission } from '@/lib/auth/session';

export default async function EditRolePage({ params }: PageProps<'/roles/[uuid]/edit'>) {
  const { uuid } = await params;
  const session = await requirePermission('roles:update');
  const [role, t] = await Promise.all([getRole(uuid), getTranslations('roles')]);
  // Jungo refuses every change to a system role, so there is nothing to edit.
  if (role.is_system) {
    notFound();
  }

  return (
    <RoleForm
      action={updateRole.bind(null, role.uuid)}
      isEdit
      header={{
        title: t('edit_title'),
        description: t('edit_description', { name: role.name }),
        back: { href: `/roles/${role.uuid}`, label: t('back_to_role') },
      }}
      defaultValues={{ name: role.name, code: role.code, permissions: role.permissions }}
      grantable={session.permissions}
    />
  );
}
