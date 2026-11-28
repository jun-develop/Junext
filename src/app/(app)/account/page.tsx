import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SignOutOthersButton } from '@/features/auth/components/account-actions';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { ProfileForm } from '@/features/auth/components/profile-form';
import { SessionsList } from '@/features/auth/components/sessions-list';
import { listSessions } from '@/features/auth/data';
import { requireSession } from '@/lib/auth/session';

export default async function AccountPage() {
  const [{ user }, sessions, t] = await Promise.all([
    requireSession(),
    listSessions(),
    getTranslations('account'),
  ]);
  const hasOtherSessions = sessions.some((session) => !session.current);

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('profile')}</CardTitle>
            <CardDescription>{t('profile_hint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('password')}</CardTitle>
            <CardDescription>{t('password_hint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
        <Card id="sessions" className="scroll-mt-20 lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('sessions')}</CardTitle>
            <CardDescription>{t('sessions_hint', { count: sessions.length })}</CardDescription>
            {hasOtherSessions && (
              <CardAction>
                <SignOutOthersButton />
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            <SessionsList sessions={sessions} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
