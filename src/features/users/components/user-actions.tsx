'use client';

import { EyeIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { translateKey } from '@/core/i18n';
import { deleteUser } from '@/features/users/actions';

type UserActionsProps = {
  user: { uuid: string; email: string };
  canUpdate: boolean;
  canDelete: boolean;
  showView?: boolean;
  afterDeleteHref?: string;
};

export function UserActions({
  user,
  canUpdate,
  canDelete,
  showView = true,
  afterDeleteHref,
}: UserActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser(user.uuid);
      if (result.status === 'error') {
        const reason = result.error.reason;
        toast.error(translateKey(t, `api_errors.${reason}`) ?? t('api_errors.unknown'));
        return;
      }
      setIsConfirmOpen(false);
      toast.success(t('users.deleted'));
      if (afterDeleteHref) {
        router.push(afterDeleteHref);
      }
    });
  }

  if (!showView && !canUpdate && !canDelete) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t('common.actions')}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {showView && (
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.uuid}`}>
                <EyeIcon />
                {t('common.view')}
              </Link>
            </DropdownMenuItem>
          )}
          {canUpdate && (
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.uuid}/edit`}>
                <PencilIcon />
                {t('common.edit')}
              </Link>
            </DropdownMenuItem>
          )}
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setIsConfirmOpen(true)}>
                <Trash2Icon />
                {t('common.delete')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.delete_description', { email: user.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t('common.cancel')}</AlertDialogCancel>
            <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
              {isPending ? t('common.deleting') : t('common.delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
