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
import { ROOMY_ITEM_CLASSES, ROOMY_MENU_CLASSES } from '@/components/menu-styles';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ActionResult } from '@/core/api/action-error';
import { translateKey } from '@/core/i18n';

type DeleteConfig = {
  action: () => Promise<ActionResult>;
  title: string;
  description: string;
  successMessage: string;
  redirectTo?: string;
};

type RowActionsProps = { viewHref?: string; editHref?: string; onDelete?: DeleteConfig };

// RowActions is the ⋯ menu of a record: view, edit and a confirmed delete. Omitted entries are hidden.
export function RowActions({ viewHref, editHref, onDelete }: RowActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!viewHref && !editHref && !onDelete) {
    return null;
  }

  function handleDelete(config: DeleteConfig) {
    startTransition(async () => {
      const result = await config.action();
      if (result.status === 'error') {
        const reason = result.error.reason;
        toast.error(translateKey(t, `api_errors.${reason}`) ?? t('api_errors.unknown'));
        return;
      }
      setIsConfirmOpen(false);
      toast.success(config.successMessage);
      if (config.redirectTo) {
        router.push(config.redirectTo);
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t('common.actions')}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={`w-44 ${ROOMY_MENU_CLASSES}`}>
          {viewHref && (
            <DropdownMenuItem className={ROOMY_ITEM_CLASSES} asChild>
              <Link href={viewHref}>
                <EyeIcon />
                {t('common.view')}
              </Link>
            </DropdownMenuItem>
          )}
          {editHref && (
            <DropdownMenuItem className={ROOMY_ITEM_CLASSES} asChild>
              <Link href={editHref}>
                <PencilIcon />
                {t('common.edit')}
              </Link>
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              {(viewHref || editHref) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className={ROOMY_ITEM_CLASSES}
                variant="destructive"
                onSelect={() => setIsConfirmOpen(true)}
              >
                <Trash2Icon />
                {t('common.delete')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {onDelete && (
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{onDelete.title}</AlertDialogTitle>
              <AlertDialogDescription>{onDelete.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>{t('common.cancel')}</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() => handleDelete(onDelete)}
              >
                {isPending ? t('common.deleting') : t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
