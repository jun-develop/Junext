'use client';

import { LockIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ALL_PERMISSIONS, groupPermissions } from '@/features/roles/permissions';
import type { PermissionCode } from '@/lib/auth/session';
import { cn } from '@/lib/utils';

type PermissionPickerProps = {
  defaultSelected: readonly string[];
  grantable: readonly PermissionCode[];
};
type CheckState = boolean | 'indeterminate';

const GROUPS = groupPermissions(ALL_PERMISSIONS);
// ui/checkbox only draws a tick. For "select all" boxes, a partial selection fills the box and draws a
// dash instead (arbitrary variants: Radix marks it data-state="indeterminate").
const SELECT_ALL_CLASSES =
  'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:[&_svg]:hidden data-[state=indeterminate]:before:h-0.5 data-[state=indeterminate]:before:w-2 data-[state=indeterminate]:before:rounded-full data-[state=indeterminate]:before:bg-current';

// checkState is the tick of a "select all" box: on, off, or partly selected.
function checkState(
  permissions: readonly PermissionCode[],
  selected: Set<PermissionCode>,
): CheckState {
  const count = permissions.filter((permission) => selected.has(permission)).length;
  if (count === 0) {
    return false;
  }
  return count === permissions.length ? true : 'indeterminate';
}

// PermissionPicker lets the user tick permissions one by one, per module, or all at once. It submits
// the selection as repeated hidden "permissions" fields. Permissions the user does not hold stay
// locked, because Jungo refuses to grant them; a locked permission the role already has is kept.
export function PermissionPicker({ defaultSelected, grantable }: PermissionPickerProps) {
  const t = useTranslations('roles');
  const [selected, setSelected] = useState(
    () => new Set(ALL_PERMISSIONS.filter((permission) => defaultSelected.includes(permission))),
  );

  function setPermissions(permissions: readonly PermissionCode[], isOn: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const permission of permissions.filter((code) => grantable.includes(code))) {
        if (isOn) {
          next.add(permission);
        } else {
          next.delete(permission);
        }
      }
      return next;
    });
  }

  const allState = checkState(ALL_PERMISSIONS, selected);

  return (
    <div className="space-y-4">
      <div className="bg-muted/40 flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
          <Checkbox
            className={SELECT_ALL_CLASSES}
            checked={allState}
            onCheckedChange={() => setPermissions(ALL_PERMISSIONS, allState !== true)}
          />
          {t('select_all')}
        </label>
        <span className="text-muted-foreground text-sm">
          {t('selected_count', { count: selected.size, total: ALL_PERMISSIONS.length })}
        </span>
      </div>

      {GROUPS.map((group) => {
        const groupState = checkState(group.permissions, selected);
        const groupCount = group.permissions.filter((permission) =>
          selected.has(permission),
        ).length;
        return (
          <fieldset key={group.resource} className="space-y-4 rounded-md border p-4">
            <legend className="sr-only">{t(`resources.${group.resource}`)}</legend>
            <div className="flex items-center justify-between gap-4 border-b pb-3">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  className={SELECT_ALL_CLASSES}
                  checked={groupState}
                  onCheckedChange={() => setPermissions(group.permissions, groupState !== true)}
                  aria-label={t('select_module', { module: t(`resources.${group.resource}`) })}
                />
                <span className="text-sm font-semibold">{t(`resources.${group.resource}`)}</span>
                <span className="text-muted-foreground hidden text-xs sm:inline">
                  {t(`resource_hints.${group.resource}`)}
                </span>
              </label>
              <Badge variant={groupCount > 0 ? 'secondary' : 'outline'}>
                {groupCount}/{group.permissions.length}
              </Badge>
            </div>
            <div className="grid gap-4 pl-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.permissions.map((permission) => {
                const isLocked = !grantable.includes(permission);
                return (
                  <label
                    key={permission}
                    className={cn(
                      'flex items-center gap-3 text-sm',
                      isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                    )}
                  >
                    <Checkbox
                      checked={selected.has(permission)}
                      disabled={isLocked}
                      onCheckedChange={(isOn) => setPermissions([permission], isOn === true)}
                    />
                    <span>{t(`permissions.${permission}`)}</span>
                    {isLocked && (
                      <LockIcon
                        className="text-muted-foreground size-3.5"
                        aria-label={t('locked')}
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {[...selected].map((permission) => (
        <input key={permission} type="hidden" name="permissions" value={permission} />
      ))}
    </div>
  );
}
