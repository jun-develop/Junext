'use client';

import { ErrorState } from '@/components/error-state';

// RootError catches what the app layout itself throws, such as the session check failing when Jungo
// is unreachable, so the visitor still gets a translated page with a retry.
export default function RootError(props: { error: unknown; retry: () => void }) {
  return (
    <main className="flex min-h-svh p-6">
      <ErrorState {...props} />
    </main>
  );
}
