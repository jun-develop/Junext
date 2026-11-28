'use client';

import { AlertCircleIcon, CheckIcon, CircleIcon, SaveIcon, UserPlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type FormEvent, startTransition, useActionState, useState } from 'react';
import { toast } from 'sonner';
import { FormSection, RequiredMark, SubmitButton } from '@/components/form-section';
import { PageHeader } from '@/components/page-header';
import { PasswordInput } from '@/components/password-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { translateKey } from '@/core/i18n';
import { translateIssue } from '@/core/validation';
import type { UserFormState } from '@/features/users/actions';
import { PASSWORD_RULES } from '@/features/users/schemas';
import { cn } from '@/lib/utils';
import { AvatarField } from './avatar-field';

type RoleOption = { uuid: string; name: string; permissions: readonly string[] };

type UserFormProps = {
  action: (previous: UserFormState, formData: FormData) => Promise<UserFormState>;
  isEdit: boolean;
  header: { title: string; description: string; back: { href: string; label: string } };
  defaultValues?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    status?: 'active' | 'inactive';
    avatar_url?: string | null;
    role_uuids?: string[];
  };
  // null when the admin may not assign roles.
  roleOptions: RoleOption[] | null;
  isSelf: boolean;
};

export function UserForm({
  action,
  isEdit,
  header,
  defaultValues = {},
  roleOptions,
  isSelf,
}: UserFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [state, formAction, isPending] = useActionState(
    async (previous: UserFormState, formData: FormData) => {
      const next = await action(previous, formData);
      if (next?.status === 'success') {
        if (next.warning) {
          const detail = translateKey(t, `api_errors.${next.warning}`) ?? t('api_errors.unknown');
          toast.warning(t('users.saved_with_warning', { detail }));
        } else {
          toast.success(isEdit ? t('users.updated') : t('users.created'));
        }
        router.push(`/users/${next.uuid}`);
      }
      return next;
    },
    null,
  );

  // Submitting through onSubmit skips React's automatic form reset, so a failed save keeps every
  // field, checkbox and picked avatar as the admin left them.
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
  const initials =
    `${defaultValues.first_name?.charAt(0) ?? ''}${defaultValues.last_name?.charAt(0) ?? ''}`.toUpperCase();

  const textField = (
    name: 'first_name' | 'last_name' | 'email' | 'phone_number',
    options: {
      type?: string;
      autoComplete?: string;
      placeholder: string;
      isRequired?: boolean;
      isWide?: boolean;
    },
  ) => (
    <Field data-invalid={!!fieldError(name)} className={cn(options.isWide && 'sm:col-span-2')}>
      <FieldLabel htmlFor={name}>
        {t(`users.fields.${name}`)} {options.isRequired && <RequiredMark />}
      </FieldLabel>
      <Input
        id={name}
        name={name}
        type={options.type ?? 'text'}
        autoComplete={options.autoComplete ?? 'off'}
        placeholder={options.placeholder}
        defaultValue={defaultValues[name]}
        aria-invalid={!!fieldError(name)}
      />
      <FieldError>{fieldError(name)}</FieldError>
    </Field>
  );

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
              icon={isEdit ? <SaveIcon /> : <UserPlusIcon />}
              label={isEdit ? t('common.save_changes') : t('users.create')}
              pendingLabel={t('common.saving')}
            />
          </>
        }
      />

      <Card>
        <CardContent className="space-y-8">
          {formError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>{t('common.error')}</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <FormSection
            title={t('users.sections.account')}
            description={t('users.sections.account_hint')}
          >
            {isEdit ? (
              <Field data-disabled className="sm:col-span-2">
                <FieldLabel htmlFor="email">{t('users.fields.email')}</FieldLabel>
                <Input id="email" defaultValue={defaultValues.email} disabled />
                <FieldDescription>{t('users.email_locked')}</FieldDescription>
              </Field>
            ) : (
              textField('email', {
                type: 'email',
                placeholder: 'name@company.com',
                isRequired: true,
                isWide: true,
              })
            )}
            {!isEdit && (
              <>
                <Field data-invalid={!!fieldError('password')}>
                  <FieldLabel htmlFor="password">
                    {t('users.fields.password')} <RequiredMark />
                  </FieldLabel>
                  <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder={t('users.password_placeholder')}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={!!fieldError('password')}
                    aria-describedby="password-rules"
                  />
                </Field>
                <Field data-invalid={!!fieldError('confirm_password')}>
                  <FieldLabel htmlFor="confirm_password">
                    {t('users.fields.confirm_password')} <RequiredMark />
                  </FieldLabel>
                  <PasswordInput
                    id="confirm_password"
                    name="confirm_password"
                    autoComplete="new-password"
                    placeholder={t('users.confirm_password_placeholder')}
                    aria-invalid={!!fieldError('confirm_password')}
                  />
                  <FieldError>{fieldError('confirm_password')}</FieldError>
                </Field>
                <PasswordRules
                  id="password-rules"
                  password={password}
                  isInvalid={!!fieldError('password')}
                />
              </>
            )}
          </FormSection>

          <Separator />

          <FormSection
            title={t('users.sections.profile')}
            description={t('users.sections.profile_hint')}
          >
            {textField('first_name', {
              autoComplete: 'given-name',
              placeholder: t('users.first_name_placeholder'),
              isRequired: true,
            })}
            {textField('last_name', {
              autoComplete: 'family-name',
              placeholder: t('users.last_name_placeholder'),
              isRequired: true,
            })}
            {textField('phone_number', {
              type: 'tel',
              autoComplete: 'tel',
              placeholder: '+84901234567',
            })}
            <Field data-invalid={!!fieldError('avatar')} className="sm:col-span-2">
              <FieldLabel htmlFor="avatar">{t('users.fields.avatar')}</FieldLabel>
              <AvatarField
                currentUrl={defaultValues.avatar_url ?? null}
                initials={initials}
                isInvalid={!!fieldError('avatar')}
              />
              <FieldError>{fieldError('avatar')}</FieldError>
            </Field>
          </FormSection>

          <Separator />

          <FormSection
            title={t('users.sections.access')}
            description={t('users.sections.access_hint')}
          >
            <RolePicker
              options={roleOptions}
              selected={defaultValues.role_uuids ?? []}
              isSelf={isSelf}
              error={fieldError('role_uuids')}
            />
            <Field data-invalid={!!fieldError('status')} data-disabled={isSelf}>
              <FieldLabel htmlFor="status">{t('users.fields.status')}</FieldLabel>
              <Select
                name="status"
                defaultValue={defaultValues.status ?? 'active'}
                disabled={isSelf}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('users.status.active')}</SelectItem>
                  <SelectItem value="inactive">{t('users.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
              {isSelf && <FieldDescription>{t('users.self_status_locked')}</FieldDescription>}
              <FieldError>{fieldError('status')}</FieldError>
            </Field>
          </FormSection>
        </CardContent>
      </Card>
    </form>
  );
}

