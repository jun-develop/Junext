'use client';

import { CheckIcon, CircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PASSWORD_RULES } from '@/core/password';
import { cn } from '@/lib/utils';

type PasswordRulesProps = { id: string; password: string; isInvalid: boolean };

// PasswordRules ticks off each password requirement as the user types.
export function PasswordRules({ id, password, isInvalid }: PasswordRulesProps) {
  const t = useTranslations('password.rules');
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
