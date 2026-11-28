'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// GoBackButton returns to the previous page in the browser history.
export function GoBackButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <Button variant="outline" onClick={() => router.back()}>
      <ArrowLeftIcon />
      {label}
    </Button>
  );
}
