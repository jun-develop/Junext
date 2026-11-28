'use client';

import { SaveIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type FormEvent, startTransition, useActionState } from 'react';
import { toast } from 'sonner';
import { AvatarField } from '@/components/avatar-field';
import { RequiredMark, SubmitButton } from '@/components/form-section';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { translateKey } from '@/core/i18n';
import { translateIssue } from '@/core/validation';
import { type ProfileFormState, updateProfile } from '@/features/auth/actions';
import type { Session } from '@/lib/auth/session';

type ProfileFormProps = {
  user: Pick<Session['user'], 'first_name' | 'last_name' | 'phone_number' | 'avatar_url'>;
};

// ProfileForm edits the signed-in user's own name, phone number and picture.
export function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations();
  const [state, formAction, isPending] = useActionState(
    async (previous: ProfileFormState, formData: FormData) => {
      const next = await updateProfile(previous, formData);
      if (next?.status === 'success') {
        if (next.warning) {
          const detail = translateKey(t, `api_errors.${next.warning}`) ?? t('api_errors.unknown');
          toast.warning(t('account.saved_with_warning', { detail }));
        } else {
          toast.success(t('account.profile_saved'));
        }
      }
      return next;
    },
    null,
  );

  // Submitting through onSubmit skips React's form reset, so a failed save keeps what was typed.
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
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

  const textField = (
    name: 'first_name' | 'last_name' | 'phone_number',
    options: { autoComplete: string; isRequired?: boolean; isWide?: boolean },
  ) => (
    <Field
      data-invalid={!!fieldError(name)}
      className={options.isWide ? 'sm:col-span-2' : undefined}
    >
      <FieldLabel htmlFor={`profile-${name}`}>
        {t(`account.fields.${name}`)} {options.isRequired && <RequiredMark />}
      </FieldLabel>
      <Input
        id={`profile-${name}`}
        name={name}
        type={name === 'phone_number' ? 'tel' : 'text'}
        autoComplete={options.autoComplete}
        defaultValue={user[name] ?? ''}
        aria-invalid={!!fieldError(name)}
      />
      <FieldError>{fieldError(name)}</FieldError>
    </Field>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6">
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <Field data-invalid={!!fieldError('avatar')}>
        <FieldLabel htmlFor="avatar">{t('account.fields.avatar')}</FieldLabel>
        <AvatarField
          currentUrl={user.avatar_url}
          initials={initials}
          isInvalid={!!fieldError('avatar')}
        />
        <FieldError>{fieldError('avatar')}</FieldError>
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        {textField('first_name', { autoComplete: 'given-name', isRequired: true })}
        {textField('last_name', { autoComplete: 'family-name', isRequired: true })}
        {textField('phone_number', { autoComplete: 'tel', isWide: true })}
      </div>
      <div className="flex justify-end">
        <SubmitButton
          isPending={isPending}
          icon={<SaveIcon />}
          label={t('common.save_changes')}
          pendingLabel={t('common.saving')}
        />
      </div>
    </form>
  );
}
