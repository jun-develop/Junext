import { Skeleton } from '@/components/ui/skeleton';

const ROWS = Array.from({ length: 8 }, (_, index) => index);

export default function AuditLogsLoading() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-9 w-full sm:max-w-sm" />
      <div className="bg-card space-y-3 rounded-xl border p-4">
        {ROWS.map((row) => (
          <div key={row} className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </>
  );
}
