'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { SubmitButton } from '@/components/form-section';
import { PasswordInput } from '@/components/password-input';
import { PasswordRules } from '@/components/password-rules';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { translateKey } from '@/core/i18n';
import { translateIssue } from '@/core/validation';
import { resetPassword } from '@/features/auth/actions';

type ResetPasswordFormProps = { token: string };

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations();
  const [password, setPassword] = useState('');
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  const fieldErrors = state?.error.fieldErrors ?? {};
  const fieldError = (name: string) => {
    const message = fieldErrors[name];
    return message ? translateIssue(message, t) : undefined;
  };
  // A missing token, or one Jungo rejects as used or expired, cannot be fixed on this page.
  const isLinkInvalid =
    token === '' || state?.error.reason === 'invalid_reset_token' || !!fieldErrors.token;
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const reason = state && !hasFieldErrors ? state.error.reason : null;
  const formError = reason && (translateKey(t, `api_errors.${reason}`) ?? t('api_errors.unknown'));

  if (isLinkInvalid) {
    return (
      <div className="flex flex-col gap-6">
        <Alert variant="destructive">
          <AlertTitle>{t('auth.reset_link_invalid_title')}</AlertTitle>
          <AlertDescription>{t('auth.reset_link_invalid_description')}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/forgot-password">{t('auth.request_new_link')}</Link>
        </Button>
        <Button variant="link" className="text-muted-foreground" asChild>
          <Link href="/login">
            <ArrowLeftIcon />
            {t('auth.back_to_sign_in')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('auth.reset_password_title')}</h1>
        <p className="text-muted-foreground text-sm">{t('auth.reset_password_description')}</p>
      </div>
      <form action={formAction} noValidate>
        <input type="hidden" name="token" value={token} />
        <FieldGroup>
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={!!fieldError('password')}>
            <FieldLabel htmlFor="password">{t('auth.new_password')}</FieldLabel>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={!!fieldError('password')}
              aria-describedby="password-rules"
            />
          </Field>
          <PasswordRules
            id="password-rules"
            password={password}
            isInvalid={!!fieldError('password')}
          />
          <Field data-invalid={!!fieldError('confirm_password')}>
            <FieldLabel htmlFor="confirm_password">{t('auth.confirm_new_password')}</FieldLabel>
            <PasswordInput
              id="confirm_password"
              name="confirm_password"
              autoComplete="new-password"
              aria-invalid={!!fieldError('confirm_password')}
            />
            <FieldError>{fieldError('confirm_password')}</FieldError>
          </Field>
          <SubmitButton
            isPending={isPending}
            label={t('auth.reset_password')}
            pendingLabel={t('common.saving')}
          />
        </FieldGroup>
      </form>
    </div>
  );
}
