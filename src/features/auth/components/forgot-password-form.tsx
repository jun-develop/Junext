'use client';

import { ArrowLeftIcon, MailCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { SubmitButton } from '@/components/form-section';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { translateKey } from '@/core/i18n';
import { translateIssue } from '@/core/validation';
import { requestPasswordReset } from '@/features/auth/actions';

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null);

  const backToSignIn = (
    <Button variant="link" className="text-muted-foreground" asChild>
      <Link href="/login">
        <ArrowLeftIcon />
        {t('auth.back_to_sign_in')}
      </Link>
    </Button>
  );

  if (state?.status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-muted flex size-12 items-center justify-center rounded-full">
          <MailCheckIcon className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t('auth.reset_sent_title')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('auth.reset_sent_description', { email: state.email })}
          </p>
        </div>
        {backToSignIn}
      </div>
    );
  }

  const failed = state?.status === 'error' ? state : null;
  const fieldErrors = failed?.error.fieldErrors ?? {};
  const emailError = fieldErrors.email ? translateIssue(fieldErrors.email, t) : undefined;
  const reason = failed && !emailError ? failed.error.reason : null;
  const formError = reason && (translateKey(t, `api_errors.${reason}`) ?? t('api_errors.unknown'));

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('auth.forgot_password_title')}</h1>
        <p className="text-muted-foreground text-sm">{t('auth.forgot_password_description')}</p>
      </div>
      <form action={formAction} noValidate>
        <FieldGroup>
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={!!emailError}>
            <FieldLabel htmlFor="email">{t('auth.email')}</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={failed?.email}
              aria-invalid={!!emailError}
              required
            />
            <FieldError>{emailError}</FieldError>
          </Field>
          <SubmitButton
            isPending={isPending}
            label={t('auth.send_reset_link')}
            pendingLabel={t('auth.sending')}
          />
        </FieldGroup>
      </form>
      <div className="flex justify-center">{backToSignIn}</div>
    </div>
  );
}
