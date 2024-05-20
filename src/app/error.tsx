'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="text-center py-24">
      <h1 className="mb-5">Something went wrong!</h1>
      <h1 className="max-w-80 mx-auto">{error.message}</h1>

      <Button asChild className="mt-4">
        <Link href="/">Go Home</Link>
      </Button>
    </main>
  );
}