type RolePickerProps = {
  options: RoleOption[] | null;
  selected: string[];
  isSelf: boolean;
  error: string | undefined;
};

// RolePicker ticks the user's roles. It adds assign_roles only when the roles are editable, so the
// action leaves roles alone otherwise.
function RolePicker({ options, selected, isSelf, error }: RolePickerProps) {
  const t = useTranslations('users');
  if (!options) {
    return (
      <Field className="sm:col-span-2">
        <FieldLabel>{t('fields.roles')}</FieldLabel>
        <FieldDescription>{t('roles_no_permission')}</FieldDescription>
      </Field>
    );
  }
  return (
    <Field data-invalid={!!error} className="sm:col-span-2">
      <FieldLabel>{t('fields.roles')}</FieldLabel>
      {!isSelf && <input type="hidden" name="assign_roles" value="1" />}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((role) => (
          <label
            key={role.uuid}
            className={cn(
              'has-data-[state=checked]:border-primary has-data-[state=checked]:bg-muted/50 flex items-start gap-3 rounded-md border p-3 transition-colors',
              isSelf ? 'cursor-not-allowed opacity-60' : 'hover:bg-muted/30 cursor-pointer',
            )}
          >
            <Checkbox
              name="role_uuids"
              value={role.uuid}
              defaultChecked={selected.includes(role.uuid)}
              disabled={isSelf}
              className="mt-0.5"
            />
            <span className="grid gap-0.5">
              <span className="text-sm font-medium">{role.name}</span>
              <span className="text-muted-foreground text-xs">
                {t('role_permission_count', { count: role.permissions.length })}
              </span>
            </span>
          </label>
        ))}
      </div>
      <FieldDescription>{isSelf ? t('self_roles_locked') : t('roles_hint')}</FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  );
}

// PasswordRules ticks off each password requirement as the user types.
function PasswordRules({
  id,
  password,
  isInvalid,
}: {
  id: string;
  password: string;
  isInvalid: boolean;
}) {
  const t = useTranslations('users.password_rules');
  return (
    <ul id={id} className="grid gap-1.5 text-sm sm:col-span-2 sm:grid-cols-2">
      {PASSWORD_RULES.map((rule) => {
        const isMet = rule.pattern.test(password);
        const Icon = isMet ? CheckIcon : CircleIcon;
        const tone = isInvalid ? 'text-destructive' : 'text-muted-foreground';
        return (
          <li
            key={rule.key}
            className={cn('flex items-center gap-2', isMet ? 'text-success' : tone)}
          >
            <Icon className="size-4" aria-hidden />
            {t(rule.key)}
          </li>
        );
      })}
    </ul>
  );
}
