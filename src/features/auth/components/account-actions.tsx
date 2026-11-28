'use client';

import { Loader2Icon, LogOutIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { ActionResult } from '@/core/api/action-error';
import { translateKey } from '@/core/i18n';
import { revokeSession, signOutOthers } from '@/features/auth/actions';

type ConfirmActionProps = {
  trigger: { label: string; variant: 'outline' | 'ghost'; size?: 'sm' };
  title: string;
  description: string;
  confirmLabel: string;
  successMessage?: string;
  run: () => Promise<ActionResult>;
};

// ConfirmAction asks before running a session action, then reports the result as a toast.
function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel,
  successMessage,
  run,
}: ConfirmActionProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await run();
      setIsOpen(false);
      if (result.status === 'error') {
        const reason = result.error.reason;
        toast.error(translateKey(t, `api_errors.${reason}`) ?? t('api_errors.unknown'));
        return;
      }
      if (successMessage) {
        toast.success(successMessage);
      }
    });
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={trigger.variant} size={trigger.size} className="text-destructive">
          <LogOutIcon />
          {trigger.label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('common.cancel')}</AlertDialogCancel>
          <Button variant="destructive" disabled={isPending} onClick={handleConfirm}>
            {isPending && <Loader2Icon className="animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// SignOutOthersButton ends every session except this one.
export function SignOutOthersButton() {
  const t = useTranslations('account');
  return (
    <ConfirmAction
      trigger={{ label: t('sign_out_others'), variant: 'outline' }}
      title={t('sign_out_others_title')}
      description={t('sign_out_others_description')}
      confirmLabel={t('sign_out_others')}
      successMessage={t('signed_out_others')}
      run={signOutOthers}
    />
  );
}

// RevokeSessionButton ends one session; on the current device it signs the user out.
export function RevokeSessionButton({
  familyUuid,
  isCurrent,
}: {
  familyUuid: string;
  isCurrent: boolean;
}) {
  const t = useTranslations('account');
  return (
    <ConfirmAction
      trigger={{ label: t('revoke'), variant: 'ghost', size: 'sm' }}
      title={isCurrent ? t('revoke_current_title') : t('revoke_title')}
      description={isCurrent ? t('revoke_current_description') : t('revoke_description')}
      confirmLabel={t('revoke')}
      successMessage={isCurrent ? undefined : t('revoked')}
      run={() => revokeSession(familyUuid)}
    />
  );
}
