'use client';

import { AlertCircleIcon, SaveIcon, ShieldPlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type FormEvent, startTransition, useActionState, useState } from 'react';
import { toast } from 'sonner';
import { FormSection, RequiredMark, SubmitButton } from '@/components/form-section';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { translateKey } from '@/core/i18n';
import { translateIssue } from '@/core/validation';
import type { RoleFormState } from '@/features/roles/actions';
import { toRoleCode } from '@/features/roles/role-code';
import type { RoleFormValues } from '@/features/roles/schemas';
import type { PermissionCode } from '@/lib/auth/session';
import { PermissionPicker } from './permission-picker';

type RoleFormProps = {
  action: (previous: RoleFormState, formData: FormData) => Promise<RoleFormState>;
  isEdit: boolean;
  header: { title: string; description: string; back: { href: string; label: string } };
  defaultValues?: RoleFormValues;
  grantable: readonly PermissionCode[];
};

export function RoleForm({ action, isEdit, header, defaultValues = {}, grantable }: RoleFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [code, setCode] = useState(defaultValues.code ?? '');
  const [isCodeEdited, setIsCodeEdited] = useState(isEdit);
  const [state, formAction, isPending] = useActionState(
    async (previous: RoleFormState, formData: FormData) => {
      const next = await action(previous, formData);
      if (next?.status === 'success') {
        toast.success(isEdit ? t('roles.updated') : t('roles.created'));
        router.push(`/roles/${next.uuid}`);
      }
      return next;
    },
    null,
  );

  // Submitting through onSubmit skips React's automatic form reset, which would clear the
  // permission checkboxes after a failed save.
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
  const fieldError = (field: string) => {
    const message = fieldErrors[field];
    return message ? translateIssue(message, t) : undefined;
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <PageHeader
        back={header.back}
        title={header.title}
        description={header.description}
        actions={
          <>
            <Button variant="outline" disabled={isPending} asChild>
              <Link href={header.back.href}>{t('common.cancel')}</Link>
            </Button>
            <SubmitButton
              isPending={isPending}
              icon={isEdit ? <SaveIcon /> : <ShieldPlusIcon />}
              label={isEdit ? t('common.save_changes') : t('roles.create')}
              pendingLabel={t('common.saving')}
            />
          </>
        }
      />

      <Card>
        <CardContent className="gap-8">
          {formError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>{t('common.error')}</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <FormSection
            title={t('roles.sections.general')}
            description={t('roles.sections.general_hint')}
          >
            <Field data-invalid={!!fieldError('name')} className="sm:col-span-2">
              <FieldLabel htmlFor="name">
                {t('roles.fields.name')} <RequiredMark />
              </FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={defaultValues.name}
                placeholder={t('roles.name_placeholder')}
                onChange={(event) => {
                  if (!isCodeEdited) {
                    setCode(toRoleCode(event.target.value));
                  }
                }}
                aria-invalid={!!fieldError('name')}
              />
              <FieldError>{fieldError('name')}</FieldError>
            </Field>
            <Field
              data-invalid={!!fieldError('code')}
              data-disabled={isEdit}
              className="sm:col-span-2"
            >
              <FieldLabel htmlFor="code">
                {t('roles.fields.code')} {!isEdit && <RequiredMark />}
              </FieldLabel>
              <Input
                id="code"
                name={isEdit ? undefined : 'code'}
                value={code}
                disabled={isEdit}
                placeholder="content_editor"
                className="font-mono"
                onChange={(event) => {
                  setIsCodeEdited(true);
                  setCode(event.target.value);
                }}
                aria-invalid={!!fieldError('code')}
              />
              {fieldError('code') ? (
                <FieldError>{fieldError('code')}</FieldError>
              ) : (
                <FieldDescription>
                  {isEdit ? t('roles.code_locked') : t('roles.code_hint')}
                </FieldDescription>
              )}
            </Field>
          </FormSection>

          <Separator />

          <FormSection
            title={t('roles.sections.permissions')}
            description={t('roles.sections.permissions_hint')}
          >
            <div className="sm:col-span-2">
              <PermissionPicker
                defaultSelected={defaultValues.permissions ?? []}
                grantable={grantable}
              />
              {fieldError('permissions') && (
                <FieldError className="mt-3">{fieldError('permissions')}</FieldError>
              )}
            </div>
          </FormSection>
        </CardContent>
      </Card>
    </form>
  );
}
