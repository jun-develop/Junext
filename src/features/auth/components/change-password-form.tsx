'use client';

import { KeyRoundIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type FormEvent, startTransition, useActionState, useRef, useState } from 'react';
import { toast } from 'sonner';
import { SubmitButton } from '@/components/form-section';
import { PasswordInput } from '@/components/password-input';
import { PasswordRules } from '@/components/password-rules';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { translateKey } from '@/core/i18n';
import { translateIssue } from '@/core/validation';
import { type ChangePasswordState, changePassword } from '@/features/auth/actions';

// ChangePasswordForm changes the signed-in user's password; Jungo then signs out other devices.
export function ChangePasswordForm() {
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  const [password, setPassword] = useState('');
  const [state, formAction, isPending] = useActionState(
    async (previous: ChangePasswordState, formData: FormData) => {
      const next = await changePassword(previous, formData);
      if (next?.status === 'success') {
        toast.success(t('account.password_changed'));
        formRef.current?.reset();
        setPassword('');
      }
      return next;
    },
    null,
  );

  // onSubmit keeps the fields after a failed attempt; a success clears them above.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const failed = state?.status === 'error' ? state : null;
  const fieldErrors = failed?.error.fieldErrors ?? {};
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const reason = failed && !hasFieldErrors ? failed.error.reason : null;
  const formError = reason && (translateKey(t, `api_errors.${reason}`) ?? t('api_errors.unknown'));
  const fieldError = (name: string) => {
    const message = fieldErrors[name];
    return message ? translateIssue(message, t) : undefined;
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="grid gap-6">
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <Field data-invalid={!!fieldError('current_password')}>
        <FieldLabel htmlFor="current_password">{t('account.fields.current_password')}</FieldLabel>
        <PasswordInput
          id="current_password"
          name="current_password"
          autoComplete="current-password"
          aria-invalid={!!fieldError('current_password')}
        />
        <FieldError>{fieldError('current_password')}</FieldError>
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field data-invalid={!!fieldError('password')}>
          <FieldLabel htmlFor="new_password">{t('auth.new_password')}</FieldLabel>
          <PasswordInput
            id="new_password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={!!fieldError('password')}
            aria-describedby="new-password-rules"
          />
          {fieldErrors.password?.startsWith('api_errors.') && (
            <FieldError>{fieldError('password')}</FieldError>
          )}
        </Field>
        <Field data-invalid={!!fieldError('confirm_password')}>
          <FieldLabel htmlFor="confirm_new_password">{t('auth.confirm_new_password')}</FieldLabel>
          <PasswordInput
            id="confirm_new_password"
            name="confirm_password"
            autoComplete="new-password"
            aria-invalid={!!fieldError('confirm_password')}
          />
          <FieldError>{fieldError('confirm_password')}</FieldError>
        </Field>
        <PasswordRules
          id="new-password-rules"
          password={password}
          isInvalid={!!fieldError('password')}
        />
      </div>
      <div className="flex justify-end">
        <SubmitButton
          isPending={isPending}
          icon={<KeyRoundIcon />}
          label={t('account.change_password')}
          pendingLabel={t('common.saving')}
        />
      </div>
    </form>
  );
}
