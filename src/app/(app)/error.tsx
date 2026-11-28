'use client';

import { ErrorState } from '@/components/error-state';

// AppError replaces a page that failed to render (Jungo down, rate-limited...) while the sidebar and
// header stay.
export default function AppError(props: { error: unknown; retry: () => void }) {
  return <ErrorState {...props} />;
}
