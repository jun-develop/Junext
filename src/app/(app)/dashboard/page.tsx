import { getFormatter, getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';

export default async function DashboardPage() {
  const [{ user, session, permissions }, t, format] = await Promise.all([
    requireSession(),
    getTranslations('dashboard'),
    getFormatter(),
  ]);

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('greeting', { name: user.first_name })}</p>
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>{t('account')}</CardDescription>
            <CardTitle className="truncate">{user.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={user.active ? 'secondary' : 'destructive'}>
              {user.active ? t('active') : t('inactive')}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{t('session_started')}</CardDescription>
            <CardTitle>
              {format.dateTime(new Date(session.created_at), {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {t('session_ip', { ip: session.ip_address ?? '—' })}
          </CardContent>
        </Card>
        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardDescription>{t('permissions')}</CardDescription>
            <CardTitle>{t('permission_count', { count: permissions.length })}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {permissions.map((permission) => (
              <Badge key={permission} variant="outline" className="font-mono">
                {permission}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
