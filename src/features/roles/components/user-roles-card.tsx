import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listUserRoles } from '@/features/roles/data';

// UserRolesCard lists a user's roles on the user page; roles are changed in the user form.
export async function UserRolesCard({ userUuid }: { userUuid: string }) {
  const [t, assigned] = await Promise.all([getTranslations('roles'), listUserRoles(userUuid)]);
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        {assigned.length === 0 && <p className="text-muted-foreground text-sm">{t('no_roles')}</p>}
        {assigned.map((role) => (
          <Badge key={role.uuid} variant="secondary">
            {role.name}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}
