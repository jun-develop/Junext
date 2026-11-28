'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { translateKey } from '@/core/i18n';
import { translateIssue } from '@/core/validation';
import { signIn } from '@/features/auth/actions';

type LoginFormProps = { next: string | null };

export function LoginForm({ next }: LoginFormProps) {
  const t = useTranslations();
  const [state, formAction, isPending] = useActionState(signIn, null);
  const fieldErrors = state?.error.fieldErrors ?? {};
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const reason = state && !hasFieldErrors ? state.error.reason : null;
  const formError = reason && (translateKey(t, `api_errors.${reason}`) ?? t('api_errors.unknown'));

  const fieldError = (name: string) => {
    const message = fieldErrors[name];
    return message ? translateIssue(message, t) : undefined;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('auth.sign_in_title')}</h1>
        <p className="text-muted-foreground text-sm">{t('auth.sign_in_description')}</p>
      </div>
      <form action={formAction} noValidate>
        {next && <input type="hidden" name="next" value={next} />}
        <FieldGroup>
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={!!fieldError('email')}>
            <FieldLabel htmlFor="email">{t('auth.email')}</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state?.email}
              aria-invalid={!!fieldError('email')}
              required
            />
            <FieldError>{fieldError('email')}</FieldError>
          </Field>
          <Field data-invalid={!!fieldError('password')}>
            <FieldLabel htmlFor="password">{t('auth.password')}</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!fieldError('password')}
              required
            />
            <FieldError>{fieldError('password')}</FieldError>
          </Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? t('auth.signing_in') : t('auth.sign_in')}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
