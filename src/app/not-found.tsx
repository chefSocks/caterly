import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <Card title="Not found">
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
        That record doesn’t exist (or was deleted).
      </p>
      <Link href="/">
        <Button>Back to dashboard</Button>
      </Link>
    </Card>
  );
}
