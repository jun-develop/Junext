'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { signOut } from '@/features/auth/actions';

export function SignOutButton() {
  return (
    <form action={signOut}>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const t = useTranslations('auth');
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? t('signing_out') : t('sign_out')}
    </Button>
  );
}
