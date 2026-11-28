import { MonitorIcon, SmartphoneIcon } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { ActiveSession } from '@/features/auth/data';
import { describeUserAgent } from '@/features/auth/user-agent';
import { RevokeSessionButton } from './account-actions';

// SessionsList shows where the user is signed in, newest device details first.
export function SessionsList({ sessions }: { sessions: ActiveSession[] }) {
  const t = useTranslations('account');
  const format = useFormatter();

  return (
    <ul className="divide-y rounded-md border">
      {sessions.map((session) => {
        const device = describeUserAgent(session.user_agent);
        const Icon = device.isMobile ? SmartphoneIcon : MonitorIcon;
        const name = [device.browser, device.system].filter(Boolean).join(' · ');
        return (
          <li key={session.family_uuid} className="flex items-center gap-4 p-4">
            <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md">
              <Icon className="text-muted-foreground size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{name || t('unknown_device')}</span>
                {session.current && <Badge variant="secondary">{t('this_device')}</Badge>}
              </div>
              <p className="text-muted-foreground truncate text-xs">
                {t('session_meta', {
                  ip: session.ip_address ?? '—',
                  started: format.relativeTime(new Date(session.created_at)),
                })}
              </p>
            </div>
            <RevokeSessionButton familyUuid={session.family_uuid} isCurrent={session.current} />
          </li>
        );
      })}
    </ul>
  );
}
