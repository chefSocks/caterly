"use client";

import { Button, Card } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card title="Something went wrong">
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </Card>
  );
}
