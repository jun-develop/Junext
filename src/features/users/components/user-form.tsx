'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { translateKey } from '@/core/i18n';
import { translateIssue } from '@/core/validation';
import type { UserFormState } from '@/features/users/actions';
import type { UserFormValues } from '@/features/users/schemas';

type UserFormProps = {
  action: (previous: UserFormState, formData: FormData) => Promise<UserFormState>;
  defaultValues?: UserFormValues;
  isEdit: boolean;
  cancelHref: string;
};

export function UserForm({ action, defaultValues = {}, isEdit, cancelHref }: UserFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (previous: UserFormState, formData: FormData) => {
      const next = await action(previous, formData);
      if (next?.status === 'success') {
        toast.success(isEdit ? t('users.updated') : t('users.created'));
        router.push(`/users/${next.uuid}`);
      }
      return next;
    },
    null,
  );

  const failed = state?.status === 'error' ? state : null;
  const values = failed?.values ?? defaultValues;
  const fieldErrors = failed?.error.fieldErrors ?? {};
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const reason = failed && !hasFieldErrors ? failed.error.reason : null;
  const formError = reason && (translateKey(t, `api_errors.${reason}`) ?? t('api_errors.unknown'));

  const fieldError = (name: string) => {
    const message = fieldErrors[name];
    return message ? translateIssue(message, t) : undefined;
  };
  const textField = (name: keyof UserFormValues, type = 'text', autoComplete = 'off') => (
    <Field data-invalid={!!fieldError(name)}>
      <FieldLabel htmlFor={name}>{t(`users.fields.${name}`)}</FieldLabel>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={values[name]}
        aria-invalid={!!fieldError(name)}
      />
      <FieldError>{fieldError(name)}</FieldError>
    </Field>
  );

  return (
    <form action={formAction} noValidate>
      <Card className="max-w-2xl">
        <CardContent>
          <FieldGroup>
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-6 sm:grid-cols-2">
              {textField('first_name', 'text', 'given-name')}
              {textField('last_name', 'text', 'family-name')}
            </div>
            {!isEdit && textField('email', 'email', 'off')}
            {!isEdit && (
              <Field data-invalid={!!fieldError('password')}>
                <FieldLabel htmlFor="password">{t('users.fields.password')}</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!fieldError('password')}
                />
                {fieldError('password') ? (
                  <FieldError>{fieldError('password')}</FieldError>
                ) : (
                  <FieldDescription>{t('users.password_rule')}</FieldDescription>
                )}
              </Field>
            )}
            {textField('phone_number', 'tel', 'tel')}
            {isEdit && (
              <Field data-invalid={!!fieldError('status')}>
                <FieldLabel htmlFor="status">{t('users.fields.status')}</FieldLabel>
                <Select name="status" defaultValue={values.status ?? 'active'}>
                  <SelectTrigger id="status" className="w-full sm:w-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('users.status.active')}</SelectItem>
                    <SelectItem value="inactive">{t('users.status.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError>{fieldError('status')}</FieldError>
              </Field>
            )}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button variant="outline" asChild>
            <Link href={cancelHref}>{t('common.cancel')}</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t('common.saving') : t('common.save')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
