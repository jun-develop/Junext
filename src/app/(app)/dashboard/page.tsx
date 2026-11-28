import {
  ArrowRightIcon,
  KeyRoundIcon,
  type LucideIcon,
  MonitorSmartphoneIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AuditLogsTable } from '@/features/audit-logs/components/audit-logs-table';
import { listAuditLogs } from '@/features/audit-logs/data';
import { listSessions } from '@/features/auth/data';
import { listAllRoles } from '@/features/roles/data';
import { listUsers } from '@/features/users/data';
import { userListQuerySchema } from '@/features/users/schemas';
import { requireSession } from '@/lib/auth/session';

const RECENT_ACTIVITY_SIZE = 5;

type StatCardProps = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  href?: string;
};

function StatCard({ label, value, hint, icon: Icon, href }: StatCardProps) {
  return (
    <Card className="gap-2">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardAction>
          <Icon className="text-muted-foreground size-4" />
        </CardAction>
      </CardHeader>
      <CardContent className="gap-1">
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
        {href ? (
          <Link
            href={href}
            className="text-muted-foreground text-xs underline-offset-4 hover:underline"
          >
            {hint}
          </Link>
        ) : (
          <p className="text-muted-foreground text-xs">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await requireSession();
  const can = (permission: 'users:read' | 'roles:read' | 'audit_logs:read') =>
    session.permissions.includes(permission);
  // Each figure loads only when the user may see it; Jungo would refuse the call otherwise.
  const [t, users, roles, sessions, activity] = await Promise.all([
    getTranslations('dashboard'),
    can('users:read') ? listUsers(userListQuerySchema.parse({})) : null,
    can('roles:read') ? listAllRoles() : null,
    listSessions(),
    can('audit_logs:read') ? listAuditLogs({ page_size: RECENT_ACTIVITY_SIZE }) : null,
  ]);

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('greeting', { name: session.user.first_name })}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {users && (
          <StatCard
            label={t('users')}
            value={users.pagination.total_items}
            hint={t('view_users')}
            icon={UsersIcon}
            href="/users"
          />
        )}
        {roles && (
          <StatCard
            label={t('roles')}
            value={roles.length}
            hint={t('system_roles', { count: roles.filter((role) => role.is_system).length })}
            icon={ShieldCheckIcon}
            href="/roles"
          />
        )}
        <StatCard
          label={t('sessions')}
          value={sessions.length}
          hint={t('manage_sessions')}
          icon={MonitorSmartphoneIcon}
          href="/account"
        />
        <StatCard
          label={t('permissions')}
          value={session.permissions.length}
          hint={t('permissions_hint')}
          icon={KeyRoundIcon}
        />
      </div>

      {activity && (
        <Card>
          <CardHeader>
            <CardTitle>{t('recent_activity')}</CardTitle>
            <CardDescription>{t('recent_activity_hint')}</CardDescription>
            <CardAction>
              <Button variant="outline" size="sm" asChild>
                <Link href="/audit-logs">
                  {t('view_all')}
                  <ArrowRightIcon />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <AuditLogsTable logs={activity.items} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('your_permissions')}</CardTitle>
          <CardDescription>{t('your_permissions_hint')}</CardDescription>
        </CardHeader>
        <CardContent className="flex-row flex-wrap gap-1.5">
          {session.permissions.map((permission) => (
            <Badge key={permission} variant="outline" className="font-mono">
              {permission}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
